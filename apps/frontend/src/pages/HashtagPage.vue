<template>
  <main class="min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <section class="border-b border-white/10 bg-[#04343A] text-white">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">#{{ tag }}</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">Posts and reels tagged with #{{ tag }}.</p>
        <p class="text-xs text-[#c0d8d4]">Total items: {{ items.length }}</p>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto flex max-w-5xl flex-col gap-6 px-4 sm:px-6">
        <div v-if="loading" class="space-y-3">
          <div class="h-6 w-28 rounded bg-slate-200 animate-pulse"></div>
          <div class="h-64 rounded-2xl bg-slate-200 animate-pulse"></div>
        </div>
        <div v-else-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</div>
        <div v-else-if="items.length === 0" class="text-sm text-slate-600">
          No posts for #{{ tag }} yet — be the first to share!
        </div>
        <div v-else class="space-y-4">
          <PostCard v-for="item in items" :key="item.id" :post="item" />
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
  videoUrl?: string;
  authorName?: string;
  authorId?: string;
  dogId?: string;
  dogName?: string;
  dogAvatarUrl?: string;
  dogBreed?: string;
  createdAt?: any;
  likes?: number;
  type?: string;
};

const route = useRoute();
const tag = ref<string>((route.params.tag as string) || "");
const items = ref<FeedPost[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

onMounted(async () => {
  try {
    const postsCol = collection(db, "posts");
    const q = query(
      postsCol,
      where("hashtags", "array-contains", tag.value.toLowerCase()),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    items.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (err) {
    console.error("Failed to load tag", err);
    errorMessage.value = "Failed to load hashtag content.";
  } finally {
    loading.value = false;
  }
});
</script>
