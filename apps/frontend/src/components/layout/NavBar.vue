<template>
  <header class="sticky top-0 z-50 bg-teal-900/90 backdrop-blur shadow-md">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
      <RouterLink to="/" class="flex items-center gap-2 text-white">
        <span class="text-xl font-bold tracking-wide">🐶 Dogesh Bhai</span>
      </RouterLink>
      <button
        type="button"
        class="rounded-lg border border-white/30 p-2 text-white md:hidden"
        @click="menuOpen = !menuOpen"
        aria-label="Toggle navigation"
      >
        <svg v-if="!menuOpen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <nav class="hidden items-center gap-6 text-sm font-medium text-white md:flex">
        <RouterLink class="hover:text-yellow-400 transition" to="/">Home</RouterLink>
        <RouterLink class="hover:text-yellow-400 transition" to="/feed/posts">Feed Posts</RouterLink>
        <RouterLink class="hover:text-yellow-400 transition" to="/feed/reels">Feed Reels</RouterLink>
        <RouterLink class="hover:text-yellow-400 transition" to="/dashboard">Dashboard</RouterLink>
        <RouterLink class="hover:text-yellow-400 transition" to="/community">Community</RouterLink>
        <RouterLink class="hover:text-yellow-400 transition" to="/messages">Messages</RouterLink>
        <RouterLink class="hover:text-yellow-400 transition" to="/login">Login</RouterLink>
        <NotificationsBell />
      </nav>
    </div>
    <div v-if="menuOpen" class="border-t border-white/10 bg-teal-950/95 px-4 py-3 text-sm font-medium text-white md:hidden">
      <div class="flex flex-col gap-2">
        <RouterLink class="rounded px-3 py-2 hover:bg-white/10 transition" to="/" @click="menuOpen = false">Home</RouterLink>
        <RouterLink class="rounded px-3 py-2 hover:bg-white/10 transition" to="/feed/posts" @click="menuOpen = false">Feed Posts</RouterLink>
        <RouterLink class="rounded px-3 py-2 hover:bg-white/10 transition" to="/feed/reels" @click="menuOpen = false">Feed Reels</RouterLink>
        <RouterLink class="rounded px-3 py-2 hover:bg-white/10 transition" to="/dashboard" @click="menuOpen = false">Dashboard</RouterLink>
        <RouterLink class="rounded px-3 py-2 hover:bg-white/10 transition" to="/community" @click="menuOpen = false">Community</RouterLink>
        <RouterLink class="rounded px-3 py-2 hover:bg-white/10 transition" to="/messages" @click="menuOpen = false">Messages</RouterLink>
        <RouterLink class="rounded px-3 py-2 hover:bg-white/10 transition" to="/login" @click="menuOpen = false">Login</RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import NotificationsBell from "@/components/social/NotificationsBell.vue";

const menuOpen = ref(false);
</script>
