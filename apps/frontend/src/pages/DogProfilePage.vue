<template>
  <main class="min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <section class="relative h-56 bg-gradient-to-br from-[#04343A] to-[#0c4f58] text-white">
      <div class="mx-auto flex h-full max-w-5xl flex-col justify-end px-6 pb-6">
        <div class="flex items-end gap-4">
          <div class="relative -mb-12 h-28 w-28 rounded-full border-4 border-white/80 bg-white shadow-lg overflow-hidden">
            <img
              v-if="dog?.avatarImageUrl"
              :src="dog.avatarImageUrl"
              alt="Dog avatar"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <div v-else class="flex h-full w-full items-center justify-center bg-[#0D2C30] text-3xl font-bold text-white">
              {{ dog?.dogName?.[0]?.toUpperCase?.() || "D" }}
            </div>
          </div>
          <div class="pb-2">
            <h1 class="text-3xl font-semibold">{{ dog?.dogName || "Dog" }}</h1>
            <p class="text-sm text-[#c0d8d4]">
              {{ dog?.breed || "Unknown breed" }} <span v-if="dog?.age">• {{ dog.age }}</span>
              <span v-if="dog?.city">• {{ dog.city }}</span>
            </p>
            <div class="mt-2 flex flex-wrap gap-3 text-sm text-[#c0d8d4]">
              <span>Posts: {{ posts.length }}</span>
              <span>Reels: {{ reels.length }}</span>
              <span>Followers: {{ followerCount }}</span>
            </div>
          </div>
          <div class="ml-auto flex items-center gap-3 pb-2">
            <button
              v-if="isOwner"
              class="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Edit Profile
            </button>
            <button
              v-else-if="currentUserId"
              :disabled="followLoading"
              @click="toggleFollow"
              class="rounded-full bg-[#F6A623] px-4 py-2 text-sm font-semibold text-[#241A0E] shadow hover:shadow-lg disabled:opacity-60"
            >
              {{ isFollowing ? "Following" : "Follow" }}
            </button>
            <p v-else class="text-xs text-[#c0d8d4]">Log in to follow this dog</p>
          </div>
        </div>
      </div>
    </section>

    <section class="pt-16">
      <div class="mx-auto max-w-5xl px-4 sm:px-6">
        <div class="flex flex-wrap gap-3 border-b border-slate-200 pb-3 text-sm font-semibold">
          <button
            class="rounded-full px-3 py-2"
            :class="activeTab === 'posts' ? 'bg-[#04343A] text-white' : 'bg-white text-[#1F130A]'"
            @click="activeTab = 'posts'"
          >
            Posts
          </button>
          <button
            class="rounded-full px-3 py-2"
            :class="activeTab === 'reels' ? 'bg-[#04343A] text-white' : 'bg-white text-[#1F130A]'"
            @click="activeTab = 'reels'"
          >
            Reels
          </button>
          <button
            class="rounded-full px-3 py-2"
            :class="activeTab === 'about' ? 'bg-[#04343A] text-white' : 'bg-white text-[#1F130A]'"
            @click="activeTab = 'about'"
          >
            About
          </button>
        </div>

        <div v-if="activeTab === 'posts'" class="mt-6 space-y-4">
          <PostCard v-for="post in posts" :key="post.id" :post="post" />
          <p v-if="posts.length === 0" class="text-sm text-slate-600">No posts yet.</p>
        </div>

        <div v-if="activeTab === 'reels'" class="mt-6">
          <div v-if="reels.length === 0" class="text-sm text-slate-600">No reels yet.</div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="reel in reels"
              :key="reel.id"
              class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
            >
              <div class="relative aspect-[9/16] bg-black">
                <img
                  v-if="reel.posterImageUrl"
                  :src="reel.posterImageUrl"
                  alt="reel poster"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
                <video
                  v-else-if="reel.videoUrl"
                  :src="reel.videoUrl"
                  class="h-full w-full object-cover"
                  muted
                  preload="metadata"
                ></video>
                <div v-else class="flex h-full items-center justify-center text-white/70">No video</div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="rounded-full bg-black/50 px-3 py-1 text-xs text-white">▶</div>
                </div>
              </div>
              <div class="space-y-1 p-3">
                <p class="line-clamp-2 text-sm text-[#1F130A]">{{ reel.content }}</p>
                <p class="text-xs text-[#5A4634]">Likes: {{ reel.likes ?? 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'about'" class="mt-6 space-y-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p class="text-sm text-[#413530]" v-if="dog?.personality">{{ dog.personality }}</p>
          <p class="text-sm text-[#413530]" v-if="dog?.breed">Breed: {{ dog.breed }}</p>
          <p class="text-sm text-[#413530]" v-if="dog?.age">Age: {{ dog.age }}</p>
          <p class="text-sm text-[#413530]" v-if="dog?.city">City: {{ dog.city }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { collection, doc, getDoc, onSnapshot, query, where, deleteDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createNotification } from "@/lib/notifications";
import PostCard from "@/components/social/PostCard.vue";

type DogDoc = {
  id?: string;
  dogName?: string;
  breed?: string;
  age?: string;
  city?: string;
  avatarImageUrl?: string;
  personality?: string;
  ownerId?: string;
};

type FeedItem = {
  id: string;
  content: string;
  mediaUrl?: string;
  videoUrl?: string;
  posterImageUrl?: string;
  authorId?: string;
  authorName?: string;
  dogId?: string;
  dogName?: string;
  dogAvatarUrl?: string;
  dogBreed?: string;
  likes?: number;
  type?: string;
  createdAt?: any;
};

const route = useRoute();
const router = useRouter();
const dogId = computed(() => route.params.dogId as string);
const dog = ref<DogDoc | null>(null);
const posts = ref<FeedItem[]>([]);
const reels = ref<FeedItem[]>([]);
const followerCount = ref(0);
const isFollowing = ref(false);
const followLoading = ref(false);
const currentUserId = ref<string | null>(null);
const activeTab = ref<"posts" | "reels" | "about">("posts");
let followersUnsub: (() => void) | null = null;
let postsUnsub: (() => void) | null = null;
let reelsUnsub: (() => void) | null = null;

const isOwner = computed(() => currentUserId.value && dog.value?.ownerId === currentUserId.value);

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  currentUserId.value = auth.currentUser?.uid || null;
  await loadDog();
  setupFollowers();
  setupPosts();
  setupReels();
});

onBeforeUnmount(() => {
  followersUnsub?.();
  postsUnsub?.();
  reelsUnsub?.();
});

const loadDog = async () => {
  const ref = doc(db, "dogs", dogId.value);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    dog.value = { id: snap.id, ...(snap.data() as any) };
  } else {
    dog.value = null;
  }
};

const setupFollowers = () => {
  const followersCol = collection(db, "dogs", dogId.value, "followers");
  followersUnsub = onSnapshot(followersCol, (snapshot) => {
    followerCount.value = snapshot.size;
    isFollowing.value = !!snapshot.docs.find((d) => d.id === currentUserId.value);
  });
};

const setupPosts = () => {
  const postsCol = collection(db, "posts");
  const q = query(postsCol, where("dogId", "==", dogId.value), where("type", "==", "post"));
  postsUnsub = onSnapshot(q, (snap) => {
    posts.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  });
};

const setupReels = () => {
  const postsCol = collection(db, "posts");
  const q = query(postsCol, where("dogId", "==", dogId.value), where("type", "==", "reel"));
  reelsUnsub = onSnapshot(q, (snap) => {
    reels.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  });
};

const toggleFollow = async () => {
  if (!currentUserId.value) {
    router.push("/login");
    return;
  }
  followLoading.value = true;
  const followerRef = doc(db, "dogs", dogId.value, "followers", currentUserId.value);
  try {
    if (isFollowing.value) {
      await deleteDoc(followerRef);
    } else {
      await setDoc(followerRef, { followedAt: new Date().toISOString() });
      if (dog.value?.ownerId && dog.value.ownerId !== currentUserId.value) {
        await createNotification({
          userId: dog.value.ownerId,
          type: "follow",
          actorUserId: currentUserId.value || undefined,
          actorDogId: dog.value.id,
          actorDogName: dog.value.dogName,
          snippet: "started following your dog.",
        });
      }
    }
  } catch (err) {
    console.error("Dog follow toggle failed", err);
  } finally {
    followLoading.value = false;
  }
};
</script>
