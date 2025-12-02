<template>
  <main class="flex min-h-screen items-center justify-center bg-[#04343A] px-4 py-10">
    <div class="w-full max-w-md rounded-3xl bg-[#FFF7EC] p-8 shadow-2xl">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-semibold text-[#1F130A]">Welcome back to the Bhaihood</h1>
        <p class="mt-2 text-sm text-[#5A4634]">Log in to manage your dog’s Bhai identity and drip.</p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
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

        <button
          type="submit"
          :disabled="loading"
          class="mt-2 w-full rounded-xl bg-[#F6A623] px-4 py-3 text-sm font-semibold text-[#241A0E] shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? "Logging in…" : "Log In" }}
        </button>

        <p v-if="errorMessage" class="mt-2 text-center text-xs text-red-600">
          {{ errorMessage }}
        </p>

        <p class="mt-3 text-center text-xs text-[#5A4634]">
          New here?
          <RouterLink to="/signup" class="font-medium text-[#F6A623] hover:underline">Create an account</RouterLink>
          to join the Bhaihood.
        </p>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const router = useRouter();
const route = useRoute();

const onSubmit = async () => {
  errorMessage.value = null;

  if (!email.value || !password.value) {
    errorMessage.value = "Please enter both email and password.";
    return;
  }

  loading.value = true;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    console.log("Logged in as", userCredential.user.uid);
    const redirect = (route.query.redirect as string) || "/";
    await router.push(redirect);
  } catch (err: any) {
    console.error("Login error", err);
    if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
      errorMessage.value = "Invalid email or password.";
    } else if (err.code === "auth/too-many-requests") {
      errorMessage.value = "Too many attempts. Please try again later.";
    } else {
      errorMessage.value = "Something went wrong while logging in.";
    }
  } finally {
    loading.value = false;
  }
};
</script>
