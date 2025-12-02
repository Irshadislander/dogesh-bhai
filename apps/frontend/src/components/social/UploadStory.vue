<template>
  <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
    <p class="text-sm font-semibold text-[#1F130A]">Share a story</p>
    <p class="text-xs text-[#5A4634]">Stories expire after 24 hours.</p>
    <div class="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
      <input type="file" accept="image/*,video/*" @change="handleFileChange" />
      <button
        type="button"
        :disabled="uploading"
        class="rounded-xl bg-[#F6A623] px-4 py-2 text-sm font-semibold text-[#241A0E] shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ uploading ? "Uploading…" : "Upload" }}
      </button>
    </div>
    <p v-if="uploading" class="text-sm text-[#5A4634]">Uploading your story…</p>
    <p v-if="successMessage" class="text-sm text-emerald-600">{{ successMessage }}</p>
    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { auth, db, storage } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";

const uploading = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const user = auth.currentUser;
  if (!user) {
    errorMessage.value = "Login to upload stories.";
    return;
  }
  uploading.value = true;
  errorMessage.value = null;
  successMessage.value = null;
  try {
    const name = `stories/${user.uid}/${crypto.randomUUID()}`;
    const fileRef = storageRef(storage, name);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    const expiresAt = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000);
    const storiesCol = collection(db, "stories");
    await addDoc(storiesCol, {
      authorId: user.uid,
      authorName: user.displayName || user.email || "Bhai",
      mediaUrl: url,
      createdAt: serverTimestamp(),
      expiresAt,
    });
    successMessage.value = "Story uploaded!";
  } catch (err) {
    console.error("Story upload failed", err);
    errorMessage.value = "Could not upload story.";
  } finally {
    uploading.value = false;
  }
};
</script>
