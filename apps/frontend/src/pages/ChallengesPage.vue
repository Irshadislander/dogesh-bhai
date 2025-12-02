<template>
  <main class="min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <section class="border-b border-white/10 bg-[#04343A] text-white">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">Bhaihood Challenges</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">
          Join fun community challenges by posting with the featured hashtags. Show off your dog’s drip.
        </p>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
        <article
          v-for="challenge in challenges"
          :key="challenge.id"
          class="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="aspect-[16/9] bg-slate-100">
            <img v-if="challenge.sampleImage" :src="challenge.sampleImage" alt="" class="h-full w-full object-cover" loading="lazy" />
            <div v-else class="flex h-full w-full items-center justify-center text-sm text-[#5A4634]">Bhaihood challenge</div>
          </div>
          <div class="flex flex-1 flex-col gap-3 p-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-[#1F130A]">{{ challenge.title }}</h2>
              <RouterLink
                :to="`/hashtags/${challenge.hashtag}`"
                class="rounded-full bg-[#F6A623] px-3 py-1 text-xs font-semibold text-[#241A0E] shadow hover:shadow-md"
              >
                #{{ challenge.hashtag }}
              </RouterLink>
            </div>
            <p class="text-sm text-[#413530]">{{ challenge.description }}</p>
            <div class="flex items-center justify-between text-xs text-[#5A4634]">
              <span>Use the hashtag to join.</span>
              <RouterLink
                :to="`/hashtags/${challenge.hashtag}`"
                class="font-semibold text-[#04343A] hover:underline"
              >
                View posts
              </RouterLink>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import heroMain from "@/assets/Dogeshbhai/hero-main.png";
import trioWide from "@/assets/Dogeshbhai/trio-wide.png";

const challenges = [
  {
    id: "gold-chain-drip",
    title: "Gold Chain Drip",
    hashtag: "GoldChainDrip",
    description: "Show your dog rocking their boldest Bhai chain.",
    sampleImage: heroMain,
  },
  {
    id: "park-day-pack",
    title: "Park Day with the Pack",
    hashtag: "ParkDayPack",
    description: "Post your squad’s best park moments.",
    sampleImage: trioWide,
  },
  {
    id: "hoodie-hype",
    title: "Hoodie Hype",
    hashtag: "HoodieHype",
    description: "Match your dog’s hoodie with yours and flex together.",
    sampleImage: heroMain,
  },
];
</script>
