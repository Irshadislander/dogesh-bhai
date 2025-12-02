<template>
  <button
    type="button"
    class="rounded-xl bg-[#04343A] px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg"
    :disabled="sending"
    @click="startConversation"
  >
    {{ sending ? "Opening..." : "Message" }}
  </button>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, doc, getDocs, query, setDoc, where, serverTimestamp } from "firebase/firestore";
import { ref } from "vue";

const props = defineProps<{
  targetUserId: string;
}>();

const router = useRouter();
const sending = ref(false);

const startConversation = async () => {
  const user = auth.currentUser;
  if (!user) {
    router.push("/login");
    return;
  }
  sending.value = true;
  try {
    const convCol = collection(db, "conversations");
    const q = query(convCol, where("participants", "in", [[user.uid, props.targetUserId], [props.targetUserId, user.uid]]));
    const existing = await getDocs(q);
    let convId: string | null = null;
    if (!existing.empty) {
      convId = existing.docs[0].id;
    } else {
      const docRef = await addDoc(convCol, {
        participants: [user.uid, props.targetUserId],
        title: "Direct message",
        lastMessage: "",
        updatedAt: serverTimestamp(),
      });
      // optional participant docs
      await setDoc(doc(db, "conversations", docRef.id, "participants", user.uid), { userId: user.uid });
      await setDoc(doc(db, "conversations", docRef.id, "participants", props.targetUserId), { userId: props.targetUserId });
      convId = docRef.id;
    }
    await router.push({ name: "messages", query: { convo: convId || undefined } });
  } catch (err) {
    console.error("Failed to start conversation", err);
  } finally {
    sending.value = false;
  }
};
</script>
