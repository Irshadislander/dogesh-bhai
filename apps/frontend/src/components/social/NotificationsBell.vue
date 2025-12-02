<template>
  <div class="relative">
    <RouterLink
      to="/notifications"
      class="relative flex items-center gap-1 rounded-full px-3 py-2 text-white hover:bg-white/10 transition"
      aria-label="Notifications"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span
        v-if="!loading && unreadCount > 0"
        class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-semibold text-black"
      >
        {{ unreadCount }}
      </span>
      <span v-else-if="loading" class="text-[10px] text-white/70">…</span>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { subscribeToUnreadCount } from "@/lib/notifications";

const unreadCount = ref(0);
const loading = ref(true);
let unsub: (() => void) | null = null;
let unsubAuth: (() => void) | null = null;

const listen = (uid: string) => {
  if (unsub) unsub();
  unsub = subscribeToUnreadCount(uid, (count) => {
    unreadCount.value = count;
    loading.value = false;
  });
};

onMounted(() => {
  unsubAuth = onAuthStateChanged(auth, (user) => {
    if (user?.uid) {
      loading.value = true;
      listen(user.uid);
    } else {
      unreadCount.value = 0;
      loading.value = false;
      if (unsub) {
        unsub();
        unsub = null;
      }
    }
  });
});

onBeforeUnmount(() => {
  if (unsub) unsub();
  if (unsubAuth) unsubAuth();
});
</script>
