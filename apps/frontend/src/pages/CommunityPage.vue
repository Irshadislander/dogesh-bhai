<template>
  <main class="min-h-screen bg-[#04343A] text-white">
    <section class="border-b border-white/10">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">Watch & Laugh</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">
          Catch the funniest #DogeshBhai moments from the Bhaihood. No sad dogs allowed.
        </p>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto max-w-6xl px-6">
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="clip in clips"
            :key="clip.id"
            class="group relative overflow-hidden rounded-3xl bg-black/30 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div class="aspect-video w-full overflow-hidden">
              <img
                :src="clip.image"
                :alt="clip.title"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-black/30" />
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-lg font-bold text-[#04343A]">
                  ▶
                </div>
              </div>
              <div class="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs">
                {{ clip.duration }}
              </div>
            </div>
            <div class="p-4">
              <h2 class="text-sm font-semibold md:text-base">{{ clip.title }}</h2>
              <p class="mt-1 text-xs text-[#E6D7C7]/80">#DogeshBhai • Community upload</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import heroMain from "@/assets/Dogeshbhai/hero-main.png";
import trioWide from "@/assets/Dogeshbhai/trio-wide.png";

const clips = [
  { id: 1, title: "Morning Walk Drip Check", duration: "0:42", image: trioWide },
  { id: 2, title: "Bhaihood Hoodie Try-On", duration: "1:03", image: heroMain },
  { id: 3, title: "Park Day with the Pack", duration: "0:55", image: trioWide },
  { id: 4, title: "Gold Chain Unboxing", duration: "1:18", image: heroMain },
  { id: 5, title: "Late Night Treat Run", duration: "0:48", image: trioWide },
  { id: 6, title: "Bhai Dance Challenge", duration: "1:05", image: heroMain },
];
</script>
