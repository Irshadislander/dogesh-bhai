<template>
  <main class="min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <section class="border-b border-white/10 bg-[#04343A] text-white">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">Messages</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">Chat with your Bhaihood in real time.</p>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto grid max-w-6xl gap-6 px-6 lg:grid-cols-[320px,1fr]">
        <div class="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p class="text-sm font-semibold text-[#1F130A]">Conversations</p>
          <div v-if="loading" class="py-4 text-sm text-slate-600">Loading conversations…</div>
          <div
            v-else-if="conversations.length === 0"
            class="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-600"
          >
            No messages yet — start a chat from someone’s profile.
          </div>
          <div v-else class="mt-3 space-y-2">
            <button
              v-for="conv in conversations"
              :key="conv.id"
              class="w-full rounded-2xl px-3 py-2 text-left text-sm transition hover:bg-slate-100"
              :class="selectedConversationId === conv.id ? 'bg-slate-100' : ''"
              @click="selectedConversationId = conv.id"
            >
              <p class="font-semibold text-[#1F130A]">{{ conv.title || 'Conversation' }}</p>
              <p class="text-xs text-[#5A4634] break-words">{{ conv.lastMessage || 'Start chatting' }}</p>
            </button>
          </div>
        </div>

        <ChatWindow :conversation-id="selectedConversationId" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import ChatWindow from "@/components/social/ChatWindow.vue";

type Conversation = {
  id: string;
  participants: string[];
  lastMessage?: string;
  title?: string;
};

const conversations = ref<Conversation[]>([]);
const selectedConversationId = ref<string | null>(null);
const loading = ref(true);

onMounted(() => {
  const user = auth.currentUser;
  if (!user) {
    loading.value = false;
    return;
  }
  const convCol = collection(db, "conversations");
  const q = query(convCol, where("participants", "array-contains", user.uid), orderBy("updatedAt", "desc"));
  onSnapshot(
    q,
    (snap) => {
      conversations.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      if (!selectedConversationId.value && conversations.value.length > 0) {
        selectedConversationId.value = conversations.value[0].id;
      }
      loading.value = false;
    },
    (err) => {
      console.error("Failed to load conversations", err);
      loading.value = false;
    }
  );
});
</script>
