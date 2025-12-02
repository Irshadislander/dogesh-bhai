<template>
  <main class="flex min-h-screen items-center justify-center bg-[#04343A] px-4 py-10">
    <div class="w-full max-w-md rounded-3xl bg-[#FFF7EC] p-8 shadow-2xl text-center">
      <h1 class="text-2xl font-semibold text-[#1F130A]">Verify your email</h1>
      <p class="mt-3 text-sm text-[#5A4634]">
        We sent a verification link to <span class="font-semibold">{{ auth.currentUser?.email }}</span>. Please verify your
        email to continue.
      </p>

      <div class="mt-6 space-y-3">
        <button
          type="button"
          :disabled="resending"
          class="w-full rounded-xl bg-[#F6A623] px-4 py-3 text-sm font-semibold text-[#241A0E] shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          @click="resend"
        >
          {{ resending ? "Sending…" : "Resend verification email" }}
        </button>
        <p v-if="message" class="text-xs text-emerald-700">{{ message }}</p>
        <p v-if="errorMessage" class="text-xs text-red-600">{{ errorMessage }}</p>
        <p class="text-xs text-[#5A4634]">We’ll refresh every few seconds and move you forward once verified.</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";

const router = useRouter();
const resending = ref(false);
const errorMessage = ref<string | null>(null);
const message = ref<string | null>(null);
let intervalId: number | undefined;

const checkVerification = async () => {
  const user = auth.currentUser;
  if (!user) return;
  await user.reload();
  if (user.emailVerified) {
    router.push("/register-dog");
  }
};

onMounted(() => {
  checkVerification();
  intervalId = window.setInterval(checkVerification, 5000);
});

onBeforeUnmount(() => {
  if (intervalId) window.clearInterval(intervalId);
});

const resend = async () => {
  const user = auth.currentUser;
  if (!user) return;
  resending.value = true;
  errorMessage.value = null;
  message.value = null;
  try {
    await sendEmailVerification(user);
    message.value = "Verification email sent.";
  } catch (err: any) {
    console.error("Resend verification failed", err);
    errorMessage.value = err?.message || "Could not resend verification email.";
  } finally {
    resending.value = false;
  }
};
</script>
