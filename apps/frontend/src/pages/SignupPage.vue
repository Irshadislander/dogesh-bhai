<template>
  <main class="flex min-h-screen items-center justify-center bg-[#04343A] px-4 py-10">
    <div class="w-full max-w-md rounded-3xl bg-[#FFF7EC] p-8 shadow-2xl">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-semibold text-[#1F130A]">Join the Bhaihood</h1>
        <p class="mt-2 text-sm text-[#5A4634]">Create your account to share your dog’s drip and identity.</p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-xs font-medium uppercase tracking-wide text-[#5A4634]">Full name</label>
          <input
            v-model="fullName"
            type="text"
            required
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

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
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

          <div>
            <label class="block text-xs font-medium uppercase tracking-wide text-[#5A4634]">Confirm password</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
              placeholder="Repeat password"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label class="block text-xs font-medium uppercase tracking-wide text-[#5A4634]">Date of birth</label>
            <input
              v-model="dateOfBirth"
              type="date"
              class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
            />
          </div>
          <div>
            <label class="block text-xs font-medium uppercase tracking-wide text-[#5A4634]">City</label>
            <input
              v-model="city"
              type="text"
              class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
              placeholder="Mumbai, Delhi, Bangalore..."
            />
          </div>
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
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

const auth = getAuth(app);
const router = useRouter();

const fullName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const dateOfBirth = ref("");
const city = ref("");
const loading = ref(false);
const errorMessage = ref<string | null>(null);

const onSubmit = async () => {
  errorMessage.value = null;

  if (!fullName.value.trim()) {
    errorMessage.value = "Please enter your full name.";
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }
  if (password.value.length < 6) {
    errorMessage.value = "Password must be at least 6 characters.";
    return;
  }

  loading.value = true;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value, password.value);
    if (fullName.value.trim()) {
      await updateProfile(cred.user, { displayName: fullName.value.trim() });
    }

    await setDoc(doc(db, "users", cred.user.uid), {
      fullName: fullName.value.trim(),
      email: email.value.trim().toLowerCase(),
      city: city.value.trim(),
      dateOfBirth: dateOfBirth.value || null,
      createdAt: serverTimestamp(),
    });

    await sendEmailVerification(cred.user);
    await router.push("/verify-email");
  } catch (err: any) {
    console.error("Signup failed", err);
    errorMessage.value = err?.message || "Failed to create account.";
  } finally {
    loading.value = false;
  }
};
</script>
