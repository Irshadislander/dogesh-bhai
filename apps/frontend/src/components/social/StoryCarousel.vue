<template>
  <div v-if="stories.length" class="flex gap-3 overflow-x-auto pb-2">
    <div
      v-for="story in stories"
      :key="story.id"
      class="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-200 shadow"
    >
      <img :src="story.mediaUrl" class="h-full w-full object-cover" :alt="story.authorName" />
      <div class="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-[11px] text-white">
        {{ story.authorName }}
      </div>
    </div>
  </div>
  <p v-else class="text-sm text-slate-600">No stories yet.</p>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Story = {
  id: string;
  mediaUrl: string;
  authorName?: string;
  expiresAt?: any;
};

const stories = ref<Story[]>([]);
let unsub: (() => void) | null = null;

onMounted(() => {
  const now = new Date();
  const storiesCol = collection(db, "stories");
  const q = query(storiesCol, where("expiresAt", ">", now));
  unsub = onSnapshot(q, (snap) => {
    stories.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  });
});

onBeforeUnmount(() => {
  if (unsub) unsub();
});
</script>
