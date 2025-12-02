<template>
  <div class="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 min-h-[400px]">
    <p class="text-sm font-semibold text-[#1F130A]">Chat</p>
    <div v-if="!conversationId" class="py-6 text-sm text-slate-600">Select a conversation to start chatting.</div>
    <div v-else class="flex h-full flex-col">
      <div class="flex-1 space-y-2 overflow-y-auto py-4" ref="messagesContainer">
        <div v-if="messagesLoading" class="text-sm text-slate-600">Loading messages…</div>
        <div
          v-else-if="messages.length === 0"
          class="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600"
        >
          No messages yet — say hi!
        </div>
        <div
          v-else
          v-for="msg in messages"
          :key="msg.id"
          class="max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow"
          :class="msg.authorId === currentUserId ? 'ml-auto bg-[#F6A623]/20 text-[#1F130A]' : 'bg-slate-100 text-[#1F130A]'"
        >
          <p class="break-words">{{ msg.text }}</p>
          <p class="text-[10px] text-[#5A4634]">{{ formatDate(msg.createdAt) }}</p>
        </div>
      </div>
      <form class="mt-3 flex items-center gap-2" @submit.prevent="sendMessage">
        <input
          v-model="text"
          type="text"
          class="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
          placeholder="Type a message"
        />
        <button
          type="submit"
          :disabled="!text.trim() || sending"
          class="rounded-xl bg-[#F6A623] px-4 py-2 text-sm font-semibold text-[#241A0E] shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ sending ? "Sending…" : "Send" }}
        </button>
      </form>
      <p v-if="sendError" class="mt-1 text-xs text-red-600">{{ sendError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";

const props = defineProps<{
  conversationId: string | null;
}>();

type Message = {
  id: string;
  text: string;
  authorId: string;
  createdAt?: any;
};

const messages = ref<Message[]>([]);
const text = ref("");
const sending = ref(false);
const currentUserId = computed(() => auth.currentUser?.uid || "");
const messagesLoading = ref(false);
const sendError = ref<string | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);

let unsub: (() => void) | null = null;

const loadMessages = () => {
  if (unsub) {
    unsub();
    unsub = null;
  }
  if (!props.conversationId) return;
  messagesLoading.value = true;
  const msgCol = collection(db, "conversations", props.conversationId, "messages");
  const q = query(msgCol, orderBy("createdAt", "asc"));
  unsub = onSnapshot(
    q,
    (snap) => {
      messages.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      messagesLoading.value = false;
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    },
    (err) => {
      console.error("Messages load error", err);
      messagesLoading.value = false;
    }
  );
};

watch(
  () => props.conversationId,
  () => loadMessages()
);

onMounted(() => loadMessages());

onBeforeUnmount(() => {
  if (unsub) unsub();
});

const sendMessage = async () => {
  if (!props.conversationId || !text.value.trim()) return;
  sending.value = true;
  sendError.value = null;
  try {
    const msgCol = collection(db, "conversations", props.conversationId, "messages");
    await addDoc(msgCol, {
      text: text.value.trim(),
      authorId: currentUserId.value,
      createdAt: serverTimestamp(),
    });
    text.value = "";
  } catch (err) {
    console.error("Failed to send", err);
    sendError.value = "Could not send message. Try again.";
  } finally {
    sending.value = false;
  }
};

const formatDate = (ts?: any) => {
  if (!ts || typeof ts.toDate !== "function") return "";
  return ts.toDate().toLocaleTimeString();
};
</script>
