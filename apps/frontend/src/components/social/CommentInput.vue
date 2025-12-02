<template>
  <div class="rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
    <form class="flex items-center gap-2" @submit.prevent="submitComment">
      <input
        v-model="text"
        type="text"
        class="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
        placeholder="Add a comment…"
      />
      <button
        type="submit"
        :disabled="loading || !text.trim()"
        class="rounded-xl bg-[#F6A623] px-3 py-2 text-xs font-semibold text-[#241A0E] shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ loading ? "…" : "Send" }}
      </button>
    </form>
    <p v-if="errorMessage" class="mt-1 text-[11px] text-red-600">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { parseMentionsAndTags } from "@/lib/socialParsing";
import { createNotification, createNotificationsForMentions } from "@/lib/notifications";

const props = defineProps<{
  postId: string;
  postAuthorId?: string;
  postDogId?: string;
  postDogName?: string;
  postDogAvatarUrl?: string;
}>();

const text = ref("");
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const router = useRouter();
const route = useRoute();
const isLoggedIn = computed(() => !!auth.currentUser);

const submitComment = async () => {
  if (!text.value.trim()) return;
  if (!isLoggedIn.value) {
    router.push({ path: "/login", query: { redirect: route.fullPath } });
    return;
  }
  loading.value = true;
  errorMessage.value = null;

  try {
    const user = auth.currentUser;
    const commentsCol = collection(db, "posts", props.postId, "comments");
    const { mentions, hashtags } = parseMentionsAndTags(text.value);
    await addDoc(commentsCol, {
      text: text.value.trim(),
      authorId: user?.uid || "",
      authorName: user?.displayName || user?.email || "Bhai",
      mentionedHandles: mentions,
      hashtags,
      createdAt: serverTimestamp(),
    });
    if (props.postAuthorId && user?.uid && user.uid !== props.postAuthorId) {
      await createNotification({
        userId: props.postAuthorId,
        type: "comment",
        actorUserId: user.uid,
        actorDisplayName: user.displayName || user.email || "Bhai",
        actorDogId: props.postDogId,
        actorDogName: props.postDogName,
        actorDogAvatarUrl: props.postDogAvatarUrl,
        postId: props.postId,
        snippet: text.value.trim().slice(0, 80),
      });
    }
    if (mentions.length > 0) {
      await createNotificationsForMentions(mentions, {
        actorUserId: user?.uid || "",
        actorDisplayName: user?.displayName || user?.email || "Bhai",
        type: "comment",
        snippet: `${user?.displayName || "Someone"} mentioned you in a comment.`,
        postId: props.postId,
      });
    }
    text.value = "";
  } catch (err) {
    console.error("Failed to add comment", err);
    errorMessage.value = "Could not add comment. Try again.";
  } finally {
    loading.value = false;
  }
};
</script>
