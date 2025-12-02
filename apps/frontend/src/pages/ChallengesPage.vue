<template>
  <main class="min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <section class="border-b border-white/10 bg-[#04343A] text-white">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">Challenges & Leaderboard</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">Join weekly contests and climb the Bhai leaderboard.</p>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto grid max-w-6xl gap-6 px-6 lg:grid-cols-[1.2fr,1fr]">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-[#1F130A]">Active Challenges</h3>
          <div v-if="loading" class="rounded-3xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
            Loading challenges…
          </div>
          <div v-else-if="errorMessage" class="rounded-3xl bg-white p-4 text-sm text-red-600 ring-1 ring-slate-200">
            {{ errorMessage }}
          </div>
          <div v-else-if="challenges.length === 0" class="rounded-3xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
            No active challenges yet.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="challenge in challenges"
              :key="challenge.id"
              class="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <p class="text-lg font-semibold text-[#1F130A]">{{ challenge.title }}</p>
              <p class="text-sm text-[#5A4634]">{{ challenge.description }}</p>
              <p class="text-xs text-[#8A6A4A]">Hashtag: #{{ challenge.hashtag }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-[#1F130A]">Leaderboard</h3>
          <div v-if="loading" class="rounded-3xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
            Loading leaderboard…
          </div>
          <div v-else-if="leaders.length === 0" class="rounded-3xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
            Leaderboard updates soon.
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="(leader, idx) in leaders"
              :key="leader.id"
              class="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200"
            >
              <div class="flex items-center gap-3">
                <span class="text-sm font-semibold text-[#8A6A4A]">#{{ idx + 1 }}</span>
                <div>
                  <p class="text-sm font-semibold text-[#1F130A]">{{ leader.username || 'Bhai' }}</p>
                  <p class="text-xs text-[#5A4634]">Score: {{ leader.score || 0 }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Challenge = {
  id: string;
  title: string;
  description?: string;
  hashtag?: string;
};

type Leader = {
  id: string;
  username?: string;
  score?: number;
};

const challenges = ref<Challenge[]>([]);
const leaders = ref<Leader[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

onMounted(async () => {
  try {
    const challengesSnap = await getDocs(collection(db, "challenges"));
    challenges.value = challengesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    const leaderSnap = await getDocs(collection(db, "leaderboards"));
    leaders.value = leaderSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (err) {
    console.error("Failed to load challenges/leaderboard", err);
    errorMessage.value = "Something went wrong, please try again.";
  } finally {
    loading.value = false;
  }
});
</script>
