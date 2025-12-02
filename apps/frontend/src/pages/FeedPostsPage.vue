<template>
  <main class="min-h-screen bg-gradient-to-b from-[#fdf7ef] to-[#eef4f5] text-[#1F130A] scroll-smooth">
    <section class="border-b border-white/10 bg-[#04343A] text-white">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">Bhaihood Feed</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">See what the pack is posting in real time.</p>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto flex max-w-3xl flex-col gap-6 px-4 sm:px-6">
        <TrendingHashtags post-type="post" />
        <div ref="createRef">
          <CreatePost @created="handleCreated" />
        </div>

        <template v-if="loading">
          <div
            v-for="i in 3"
            :key="i"
            class="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 animate-pulse"
          >
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-full bg-slate-200"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3 w-24 rounded bg-slate-200"></div>
                <div class="h-3 w-16 rounded bg-slate-200"></div>
              </div>
            </div>
            <div class="h-64 rounded-xl bg-slate-200"></div>
            <div class="h-3 w-full rounded bg-slate-200"></div>
            <div class="h-3 w-3/4 rounded bg-slate-200"></div>
          </div>
        </template>

        <div v-else-if="errorMessage" class="py-8 text-center text-sm text-red-600">{{ errorMessage }}</div>
        <div
          v-else-if="posts.length === 0"
          class="rounded-3xl bg-white p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200"
        >
          No posts yet — follow more dogs or create your first post.
        </div>

        <div v-else class="space-y-4">
          <PostCard v-for="post in posts" :key="post.id" :post="post" />
        </div>
      </div>
    </section>

    <button
      class="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#F6A623] text-xl font-bold text-[#241A0E] shadow-lg hover:shadow-xl sm:bottom-8 sm:right-8"
      @click="scrollToCreate"
      title="Create new post"
    >
      +
    </button>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import CreatePost from "@/components/social/CreatePost.vue";
import PostCard from "@/components/social/PostCard.vue";
import TrendingHashtags from "@/components/social/TrendingHashtags.vue";

type FeedPost = {
  id: string;
  content: string;
  mediaUrl?: string;
  authorName?: string;
  authorId?: string;
  createdAt?: any;
  likes?: number;
  type?: string;
};

const posts = ref<FeedPost[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);
let unsub: (() => void) | null = null;
const createRef = ref<HTMLElement | null>(null);

onMounted(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  try {
    const postsCol = collection(db, "posts");
    const q = query(postsCol, where("type", "==", "post"), orderBy("createdAt", "desc"));
    unsub = onSnapshot(
      q,
      (snapshot) => {
        posts.value = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
        loading.value = false;
      },
      (err) => {
        console.error("Failed to load posts", err);
        errorMessage.value = "Failed to load feed.";
        loading.value = false;
      }
    );
  } catch (err) {
    console.error("Failed to load posts", err);
    errorMessage.value = "Failed to load feed.";
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (unsub) unsub();
});

const handleCreated = () => {
  // snapshot listener updates automatically
};

const scrollToCreate = () => {
  createRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
};
</script>
