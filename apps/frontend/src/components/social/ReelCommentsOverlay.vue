<template>
  <div v-if="open" class="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur">
    <div class="flex items-center justify-between p-4 text-white">
      <h3 class="text-lg font-semibold">Comments</h3>
      <button class="rounded-full bg-white/10 p-2 hover:bg-white/20" @click="close">✕</button>
    </div>
    <div class="flex-1 overflow-y-auto px-4 pb-28">
      <div v-if="loading" class="py-4 text-sm text-white/70">Loading comments…</div>
      <div v-else-if="error" class="py-4 text-sm text-red-300">{{ error }}</div>
      <div v-else-if="comments.length === 0" class="py-4 text-sm text-white/70">No comments yet.</div>
      <div v-else class="space-y-3">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="flex items-start gap-3 rounded-2xl bg-white/5 p-3 text-white"
        >
          <div class="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
            <img v-if="comment.dogAvatarUrl" :src="comment.dogAvatarUrl" alt="" class="h-full w-full object-cover" loading="lazy" />
            <span v-else class="text-sm font-semibold uppercase">{{ (comment.dogName || 'B')[0] }}</span>
          </div>
          <div class="flex-1 space-y-1">
            <p class="text-sm font-semibold">
              {{ comment.dogName || comment.authorName || 'Bhai' }}
              <span class="text-xs text-white/60">{{ timeAgo(comment.createdAt) }}</span>
            </p>
            <p class="text-sm text-white/90">{{ comment.text }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="fixed bottom-0 left-0 right-0 bg-[#0D2C30] p-3">
      <form class="flex items-center gap-2" @submit.prevent="submitComment">
        <input
          v-model="newComment"
          type="text"
          class="flex-1 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#F6A623]"
          placeholder="Add a comment…"
        />
        <button
          type="submit"
          :disabled="sending || !newComment.trim()"
          class="rounded-full bg-[#F6A623] px-4 py-2 text-sm font-semibold text-[#241A0E] disabled:opacity-60"
        >
          {{ sending ? '...' : 'Send' }}
        </button>
      </form>
      <p v-if="error" class="mt-1 text-xs text-red-300">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { collection, onSnapshot, orderBy, query, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type ReelComment = {
  id: string;
  text: string;
  authorId?: string;
  authorName?: string;
  dogId?: string;
  dogName?: string;
  dogAvatarUrl?: string;
  createdAt?: any;
};

const props = defineProps<{
  postId: string | null;
  open: boolean;
}>();
const emit = defineEmits<{
  (e: "close"): void;
}>();

const comments = ref<ReelComment[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const newComment = ref("");
const sending = ref(false);
const router = useRouter();
const route = useRoute();
const isLoggedIn = computed(() => !!auth.currentUser);
let unsub: (() => void) | null = null;

watch(
  () => props.open,
  (val) => {
    if (val) subscribe();
    else cleanup();
  }
);

const subscribe = () => {
  if (!props.postId) return;
  loading.value = true;
  const commentsCol = collection(db, "posts", props.postId, "comments");
  const q = query(commentsCol, orderBy("createdAt", "asc"));
  unsub = onSnapshot(
    q,
    (snap) => {
      comments.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      loading.value = false;
    },
    (err) => {
      console.error("Comments load failed", err);
      error.value = "Failed to load comments";
      loading.value = false;
    }
  );
};

const cleanup = () => {
  if (unsub) {
    unsub();
    unsub = null;
  }
};

onBeforeUnmount(cleanup);

const submitComment = async () => {
  if (!props.postId || !newComment.value.trim()) return;
  if (!isLoggedIn.value) {
    router.push({ path: "/login", query: { redirect: route.fullPath } });
    return;
  }
  sending.value = true;
  try {
    const user = auth.currentUser;
    const commentsCol = collection(db, "posts", props.postId, "comments");
    await addDoc(commentsCol, {
      text: newComment.value.trim(),
      authorId: user?.uid || "",
      authorName: user?.displayName || user?.email || "Bhai",
      createdAt: serverTimestamp(),
    });
    newComment.value = "";
  } catch (err) {
    console.error("Failed to add comment", err);
    error.value = "Failed to add comment";
  } finally {
    sending.value = false;
  }
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

const close = () => emit("close");
</script>
