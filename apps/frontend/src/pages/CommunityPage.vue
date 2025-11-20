<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm uppercase tracking-wide text-slate-500">Community</p>
        <h2 class="text-3xl font-bold text-slate-900">Share updates with fellow dog parents</h2>
      </div>
      <router-link to="/login" class="text-sm text-brand-blue">Sign in to post</router-link>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div
        v-for="post in posts"
        :key="post.id"
        class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
      >
        <p class="text-xs uppercase tracking-wide text-slate-500">{{ post.authorId }}</p>
        <p class="mt-1 text-lg font-semibold text-slate-900">{{ post.content }}</p>
        <p class="text-sm text-slate-600">{{ new Date(post.createdAt).toLocaleString() }}</p>
        <div class="mt-3 flex items-center gap-3 text-sm text-slate-600">
          <el-button size="small" @click="handleLike(post.id)">
            ❤️ Like ({{ post.likes || 0 }})
          </el-button>
          <span v-if="post.dogId">Dog ID: {{ post.dogId }}</span>
        </div>
      </div>
      <p v-if="posts.length === 0" class="text-slate-600">No posts yet. Be the first to share an update!</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { CommunityPost } from "@visway/shared";
import { fetchCommunityPosts, likePost } from "@/lib/api";

const posts = ref<CommunityPost[]>([]);

const loadPosts = async () => {
  try {
    posts.value = await fetchCommunityPosts();
  } catch (error) {
    console.error(error);
  }
};

const handleLike = async (id: string) => {
  try {
    const updated = await likePost(id);
    posts.value = posts.value.map((post) => (post.id === id ? updated : post));
  } catch (error) {
    console.error(error);
  }
};

onMounted(loadPosts);
</script>
