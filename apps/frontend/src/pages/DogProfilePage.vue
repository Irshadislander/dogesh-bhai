<template>
  <section class="max-w-2xl space-y-4" v-if="!loading">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm uppercase tracking-wide text-slate-500">Dog profile</p>
        <h2 class="text-3xl font-bold text-slate-900">{{ dog?.name }}</h2>
        <p class="text-slate-600">Owned by {{ dog?.ownerId }}</p>
      </div>
      <span class="rounded-full bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700">Verified</span>
    </div>
    <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <dl class="grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs uppercase tracking-wide text-slate-500">Breed</dt>
          <dd class="text-lg font-semibold text-slate-900">{{ dog?.breed || "Unknown" }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wide text-slate-500">Age</dt>
          <dd class="text-lg font-semibold text-slate-900">{{ dog?.age ?? "N/A" }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wide text-slate-500">Tags</dt>
          <dd class="text-lg font-semibold text-slate-900">
            <span v-if="dog?.tags?.length" class="flex flex-wrap gap-2">
              <span v-for="tag in dog?.tags" :key="tag" class="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{{ tag }}</span>
            </span>
            <span v-else class="text-sm text-slate-600">No tags yet</span>
          </dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wide text-slate-500">Updated</dt>
          <dd class="text-lg font-semibold text-slate-900">{{ dog?.updatedAt || dog?.createdAt }}</dd>
        </div>
      </dl>
      <div class="mt-4">
        <dt class="text-xs uppercase tracking-wide text-slate-500">Bio</dt>
        <dd class="mt-1 text-slate-700">{{ dog?.bio || "No bio provided." }}</dd>
      </div>
    </div>
  </section>
  <div v-else class="py-10 text-center text-slate-600">Loading dog profile…</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { DogProfile } from "@visway/shared";
import apiClient from "@/lib/api";

const route = useRoute();
const dog = ref<DogProfile | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await apiClient.get<DogProfile>(`/dogs/${route.params.id}`);
    dog.value = data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});
</script>
