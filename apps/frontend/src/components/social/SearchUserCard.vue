<template>
  <div
    class="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition"
  @click="$router.push(`/profile/${user.id}`)"
  >
    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-[#1F130A] uppercase">
      {{ initials }}
    </div>
    <div class="min-w-0">
      <p class="truncate text-sm font-semibold text-[#1F130A]">{{ user.fullName || "Bhai User" }}</p>
      <p class="truncate text-xs text-[#5A4634]">{{ user.city || "Unknown city" }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  user: { id: string; fullName?: string; city?: string };
}>();

const router = useRouter();
const initials = computed(() => {
  return (
    props.user.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "BH"
  );
});
</script>
