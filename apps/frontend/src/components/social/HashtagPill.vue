<template>
  <RouterLink
    :to="`/hashtags/${tag}`"
    class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#04343A] ring-1 ring-slate-200 hover:-translate-y-0.5 hover:shadow transition"
  >
    #{{ tag }}
    <span v-if="count !== undefined" class="text-xs text-[#5A4634]">{{ count }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

defineProps<{
  tag: string;
  count?: number;
}>();
</script>
