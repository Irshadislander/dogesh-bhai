<template>
  <section class="hero-gradient rounded-3xl border border-slate-200 p-10 shadow-sm">
    <div class="grid gap-10 md:grid-cols-2 items-center">
      <div class="space-y-6">
        <p class="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-blue ring-1 ring-brand-blue/20">
          Community-first for dog parents
        </p>
        <h1 class="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
          Register your dog, connect with neighbors, and share their adventures.
        </h1>
        <p class="text-lg text-slate-600">
          Visway gives every dog a living profile, keeps health records handy, and celebrates the pups in your neighborhood with a friendly community feed.
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <router-link to="/dogs/register">
            <el-button type="primary" size="large">Register a Dog</el-button>
          </router-link>
          <router-link to="/community">
            <el-button size="large" plain>Explore Community</el-button>
          </router-link>
        </div>
        <div class="flex flex-wrap gap-4 text-sm text-slate-600">
          <span class="inline-flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-emerald-400"></span>Real profiles</span>
          <span class="inline-flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-blue-400"></span>Firebase security</span>
          <span class="inline-flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-orange-400"></span>Community updates</span>
        </div>
      </div>
      <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div class="grid gap-4">
          <div class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">Latest registration</p>
              <p class="text-lg font-semibold text-slate-900">Luna the Corgi</p>
            </div>
            <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Verified</span>
          </div>
          <div class="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
            <p class="font-semibold text-slate-900">Join your local pack</p>
            <p>Create a profile, share photos, and meet other owners around you.</p>
          </div>
          <div class="grid grid-cols-3 gap-3 text-center text-sm">
            <div class="rounded-xl bg-blue-50 p-3">
              <p class="text-xl font-bold text-blue-600">240</p>
              <p class="text-slate-600">Dogs onboard</p>
            </div>
            <div class="rounded-xl bg-emerald-50 p-3">
              <p class="text-xl font-bold text-emerald-600">89</p>
              <p class="text-slate-600">Walk buddies</p>
            </div>
            <div class="rounded-xl bg-amber-50 p-3">
              <p class="text-xl font-bold text-amber-600">120</p>
              <p class="text-slate-600">Community posts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
