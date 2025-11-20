<template>
  <div class="min-h-screen bg-slate-50">
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <router-link to="/" class="flex items-center gap-2 text-lg font-semibold text-brand-blue">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">🐾</span>
          Visway Dogs
        </router-link>
        <nav class="flex items-center gap-4 text-sm font-medium text-slate-700">
          <router-link class="hover:text-brand-blue transition" to="/">Home</router-link>
          <router-link class="hover:text-brand-blue transition" to="/community">Community</router-link>
          <router-link class="hover:text-brand-blue transition" to="/dashboard">Dashboard</router-link>
          <router-link class="hover:text-brand-blue transition" to="/login">Login</router-link>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8">
      <router-view />
    </main>

    <footer class="border-t border-slate-200 bg-white/70 py-6 text-center text-sm text-slate-600">
      Built for the dog-loving community • Visway
    </footer>
  </div>
</template>

<script setup lang="ts"></script>
