<template>
  <main class="min-h-screen bg-[#04343A] text-white">
    <div class="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 sm:px-6">
      <CreatePost @created="handleCreated" />
      <TrendingHashtags post-type="reel" />
    </div>

    <div class="h-screen snap-y snap-mandatory overflow-y-scroll">
      <div
        v-if="loading"
        class="flex h-screen items-center justify-center px-4"
      >
        <div class="w-full max-w-sm space-y-3 rounded-3xl bg-white/5 p-4 shadow-lg ring-1 ring-white/10 animate-pulse">
          <div class="h-8 w-24 rounded bg-white/10"></div>
          <div class="h-[60vh] rounded-2xl bg-white/10"></div>
          <div class="h-4 w-3/4 rounded bg-white/10"></div>
        </div>
      </div>

      <div v-else-if="errorMessage" class="h-screen flex items-center justify-center text-sm text-red-300 px-4">
        {{ errorMessage }}
      </div>

      <div
        v-else-if="reels.length === 0"
        class="h-screen flex items-center justify-center px-4 text-sm text-white/80"
      >
        No reels yet — share a video to start.
      </div>

      <div v-else>
        <div
          v-for="(reel, idx) in reels"
          :key="reel.id"
          class="snap-start flex min-h-screen items-center justify-center"
          :ref="(el) => setReelRef(el, idx)"
        >
          <article class="relative flex w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-[#0D2C30] shadow-xl ring-1 ring-[#0f3940]">
            <div class="relative bg-black" @click="handleTap(reel, idx)">
              <video
                v-if="reel.videoUrl"
                :src="reel.videoUrl"
                class="h-full w-full aspect-[9/16] object-cover"
                autoplay
                :muted="mutedState[reel.id] ?? true"
                loop
                playsinline
                preload="metadata"
                :ref="(el) => setVideoRef(el, idx)"
              ></video>
              <div v-else class="aspect-[9/16] p-6 text-center text-sm text-white/70">No video URL provided.</div>
              <transition name="fade-scale">
                <div v-if="showHeartState[reel.id]" class="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div class="text-6xl text-[#F6A623] opacity-80">❤️</div>
                </div>
              </transition>
              <div class="pointer-events-none absolute inset-0 flex items-start justify-end p-3">
                <div class="pointer-events-auto flex flex-col items-center gap-2 rounded-xl bg-black/30 p-2">
                  <button class="text-sm text-white/80" @click.stop="toggleMute(reel.id, videoRefs[idx])">
                    {{ (mutedState[reel.id] ?? true) ? "🔇" : "🔊" }}
                  </button>
                </div>
              </div>
            </div>
            <div class="pointer-events-none absolute inset-0 flex items-end justify-between p-4">
              <div class="pointer-events-auto max-w-[70%] space-y-1 rounded-xl bg-black/40 p-3">
                <button
                  v-if="reel.dogId && reel.dogName"
                  class="text-left text-sm font-semibold text-white hover:text-[#F6A623]"
                  @click="goToDog(reel.dogId)"
                >
                  {{ reel.dogName }}
                </button>
                <RouterLink
                  v-else-if="reel.authorId"
                  :to="`/profile/${reel.authorId}`"
                  class="text-sm font-semibold text-white hover:text-[#F6A623]"
                >
                  {{ reel.authorName || "Anonymous Bhai" }}
                </RouterLink>
                <p v-else class="text-sm font-semibold text-white">{{ reel.authorName || "Anonymous Bhai" }}</p>
                <p class="text-xs text-white/80 line-clamp-2">
                  <template v-for="(chunk, i2) in parseCaption(reel.content || '')" :key="i2">
                    <RouterLink
                      v-if="chunk.isTag"
                      :to="`/hashtags/${chunk.tag}`"
                      class="text-[#F6A623] hover:underline"
                    >
                      #{{ chunk.tag }}
                    </RouterLink>
                    <span v-else>{{ chunk.text }}</span>
                  </template>
                </p>
              </div>
              <div class="pointer-events-auto flex flex-col items-center gap-3 rounded-xl bg-black/30 p-2">
                <LikeButton :post-id="reel.id" :initial-count="reel.likes ?? 0" :post-author-id="reel.authorId" />
                <button class="text-sm text-white/80" @click.stop="activeCommentsId = reel.id">💬</button>
                <button class="text-sm text-white/80" @click.stop="activeShareReel = reel">🔗</button>
              </div>
            </div>
            <div class="border-t border-white/10 bg-[#0b2429] p-4">
              <CommentList :post-id="reel.id" />
              <CommentInput :post-id="reel.id" class="mt-3" />
            </div>
          </article>
        </div>
      </div>
    </div>
    <ReelCommentsOverlay :open="!!activeCommentsId" :post-id="activeCommentsId" @close="activeCommentsId = null" />
    <ReelSharePanel :open="!!activeShareReel" :link="shareLink" @close="activeShareReel = null" />
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, nextTick, computed } from "vue";
import { collection, onSnapshot, orderBy, query, where, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import CreatePost from "@/components/social/CreatePost.vue";
import CommentList from "@/components/social/CommentList.vue";
import CommentInput from "@/components/social/CommentInput.vue";
import LikeButton from "@/components/social/LikeButton.vue";
import { RouterLink } from "vue-router";
import { useRouter } from "vue-router";
import ReelCommentsOverlay from "@/components/social/ReelCommentsOverlay.vue";
import ReelSharePanel from "@/components/social/ReelSharePanel.vue";
import TrendingHashtags from "@/components/social/TrendingHashtags.vue";

type Reel = {
  id: string;
  content: string;
  videoUrl?: string;
  authorName?: string;
  authorId?: string;
  createdAt?: any;
  likes?: number;
  dogId?: string;
  dogName?: string;
  dogAvatarUrl?: string;
  dogBreed?: string;
};

const reels = ref<Reel[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);
let unsub: (() => void) | null = null;
const reelRefs = ref<HTMLElement[]>([]);
const videoRefs = ref<HTMLVideoElement[]>([]);
let observer: IntersectionObserver | null = null;
const router = useRouter();
const mutedState = ref<Record<string, boolean>>({});
const pauseState = ref<Record<string, boolean>>({});
const showHeartState = ref<Record<string, boolean>>({});
const lastTapTime = ref<number>(0);
const activeCommentsId = ref<string | null>(null);
const activeShareReel = ref<Reel | null>(null);
const shareLink = computed(() =>
  activeShareReel.value ? `${typeof window !== "undefined" ? window.location.origin : ""}/feed/reels#${activeShareReel.value.id}` : ""
);

onMounted(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  try {
    const postsCol = collection(db, "posts");
    const q = query(postsCol, where("type", "==", "reel"), orderBy("createdAt", "desc"));
    unsub = onSnapshot(
      q,
      (snapshot) => {
        reels.value = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
        reels.value.forEach((r) => {
          if (mutedState.value[r.id] === undefined) mutedState.value[r.id] = true;
        });
        loading.value = false;
        nextTick(setupObserver);
      },
      (err) => {
        console.error("Failed to load reels", err);
        errorMessage.value = "Failed to load reels.";
        loading.value = false;
      }
    );
  } catch (err) {
    console.error("Failed to load reels", err);
    errorMessage.value = "Failed to load reels.";
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (unsub) unsub();
  if (observer) observer.disconnect();
});

const handleCreated = () => {
  // snapshot listener updates automatically
};

const formatDate = (ts?: any) => {
  if (!ts || typeof ts.toDate !== "function") return "";
  return ts.toDate().toLocaleString();
};

const setupObserver = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = reelRefs.value.findIndex((el) => el === entry.target);
        const video = videoRefs.value[idx];
        if (!video) return;
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: [0.3, 0.6, 1] }
  );

  reelRefs.value.forEach((el) => {
    if (el) observer?.observe(el);
  });
};

const setReelRef = (el: any, idx: number) => {
  if (el instanceof HTMLElement) reelRefs.value[idx] = el;
};

const setVideoRef = (el: any, idx: number) => {
  if (el instanceof HTMLVideoElement) videoRefs.value[idx] = el;
};

const goToDog = (dogId?: string) => {
  if (dogId) router.push({ name: "DogProfile", params: { dogId } });
};

const toggleMute = (id: string, video?: HTMLVideoElement) => {
  const current = mutedState.value[id] ?? true;
  const next = !current;
  mutedState.value[id] = next;
  if (video) video.muted = next;
};

const togglePlay = (id: string, video?: HTMLVideoElement) => {
  if (!video) return;
  if (video.paused) {
    video.play().catch(() => {});
    pauseState.value[id] = false;
  } else {
    video.pause();
    pauseState.value[id] = true;
  }
};

const handleDoubleTap = async (reel: Reel) => {
  showHeartState.value[reel.id] = true;
  setTimeout(() => (showHeartState.value[reel.id] = false), 600);
  try {
    const postRef = doc(db, "posts", reel.id);
    await updateDoc(postRef, { likes: increment(1) });
  } catch (err) {
    console.error("Failed to like reel", err);
  }
};

const handleTap = (reel: Reel, idx: number) => {
  const now = Date.now();
  if (now - lastTapTime.value < 300) {
    handleDoubleTap(reel);
  } else {
    const video = videoRefs.value[idx];
    togglePlay(reel.id, video);
  }
  lastTapTime.value = now;
};

const parseCaption = (text: string) => {
  const regex = /#(\w+)/g;
  const parts: { isTag: boolean; text?: string; tag?: string }[] = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ isTag: false, text: text.slice(lastIndex, match.index) });
    }
    parts.push({ isTag: true, tag: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ isTag: false, text: text.slice(lastIndex) });
  }
  return parts;
};

const handleKeyNav = (e: KeyboardEvent) => {
  if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(e.key)) return;
  e.preventDefault();
  const direction = e.key === "ArrowDown" || e.key === "PageDown" ? 1 : -1;
  const activeIndex = reelRefs.value.findIndex((el) => el && el.getBoundingClientRect().top >= 0 && el.getBoundingClientRect().top < window.innerHeight);
  const target = reelRefs.value[activeIndex + direction];
  if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyNav, { passive: false });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyNav);
});
</script>
