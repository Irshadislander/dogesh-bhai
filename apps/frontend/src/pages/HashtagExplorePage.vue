<template>
  <main class="min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <section class="border-b border-white/10 bg-[#04343A] text-white">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">#{{ tag }}</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">Posts tagged with #{{ tag }}</p>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto flex max-w-6xl flex-col gap-6 px-6">
        <div v-if="loading" class="py-8 text-center text-sm text-slate-600">Loading hashtag…</div>
        <div v-else-if="errorMessage" class="py-8 text-center text-sm text-red-600">{{ errorMessage }}</div>
        <div
          v-else-if="posts.length === 0"
          class="rounded-3xl bg-white p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200"
        >
          No posts for #{{ tag }} yet — be the first to post!
        </div>
        <div v-else class="space-y-4">
          <PostCard v-for="post in posts" :key="post.id" :post="post" />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PostCard from "@/components/social/PostCard.vue";

type FeedPost = {
  id: string;
  content: string;
  mediaUrl?: string;
  authorName?: string;
  authorId?: string;
  createdAt?: any;
  likes?: number;
};

const route = useRoute();
const tag = ref<string>((route.params.tag as string) || "");
const posts = ref<FeedPost[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

onMounted(async () => {
  try {
    const q = query(
      collection(db, "posts"),
      where("type", "==", "post"),
      where("hashtags", "array-contains", tag.value.toLowerCase()),
      orderBy("createdAt", "desc"),
      limit(30)
    );
    const snap = await getDocs(q);
    posts.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (err) {
    console.error("Failed to load hashtag posts", err);
    errorMessage.value = "Failed to load hashtag posts.";
  } finally {
    loading.value = false;
  }
});
</script>
