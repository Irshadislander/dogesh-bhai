<template>
  <div
    class="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition"
    @click="$router.push(`/dog/${dog.id}`)"
  >
    <div class="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
      <img v-if="dog.avatarImageUrl" :src="dog.avatarImageUrl" alt="" class="h-full w-full object-cover" loading="lazy" />
      <div v-else class="flex h-full w-full items-center justify-center text-sm font-semibold text-[#1F130A]">
        {{ (dog.dogName || "B")[0] }}
      </div>
    </div>
    <div class="min-w-0">
      <p class="truncate text-sm font-semibold text-[#1F130A]">{{ dog.dogName || "Unknown Bhai" }}</p>
      <p class="truncate text-xs text-[#5A4634]">
        {{ dog.breed || "Mystery breed" }} <span v-if="dog.city">• {{ dog.city }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

defineProps<{
  dog: { id: string; dogName?: string; breed?: string; city?: string; avatarImageUrl?: string };
}>();

const router = useRouter();
</script>
