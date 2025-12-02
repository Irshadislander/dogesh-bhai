<template>
  <main class="min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <section class="border-b border-white/10 bg-[#04343A] text-white">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">Saved</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">All your bookmarked posts and reels.</p>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto flex max-w-4xl flex-col gap-4 px-4 sm:px-6">
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-2xl bg-white/70"></div>
        </div>
        <div
          v-else-if="posts.length === 0"
          class="rounded-3xl bg-white p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200"
        >
          You haven’t saved any Bhai posts yet. Tap the bookmark on posts or reels to save them here.
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
import { collection, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import PostCard from "@/components/social/PostCard.vue";
import { useRouter } from "vue-router";

type SavedEntry = { postId: string; type?: string };
type PostDoc = any;

const posts = ref<PostDoc[]>([]);
const loading = ref(true);
const router = useRouter();
let savedUnsub: (() => void) | null = null;

const loadSaved = () => {
  const user = auth.currentUser;
  if (!user) {
    router.push({ path: "/login", query: { redirect: "/saved" } });
    return;
  }
  const savedCol = collection(db, "users", user.uid, "savedPosts");
  const q = query(savedCol, orderBy("createdAt", "desc"));
  savedUnsub = onSnapshot(
    q,
    async (snap) => {
      const entries: SavedEntry[] = snap.docs.map((d) => ({ ...(d.data() as any) }));
      const postFetches = entries.map((e) => getDoc(doc(db, "posts", e.postId)));
      const postSnaps = await Promise.all(postFetches);
      posts.value = postSnaps
        .filter((s) => s.exists())
        .map((s) => ({ id: s.id, ...(s.data() as any) }));
      loading.value = false;
    },
    (err) => {
      console.error("Saved load failed", err);
      loading.value = false;
    }
  );
};

onMounted(loadSaved);
</script>
