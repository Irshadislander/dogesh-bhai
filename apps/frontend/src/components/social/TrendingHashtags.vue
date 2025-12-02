<template>
  <div class="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-[#1F130A]">Trending hashtags</p>
      <span v-if="loading" class="text-[10px] text-[#5A4634]">loading…</span>
    </div>
    <div v-if="loading" class="mt-3 flex flex-wrap gap-2">
      <span v-for="i in 5" :key="i" class="h-7 w-20 animate-pulse rounded-full bg-slate-200"></span>
    </div>
    <div v-else-if="tags.length === 0" class="mt-2 text-xs text-[#5A4634]">No trends yet.</div>
    <div v-else class="mt-3 flex flex-wrap gap-2">
      <RouterLink
        v-for="tag in tags"
        :key="tag.tag"
        :to="`/hashtags/${tag.tag}`"
        class="inline-flex items-center gap-2 rounded-full bg-[#F8E4C7] px-3 py-1 text-xs font-semibold text-[#1F130A] ring-1 ring-[#f2d9b8] transition hover:-translate-y-0.5 hover:shadow"
      >
        #{{ tag.tag }}
        <span class="text-[10px] text-[#5A4634]">{{ tag.count }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseMentionsAndTags } from "@/lib/socialParsing";

const props = defineProps<{
  postType?: "post" | "reel" | "all";
}>();

const tags = ref<{ tag: string; count: number }[]>([]);
const loading = ref(true);

const load = async () => {
  loading.value = true;
  try {
    const postsCol = collection(db, "posts");
    const constraints = [orderBy("createdAt", "desc"), limit(100)];
    if (props.postType && props.postType !== "all") {
      constraints.unshift(where("type", "==", props.postType));
    }
    const snap = await getDocs(query(postsCol, ...constraints));
    const counts: Record<string, number> = {};
    snap.docs.forEach((d) => {
      const data = d.data() as any;
      const text = data.content || "";
      const { hashtags } = parseMentionsAndTags(text);
      hashtags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    tags.value = Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  } catch (err) {
    console.error("Trending hashtags load failed", err);
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>
