<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-[#1F130A]">{{ title }}</h2>
      <button
        v-if="seeAllLabel && items.length > 0"
        class="text-xs font-semibold text-[#04343A] hover:underline"
        @click="$emit('see-all')"
      >
        {{ seeAllLabel }}
      </button>
    </div>
    <div v-if="items.length === 0" class="rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
      {{ emptyText }}
    </div>
    <div v-else class="grid gap-3 md:grid-cols-2">
      <slot v-for="item in items" :key="item.id || item.tag || JSON.stringify(item)" name="item" :item="item" />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  items: any[];
  emptyText?: string;
  seeAllLabel?: string;
}>();

defineEmits<{
  (e: "see-all"): void;
}>();
</script>
