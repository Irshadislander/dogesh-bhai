<template>
  <button
    type="button"
    :disabled="loading"
    @click="like"
    class="inline-flex items-center gap-2 rounded-full bg-[#F8E4C7] px-3 py-2 text-sm font-semibold text-[#1F130A] transition hover:-translate-y-0.5 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
  >
    ❤️ <span>{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, increment, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { createNotification } from "@/lib/notifications";

const props = defineProps<{
  postId: string;
  initialCount?: number;
  postAuthorId?: string;
}>();

const count = ref(props.initialCount ?? 0);
const loading = ref(false);
const router = useRouter();
const route = useRoute();
const isLoggedIn = computed(() => !!auth.currentUser);

const like = async () => {
  if (!isLoggedIn.value) {
    router.push({ path: "/login", query: { redirect: route.fullPath } });
    return;
  }
  if (loading.value) return;
  loading.value = true;
  try {
    const postRef = doc(db, "posts", props.postId);
    await updateDoc(postRef, { likes: increment(1) });
    count.value += 1;
    const user = auth.currentUser;
    if (props.postAuthorId && user?.uid && user.uid !== props.postAuthorId) {
      await createNotification(props.postAuthorId, {
        actorId: user.uid,
        actorName: user.displayName || user.email || "Someone",
        type: "like",
        message: `${user.displayName || "Someone"} liked your post.`,
      });
    }
  } catch (err) {
    console.error("Failed to like", err);
  } finally {
    loading.value = false;
  }
};

defineExpose({ like });
</script>
