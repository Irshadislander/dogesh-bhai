<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div class="w-full max-w-sm rounded-2xl bg-[#0D2C30] p-5 text-white shadow-xl ring-1 ring-[#0f3940]">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Share</h3>
        <button class="rounded-full bg-white/10 p-2 hover:bg-white/20" @click="$emit('close')">✕</button>
      </div>
      <div class="mt-4 space-y-2 text-sm">
        <button class="w-full rounded-xl bg-white/10 px-3 py-2 text-left hover:bg-white/20" @click="copyLink">
          Copy link
        </button>
        <a
          class="block w-full rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20"
          :href="`https://wa.me/?text=${encodedLink}`"
          target="_blank"
          rel="noreferrer"
        >
          Share to WhatsApp
        </a>
        <a
          class="block w-full rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20"
          :href="`https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`"
          target="_blank"
          rel="noreferrer"
        >
          Share to Facebook
        </a>
        <button class="w-full rounded-xl bg-white/10 px-3 py-2 text-left hover:bg-white/20" @click="shareInternal">
          Share inside Dogesh Bhai (coming soon)
        </button>
        <p v-if="feedback" class="text-xs text-[#9ac0ba]">{{ feedback }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  open: boolean;
  link: string;
}>();

const feedback = ref("");
const encodedLink = computed(() => encodeURIComponent(props.link));

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.link);
    feedback.value = "Link copied!";
  } catch (err) {
    console.error("Copy failed", err);
    feedback.value = "Copy failed";
  }
};

const shareInternal = () => {
  feedback.value = "Internal sharing coming soon.";
};
</script>
