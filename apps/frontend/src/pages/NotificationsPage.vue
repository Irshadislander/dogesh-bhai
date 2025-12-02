<template>
  <main class="min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <section class="border-b border-white/10 bg-[#04343A] text-white">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">Notifications</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">Stay updated with likes, comments, follows, and mentions.</p>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto max-w-6xl px-6">
        <div v-if="loading" class="py-8 text-center text-sm text-slate-600">Loading notifications…</div>
        <div v-else-if="errorMessage" class="py-8 text-center text-sm text-red-600">{{ errorMessage }}</div>
        <div
          v-else-if="items.length === 0"
          class="rounded-3xl bg-white p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200"
        >
          You’re all caught up — no notifications yet.
        </div>
        <div v-else class="space-y-3">
          <article
            v-for="item in items"
            :key="item.id"
            class="flex items-start gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <div class="mt-1 h-3 w-3 rounded-full" :class="item.read ? 'bg-slate-300' : 'bg-yellow-400'"></div>
            <div class="flex-1 space-y-1 overflow-hidden">
              <p class="break-words text-sm text-[#1F130A]">{{ item.message }}</p>
              <p class="text-xs text-[#5A4634]">{{ formatDate(item.createdAt) }}</p>
            </div>
            <button
              v-if="!item.read"
              class="text-xs font-semibold text-[#04343A] underline"
              @click="markAsRead(item.id)"
            >
              Mark read
            </button>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { auth, db } from "@/lib/firebase";
import { collection, doc, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";

type NotificationDoc = {
  id: string;
  recipientId: string;
  message: string;
  type?: string;
  read: boolean;
  createdAt?: any;
};

const items = ref<NotificationDoc[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);
let unsub: (() => void) | null = null;

onMounted(() => {
  const user = auth.currentUser;
  if (!user) {
    errorMessage.value = "Login to view notifications.";
    loading.value = false;
    return;
  }
  const notificationsCol = collection(db, "notifications");
  const q = query(notificationsCol, where("recipientId", "==", user.uid), orderBy("createdAt", "desc"));
  unsub = onSnapshot(
    q,
    (snap) => {
      items.value = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as any),
      }));
      loading.value = false;
    },
    (err) => {
      console.error("Notifications snapshot error", err);
      errorMessage.value = "Couldn't load notifications, please try again.";
      loading.value = false;
    }
  );
});

onBeforeUnmount(() => {
  if (unsub) unsub();
});

const markAsRead = async (id: string) => {
  try {
    await updateDoc(doc(db, "notifications", id), { read: true });
  } catch (err) {
    console.error("Failed to mark read", err);
  }
};

const formatDate = (ts?: any) => {
  if (!ts || typeof ts.toDate !== "function") return "";
  return ts.toDate().toLocaleString();
};
</script>
