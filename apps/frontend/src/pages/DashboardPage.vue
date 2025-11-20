<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm uppercase tracking-wide text-slate-500">Dashboard</p>
        <h2 class="text-3xl font-bold text-slate-900">Your dogs and community at a glance</h2>
      </div>
      <router-link to="/dogs/register">
        <el-button type="primary">Register another dog</el-button>
      </router-link>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p class="text-sm text-slate-500">Registered dogs</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">{{ dogs.length }}</p>
      </div>
      <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p class="text-sm text-slate-500">Community posts</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">{{ posts.length }}</p>
      </div>
      <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p class="text-sm text-slate-500">Last sync</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">{{ lastUpdated }}</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900">Recent dogs</h3>
          <router-link class="text-sm text-brand-blue" to="/dogs/register">Add new</router-link>
        </div>
        <ul class="mt-4 divide-y divide-slate-100">
          <li v-for="dog in dogs" :key="dog.id" class="py-3">
            <router-link :to="`/dogs/${dog.id}`" class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-slate-900">{{ dog.name }}</p>
                <p class="text-sm text-slate-600">{{ dog.breed || "Unknown breed" }}</p>
              </div>
              <span class="text-xs text-slate-500">{{ dog.age ? dog.age + ' yrs' : 'Age n/a' }}</span>
            </router-link>
          </li>
          <li v-if="dogs.length === 0" class="py-3 text-sm text-slate-600">No dogs yet. Register your first pup!</li>
        </ul>
      </div>
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900">Community feed</h3>
          <router-link class="text-sm text-brand-blue" to="/community">Open feed</router-link>
        </div>
        <ul class="mt-4 space-y-3">
          <li v-for="post in posts" :key="post.id" class="rounded-lg border border-slate-100 p-3">
            <p class="text-sm text-slate-600">{{ post.authorId }}</p>
            <p class="mt-1 font-medium text-slate-900">{{ post.content }}</p>
            <div class="mt-2 flex items-center gap-3 text-xs text-slate-500">
              <span>{{ new Date(post.createdAt).toLocaleString() }}</span>
              <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">❤️ {{ post.likes || 0 }}</span>
            </div>
          </li>
          <li v-if="posts.length === 0" class="text-sm text-slate-600">No posts yet. Be the first to share!</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { fetchCommunityPosts, fetchDogs } from "@/lib/api";
import type { DogProfile, CommunityPost } from "@visway/shared";

const dogs = ref<DogProfile[]>([]);
const posts = ref<CommunityPost[]>([]);
const lastUpdated = computed(() => new Date().toLocaleTimeString());

onMounted(async () => {
  try {
    dogs.value = await fetchDogs();
    posts.value = await fetchCommunityPosts();
  } catch (error) {
    console.error(error);
  }
});
</script>
