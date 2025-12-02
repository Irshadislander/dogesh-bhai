<template>
  <main class="flex min-h-screen items-center justify-center bg-[#04343A] px-4 py-10">
    <div class="w-full max-w-md rounded-3xl bg-[#FFF7EC] p-8 shadow-2xl">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-semibold text-[#1F130A]">Join the Bhaihood</h1>
        <p class="mt-2 text-sm text-[#5A4634]">Create your account to share your dog’s drip and identity.</p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-xs font-medium uppercase tracking-wide text-[#5A4634]">Display name</label>
          <input
            v-model="displayName"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
            placeholder="Dogesh Lover"
          />
        </div>

        <div>
          <label class="block text-xs font-medium uppercase tracking-wide text-[#5A4634]">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
            placeholder="you@bhaihood.com"
          />
        </div>

        <div>
          <label class="block text-xs font-medium uppercase tracking-wide text-[#5A4634]">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
            placeholder="••••••••"
          />
        </div>

        <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="mt-2 w-full rounded-xl bg-[#F6A623] px-4 py-3 text-sm font-semibold text-[#241A0E] shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? "Creating account…" : "Create account" }}
        </button>

        <p class="mt-3 text-center text-xs text-[#5A4634]">
          Already have an account?
          <RouterLink to="/login" class="font-medium text-[#F6A623] hover:underline">Log in</RouterLink>
        </p>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);
const router = useRouter();

const displayName = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref<string | null>(null);

const onSubmit = async () => {
  errorMessage.value = null;
  loading.value = true;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value, password.value);
    if (displayName.value.trim()) {
      await updateProfile(cred.user, { displayName: displayName.value.trim() });
    }
    await router.push("/feed/posts");
  } catch (err: any) {
    console.error("Signup failed", err);
    errorMessage.value = err?.message || "Failed to create account.";
  } finally {
    loading.value = false;
  }
};
</script>
