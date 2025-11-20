<template>
  <div class="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
    <h2 class="mb-2 text-2xl font-semibold text-slate-900">Welcome back</h2>
    <p class="mb-6 text-sm text-slate-600">Sign in with your email to manage your dog's profile and join the community.</p>
    <el-form :model="form" label-position="top" @submit.prevent="handleLogin">
      <el-form-item label="Email">
        <el-input v-model="form.email" type="email" placeholder="you@example.com" required />
      </el-form-item>
      <el-form-item label="Password">
        <el-input v-model="form.password" type="password" placeholder="••••••••" required />
      </el-form-item>
      <el-button type="primary" class="w-full" :loading="userStore.loading" @click="handleLogin">
        Sign in
      </el-button>
      <p v-if="userStore.error" class="mt-3 text-sm text-rose-600">{{ userStore.error }}</p>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  email: "",
  password: "",
});

const handleLogin = async () => {
  await userStore.login(form.email, form.password);
  if (userStore.user) {
    router.push({ name: "dashboard" });
  }
};
</script>
