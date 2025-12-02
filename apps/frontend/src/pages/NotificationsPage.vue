<template>
  <main class="min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <section class="border-b border-white/10 bg-[#04343A] text-white">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">Notifications</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">Stay updated with likes, comments, follows, and messages.</p>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto max-w-6xl px-6">
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-16 animate-pulse rounded-3xl bg-white/70"></div>
        </div>
        <div
          v-else-if="items.length === 0"
          class="rounded-3xl bg-white p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200"
        >
          No notifications yet. Let your dog flex on the feed!
        </div>
        <div v-else class="space-y-3">
          <article
            v-for="item in items"
            :key="item.id"
            class="flex items-start gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md"
            :class="!item.isRead ? 'border-l-4 border-[#F6A623]' : ''"
            @click="handleNavigate(item)"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm">
              <span v-if="item.type === 'like'">❤️</span>
              <span v-else-if="item.type === 'comment'">💬</span>
              <span v-else-if="item.type === 'follow'">🐾</span>
              <span v-else-if="item.type === 'message'">📨</span>
              <span v-else>🔔</span>
            </div>
            <div class="flex-1 space-y-1 overflow-hidden">
              <p class="text-sm font-semibold text-[#1F130A]" :class="!item.isRead ? 'font-semibold' : 'font-normal'">
                {{ readableMessage(item) }}
              </p>
              <p class="text-xs text-[#5A4634]">{{ timeAgo(item.createdAt) }}</p>
            </div>
            <span v-if="!item.isRead" class="mt-1 h-2 w-2 rounded-full bg-[#F6A623]"></span>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import type { NotificationDoc } from "@/lib/types";
import { markAllNotificationsRead } from "@/lib/notifications";

const items = ref<NotificationDoc[]>([]);
const loading = ref(true);
const router = useRouter();
let unsub: (() => void) | null = null;

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

const readableMessage = (n: NotificationDoc) => {
  switch (n.type) {
    case "like":
      return `${n.actorDisplayName || "Someone"} liked your post`;
    case "comment":
      return `${n.actorDisplayName || "Someone"} commented: ${n.snippet || ""}`;
    case "follow":
      return `${n.actorDisplayName || "Someone"} started following ${n.actorDogName || "your dog"}`;
    case "message":
      return `New message from ${n.actorDisplayName || "someone"}: ${n.snippet || ""}`;
    default:
      return n.snippet || "You have a notification.";
  }
};

const loadNotifications = () => {
  const user = auth.currentUser;
  if (!user) {
    loading.value = false;
    return;
  }
  const col = collection(db, "users", user.uid, "notifications");
  const q = query(col, orderBy("createdAt", "desc"));
  unsub = onSnapshot(
    q,
    async (snap) => {
      items.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as NotificationDoc[];
      loading.value = false;
      await markAllNotificationsRead(user.uid);
    },
    (err) => {
      console.error("Notifications snapshot error", err);
      loading.value = false;
    }
  );
};

const handleNavigate = (item: NotificationDoc) => {
  if (item.type === "message" && item.conversationId) {
    router.push({ path: "/messages", query: { conversation: item.conversationId } });
    return;
  }
  if ((item.type === "like" || item.type === "comment") && item.postId) {
    router.push("/feed/posts");
    return;
  }
  if (item.type === "follow" && item.actorDogId) {
    router.push(`/dog/${item.actorDogId}`);
    return;
  }
  router.push("/feed/posts");
};

onMounted(() => loadNotifications());

onBeforeUnmount(() => {
  if (unsub) unsub();
});
</script>
