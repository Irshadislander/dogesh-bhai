<template>
  <article class="overflow-hidden rounded-2xl bg-[#0D2C30] text-white shadow-lg ring-1 ring-[#0f3940]">
    <div class="p-4 space-y-3">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <button
            v-if="post.dogId && post.dogName"
            class="flex items-center gap-3 text-left"
            @click="goToDog"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#10444b] text-lg font-bold uppercase overflow-hidden">
              <img v-if="post.dogAvatarUrl" :src="post.dogAvatarUrl" alt="Dog avatar" class="h-full w-full object-cover" loading="lazy" />
              <span v-else>{{ avatarInitial }}</span>
            </div>
            <div>
              <p class="text-sm font-semibold text-white">{{ post.dogName }}</p>
              <p class="text-xs text-[#c0d8d4]">
                <span v-if="post.dogBreed">{{ post.dogBreed }} • </span>@{{ usernameHandle }}
              </p>
              <p class="text-xs text-[#9ac0ba]">{{ timeAgo(post.createdAt) }}</p>
            </div>
          </button>
          <div v-else>
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#10444b] text-lg font-bold uppercase">
              {{ avatarInitial }}
            </div>
            <div>
              <p class="text-sm font-semibold text-white">{{ post.authorName || "Anonymous Bhai" }}</p>
              <p class="text-xs text-[#9ac0ba]">{{ timeAgo(post.createdAt) }}</p>
            </div>
          </div>
        </div>
        <button class="rounded-full p-2 text-white/70 hover:bg-white/10" aria-label="More actions">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6h.01M12 12h.01M12 18h.01" />
          </svg>
        </button>
      </div>

      <div v-if="post.mediaUrl" class="relative overflow-hidden rounded-xl border border-[#114046]" @dblclick="handleDoubleLike">
        <img
          :src="post.mediaUrl"
          alt="Post media"
          class="h-full w-full max-h-[500px] object-cover"
          loading="lazy"
        />
        <transition name="fade-scale">
          <div v-if="showHeart" class="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div class="text-6xl text-[#F6A623] opacity-80">❤️</div>
          </div>
        </transition>
      </div>

      <div class="space-y-2">
        <p
          class="text-sm text-white/90"
          :class="{
            'line-clamp-2': !expanded,
          }"
        >
          <template v-for="(chunk, idx) in parsedCaption" :key="idx">
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
        <button
          v-if="post.content && post.content.length > 120"
          type="button"
          class="text-xs font-semibold text-[#F6A623] hover:underline"
          @click="expanded = !expanded"
        >
          {{ expanded ? "Less" : "More" }}
        </button>
      </div>

      <div class="flex items-center justify-between pt-2">
        <div class="flex items-center gap-3 text-sm text-white/80">
          <button
            type="button"
            class="flex items-center gap-1 rounded-full bg-white/5 px-3 py-2 hover:bg-white/10"
            @click="triggerLike"
          >
            ❤️ <span>{{ likeDisplay }}</span>
          </button>
          <a class="flex items-center gap-1 rounded-full bg-white/5 px-3 py-2 hover:bg-white/10" href="#comments">
            💬 Comment
          </a>
          <button
            type="button"
            class="flex items-center gap-1 rounded-full bg-white/5 px-3 py-2 hover:bg-white/10"
            @click="handleShare('copy')"
          >
            🔗 Share
          </button>
          <LikeButton
            ref="likeButtonRef"
            :post-id="post.id"
            :initial-count="post.likes ?? 0"
            :post-author-id="post.authorId"
            class="hidden"
          />
        </div>
        <button
          type="button"
          class="rounded-full bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
        >
          🔖 Save
        </button>
      </div>
      <span class="share-feedback text-xs text-[#9ac0ba]">{{ feedback }}</span>
    </div>

    <div class="border-t border-white/10 bg-[#0b2429] p-4">
      <CommentList :post-id="post.id" />
      <CommentInput :post-id="post.id" class="mt-3" />
    </div>
  </article>
</template>

<script setup lang="ts">
import LikeButton from "./LikeButton.vue";
import CommentList from "./CommentList.vue";
import CommentInput from "./CommentInput.vue";
import { RouterLink } from "vue-router";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, doc, increment, serverTimestamp, updateDoc } from "firebase/firestore";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

type FeedPost = {
  id: string;
  content: string;
  mediaUrl?: string;
  authorName?: string;
  authorId?: string;
  createdAt?: any;
  likes?: number;
  type?: string;
  dogId?: string;
  dogName?: string;
  dogAvatarUrl?: string;
  dogBreed?: string;
};

const props = defineProps<{
  post: FeedPost;
}>();

const router = useRouter();

const feedback = ref("");
const likeDelta = ref(0);
const showHeart = ref(false);
const expanded = ref(false);
const likeButtonRef = ref<InstanceType<typeof LikeButton> | null>(null);
const avatarInitial = computed(() => (props.post.authorName || "B")[0]?.toUpperCase?.() || "B");
const usernameHandle = computed(() => (props.post.authorName || "bhai").replace(/\s+/g, "").toLowerCase());
const likeDisplay = computed(() => (props.post.likes ?? 0) + likeDelta.value);
const parsedCaption = computed(() => {
  const text = props.post.content || "";
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
});

const handleShare = async (mode: "copy" | "repost") => {
  if (mode === "copy") {
    const link = `${window.location.origin}/feed#${props.post.id}`;
    try {
      await navigator.clipboard.writeText(link);
      feedback.value = "Link copied!";
      return;
    } catch (err) {
      console.error("Copy failed", err);
    }
  }
  if (mode === "repost") {
    try {
      const user = auth.currentUser;
      const postsCol = collection(db, "posts");
      await addDoc(postsCol, {
        content: props.post.content,
        mediaUrl: props.post.mediaUrl || "",
        authorId: user?.uid || "",
        authorName: user?.displayName || user?.email || "Anonymous Bhai",
        originalPostId: props.post.id,
        createdAt: serverTimestamp(),
      });
      feedback.value = "Reposted!";
    } catch (err) {
      console.error("Failed to repost", err);
      feedback.value = "Repost failed";
    }
  }
};

const triggerLike = async () => {
  if (likeButtonRef.value?.like) {
    await likeButtonRef.value.like();
    likeDelta.value += 1;
  } else {
    try {
      const postRef = doc(db, "posts", props.post.id);
      await updateDoc(postRef, { likes: increment(1) });
      likeDelta.value += 1;
    } catch (err) {
      console.error("Double-like failed", err);
    }
  }
};

const handleDoubleLike = async () => {
  showHeart.value = true;
  setTimeout(() => (showHeart.value = false), 600);
  await triggerLike();
};

const timeAgo = (ts?: any) => {
  if (!ts || typeof ts.toDate !== "function") return "";
  const diff = Date.now() - ts.toDate().getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const days = Math.floor(hr / 24);
  return `${days}d`;
};

const goToDog = () => {
  if (props.post.dogId) {
    router.push({ name: "DogProfile", params: { dogId: props.post.dogId } });
  }
};
</script>

<style scoped>
.share-feedback {
  min-height: 1rem;
}
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
