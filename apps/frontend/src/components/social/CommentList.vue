<template>
  <div class="space-y-2">
    <p class="text-xs font-semibold uppercase tracking-wide text-[#8A6A4A]">Comments</p>
    <p v-if="loading" class="text-xs text-slate-600">Loading…</p>
    <p v-else-if="comments.length === 0" class="text-xs text-slate-600">Be the first to comment.</p>
    <div v-else class="space-y-2">
      <div v-for="comment in comments" :key="comment.id" class="rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
        <p class="text-sm text-[#1F130A]">{{ comment.text }}</p>
        <p class="text-[11px] text-[#6B5541]">
          {{ comment.authorName || "Bhai" }}
          <span v-if="comment.createdAt" class="ml-1 text-[10px] text-[#8A6A4A]">{{ formatDate(comment.createdAt) }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const props = defineProps<{
  postId: string;
}>();

type CommentDoc = {
  id: string;
  text: string;
  authorName?: string;
  createdAt?: any;
};

const comments = ref<CommentDoc[]>([]);
const loading = ref(true);
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  const commentsCol = collection(db, "posts", props.postId, "comments");
  const q = query(commentsCol, orderBy("createdAt", "asc"));
  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      comments.value = snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          text: data.text ?? "",
          authorName: data.authorName ?? "",
          createdAt: data.createdAt ?? null,
        };
      });
      loading.value = false;
    },
    (err) => {
      console.error("Failed to load comments", err);
      loading.value = false;
    }
  );
});

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe();
});

const formatDate = (createdAt?: any) => {
  if (!createdAt || typeof (createdAt as any).toDate !== "function") return "";
  return (createdAt as any).toDate().toLocaleString();
};
</script>
