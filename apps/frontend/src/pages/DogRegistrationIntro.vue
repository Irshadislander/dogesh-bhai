<template>
  <main class="flex min-h-screen items-center justify-center bg-[#04343A] px-6 py-12">
    <div class="w-full max-w-3xl rounded-3xl bg-[#FFF7EC] p-10 shadow-2xl">
      <div class="space-y-4 text-center">
        <p class="text-sm uppercase tracking-wide text-[#8A6A4A]">Dogesh Bhai Onboarding</p>
        <h1 class="text-3xl font-semibold text-[#1F130A]">Set up your dog’s identity</h1>
        <p class="text-[#413530]">
          Create your dog’s Bhai profile so every post and reel proudly shows their name, breed, and drip. It only takes a
          minute.
        </p>
      </div>
      <div class="mt-8 flex flex-col items-center justify-center gap-4">
        <button
          type="button"
          class="rounded-full bg-[#F6A623] px-6 py-3 text-sm font-semibold text-[#241A0E] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          @click="start"
        >
          Start
        </button>
        <p class="text-xs text-[#5A4634]">You’ll be able to edit details later.</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
const start = () => router.push("/register-dog/form");
</script>
