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
          <div class="mb-3 flex items-center justify-between">
            <p class="text-sm font-semibold text-[#1F130A]">Conversations</p>
            <button
              class="rounded-full bg-[#F6A623] px-3 py-2 text-xs font-semibold text-[#241A0E] shadow hover:shadow-md"
              @click="showNewChat = true"
            >
              New chat
            </button>
          </div>
          <div v-if="loadingConversations" class="space-y-2">
            <div v-for="i in 4" :key="i" class="h-12 animate-pulse rounded-2xl bg-slate-100"></div>
          </div>
          <div
            v-else-if="conversations.length === 0"
            class="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-600"
          >
            No messages yet — start a chat from someone’s profile.
          </div>
          <div v-else class="mt-2 space-y-2">
            <button
              v-for="conv in conversations"
              :key="conv.id"
              class="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition hover:bg-slate-100"
              :class="selectedConversationId === conv.id ? 'bg-slate-100' : ''"
              @click="selectConversation(conv)"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold uppercase">
                  {{ getInitials(getPeerName(conv)) }}
                </div>
                <div class="min-w-0">
                  <p class="truncate font-semibold text-[#1F130A]">{{ getPeerName(conv) }}</p>
                  <p class="truncate text-xs text-[#5A4634]">{{ conv.lastMessage || "Start chatting" }}</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-1 text-right">
                <span class="text-[10px] text-[#5A4634]">{{ timeAgo(conv.updatedAt) }}</span>
                <span
                  v-if="getUnread(conv) > 0"
                  class="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#F6A623] px-2 text-[10px] font-bold text-[#241A0E]"
                >
                  {{ getUnread(conv) > 9 ? "9+" : getUnread(conv) }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div class="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 min-h-[480px] flex flex-col">
          <div v-if="!selectedConversationId" class="m-auto text-center text-sm text-slate-600">
            Select a conversation to start barking.
          </div>
          <template v-else>
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p class="text-sm font-semibold text-[#1F130A]">{{ activePeerName }}</p>
                <p class="text-xs text-[#5A4634]">Real-time chat</p>
              </div>
            </div>
            <div ref="messagesContainer" class="flex-1 space-y-2 overflow-y-auto py-4">
              <div v-if="messagesLoading" class="space-y-2">
                <div v-for="i in 4" :key="i" class="h-10 w-3/4 animate-pulse rounded-2xl bg-slate-100"></div>
              </div>
              <div v-else-if="messages.length === 0" class="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                No messages yet — say hi!
              </div>
              <div
                v-else
                v-for="msg in messages"
                :key="msg.id"
                class="flex"
                :class="msg.senderId === currentUid ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow"
                  :class="msg.senderId === currentUid ? 'bg-[#F6A623]/20 text-[#1F130A]' : 'bg-slate-100 text-[#1F130A]'"
                >
                  <p class="break-words">{{ msg.text }}</p>
                  <p class="text-[10px] text-[#5A4634]">{{ timeAgo(msg.createdAt) }}</p>
                </div>
              </div>
            </div>
            <form class="mt-3 flex items-center gap-2" @submit.prevent="handleSend">
              <input
                v-model="messageText"
                type="text"
                class="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
                placeholder="Type a message"
              />
              <button
                type="submit"
                :disabled="!messageText.trim() || sending"
                class="rounded-xl bg-[#F6A623] px-4 py-2 text-sm font-semibold text-[#241A0E] shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ sending ? "Sending…" : "Send" }}
              </button>
            </form>
            <p v-if="sendError" class="mt-1 text-xs text-red-600">{{ sendError }}</p>
          </template>
        </div>
      </div>
    </section>

    <div
      v-if="showNewChat"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="closeModal"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 class="text-lg font-semibold text-[#1F130A]">Start a new chat</h3>
        <p class="mt-1 text-sm text-[#5A4634]">Enter the email of the user you want to chat with.</p>
        <form class="mt-4 space-y-3" @submit.prevent="startNewChat">
          <input
            v-model="newChatEmail"
            type="email"
            required
            class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
            placeholder="friend@bhaihood.com"
          />
          <p v-if="newChatError" class="text-xs text-red-600">{{ newChatError }}</p>
          <div class="flex items-center gap-3">
            <button
              type="submit"
              :disabled="creatingChat"
              class="rounded-xl bg-[#F6A623] px-4 py-2 text-sm font-semibold text-[#241A0E] shadow disabled:opacity-60"
            >
              {{ creatingChat ? "Creating…" : "Start chat" }}
            </button>
            <button type="button" class="text-sm text-[#5A4634] hover:underline" @click="closeModal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getOrCreateConversation, markConversationSeen, sendMessage } from "@/lib/messaging";
import type { Conversation, ChatMessage } from "@/lib/types";

const conversations = ref<Conversation[]>([]);
const selectedConversationId = ref<string | null>(null);
const activeConversation = ref<Conversation | null>(null);
const loadingConversations = ref(true);
const messages = ref<ChatMessage[]>([]);
const messagesLoading = ref(false);
const messageText = ref("");
const sending = ref(false);
const sendError = ref<string | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);

const showNewChat = ref(false);
const newChatEmail = ref("");
const newChatError = ref<string | null>(null);
const creatingChat = ref(false);

const userCache = ref<Record<string, any>>({});

const currentUid = computed(() => auth.currentUser?.uid || "");

let convUnsub: (() => void) | null = null;
let msgUnsub: (() => void) | null = null;

const fetchUser = async (uid: string) => {
  if (userCache.value[uid]) return userCache.value[uid];
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) {
    const data = { id: uid, ...(snap.data() as any) };
    userCache.value[uid] = data;
    return data;
  }
  return null;
};

const getPeerId = (conv: Conversation) => conv.participants.find((p) => p !== currentUid.value) || "";
const getPeerName = (conv: Conversation) => {
  const peerId = getPeerId(conv);
  const profile = userCache.value[peerId];
  return profile?.fullName || "Bhai";
};
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getUnread = (conv: Conversation) => conv.unreadCountByUser?.[currentUid.value] || 0;

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

const listenConversations = () => {
  if (convUnsub) convUnsub();
  if (!currentUid.value) return;
  const convCol = collection(db, "conversations");
  const q = query(convCol, where("participants", "array-contains", currentUid.value), orderBy("updatedAt", "desc"));
  convUnsub = onSnapshot(
    q,
    async (snap) => {
      const convs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Conversation[];
      conversations.value = convs;
      loadingConversations.value = false;
      if (!selectedConversationId.value && convs.length > 0) {
        selectConversation(convs[0]);
      } else if (selectedConversationId.value) {
        const found = convs.find((c) => c.id === selectedConversationId.value);
        activeConversation.value = found || null;
      }
      // warm user cache
      convs.forEach((c) => {
        const peer = getPeerId(c);
        if (peer) fetchUser(peer);
      });
    },
    (err) => {
      console.error("Failed to load conversations", err);
      loadingConversations.value = false;
    }
  );
};

const listenMessages = (conversationId: string) => {
  if (msgUnsub) msgUnsub();
  const msgCol = collection(db, "conversations", conversationId, "messages");
  const q = query(msgCol, orderBy("createdAt", "asc"));
  messagesLoading.value = true;
  msgUnsub = onSnapshot(
    q,
    (snap) => {
      messages.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ChatMessage[];
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

const selectConversation = async (conv: Conversation) => {
  selectedConversationId.value = conv.id;
  activeConversation.value = conv;
  listenMessages(conv.id);
  if (currentUid.value) {
    await markConversationSeen(conv.id, currentUid.value);
  }
};

const handleSend = async () => {
  if (!selectedConversationId.value || !messageText.value.trim() || !currentUid.value) return;
  sending.value = true;
  sendError.value = null;
  try {
    await sendMessage(
      selectedConversationId.value,
      currentUid.value,
      messageText.value,
      activeConversation.value?.participants,
      auth.currentUser?.displayName || auth.currentUser?.email || "Bhai"
    );
    messageText.value = "";
  } catch (err) {
    console.error("Failed to send message", err);
    sendError.value = "Could not send message. Try again.";
  } finally {
    sending.value = false;
  }
};

const startNewChat = async () => {
  newChatError.value = null;
  if (!newChatEmail.value.trim()) {
    newChatError.value = "Enter an email.";
    return;
  }
  creatingChat.value = true;
  try {
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("email", "==", newChatEmail.value.trim().toLowerCase()), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      newChatError.value = "User not found.";
      creatingChat.value = false;
      return;
    }
    const targetUid = snap.docs[0].id;
    if (targetUid === currentUid.value) {
      newChatError.value = "You cannot chat with yourself.";
      creatingChat.value = false;
      return;
    }
    const convDoc = await getOrCreateConversation(currentUid.value, targetUid);
    const conv = { id: convDoc.id, ...(convDoc.data() as any) } as Conversation;
    conversations.value = [conv, ...conversations.value.filter((c) => c.id !== conv.id)];
    await selectConversation(conv);
    closeModal();
    newChatEmail.value = "";
  } catch (err) {
    console.error("New chat failed", err);
    newChatError.value = "Could not start chat.";
  } finally {
    creatingChat.value = false;
  }
};

const closeModal = () => {
  showNewChat.value = false;
  newChatError.value = null;
};

const activePeerName = computed(() => (activeConversation.value ? getPeerName(activeConversation.value) : ""));

onMounted(() => {
  listenConversations();
});

watch(
  () => selectedConversationId.value,
  (id) => {
    if (id && currentUid.value) {
      markConversationSeen(id, currentUid.value);
    }
  }
);

onBeforeUnmount(() => {
  if (convUnsub) convUnsub();
  if (msgUnsub) msgUnsub();
});
</script>
