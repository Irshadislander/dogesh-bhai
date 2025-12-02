<template>
  <main class="min-h-screen bg-[#FFF7EC]">
    <section class="bg-[#04343A] text-white">
      <div class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center">
        <div class="flex-1 space-y-3">
          <h1 class="text-3xl font-semibold md:text-4xl">Join the Bhaihood</h1>
          <p class="text-sm text-[#FFE8C7] md:text-base">
            Register your dog, pick their Bhai fit, and get them ready for the digital brotherhood.
          </p>
        </div>
        <div class="hidden flex-1 md:block">
          <div class="overflow-hidden rounded-3xl bg-[#021D25] shadow-lg">
            <img :src="trioTall" alt="Dogesh Bhai pack" class="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto grid max-w-6xl items-start gap-10 px-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div class="space-y-6 rounded-3xl bg-white p-6 shadow-lg md:p-8">
          <div>
            <label class="block text-sm font-semibold text-[#1F130A]">Owner name</label>
            <input
              v-model="form.ownerName"
              type="text"
              class="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
              placeholder="Your name"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-[#1F130A]">Owner email</label>
            <input
              v-model="form.ownerEmail"
              type="email"
              class="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
              placeholder="you@bhaihood.com"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-[#1F130A]">Dog's name</label>
            <input
              v-model="form.dogName"
              type="text"
              class="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
              placeholder="Milo, Luna, Bruno..."
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-[#1F130A]">Breed</label>
            <select
              v-model="form.breed"
              class="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-[#1F130A] outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
            >
              <option value="">Select a breed</option>
              <option>Mixed Bhai</option>
              <option>Golden Retriever</option>
              <option>German Shepherd</option>
              <option>French Bulldog</option>
              <option>Labrador</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-[#1F130A]">Personality</label>
            <textarea
              v-model="form.personality"
              rows="4"
              class="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
              placeholder="Describe your dog's vibe"
            ></textarea>
          </div>

          <div>
            <p class="text-sm font-semibold text-[#1F130A]">Outfit choice</p>
            <div class="mt-3 flex flex-wrap gap-3">
              <button
                v-for="option in outfits"
                :key="option"
                type="button"
                @click="form.outfit = option"
                class="rounded-full px-4 py-2 text-sm font-semibold transition"
                :class="form.outfit === option ? 'bg-[#F6A623] text-[#241A0E] shadow' : 'bg-slate-100 text-[#1F130A]'"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <input
              v-model="form.acceptsTerms"
              type="checkbox"
              id="agree"
              class="mt-1 h-4 w-4 rounded border-slate-300 text-[#F6A623] focus:ring-[#F6A623]"
            />
            <label for="agree" class="text-sm text-[#1F130A]">
              I agree that my dog is ready to become a certified Bhai.
            </label>
          </div>

          <button
            type="button"
            @click="saveBhaiProfile"
            :disabled="saving"
            class="w-full rounded-xl bg-[#F6A623] px-4 py-3 text-sm font-semibold text-[#241A0E] shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ saving ? "Saving…" : "Save Bhai Profile" }}
          </button>
          <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
          <p v-if="saveSuccess" class="text-sm text-emerald-700">
            Bhai profile saved! Your dog is now one step closer to the Bhaihood.
          </p>
        </div>

        <div class="space-y-4 rounded-3xl bg-[#04343A] p-6 text-white shadow-lg md:p-8">
          <p class="text-sm text-[#FFE8C7]">Preview</p>
          <div class="flex items-center gap-4 rounded-2xl bg-[#021D25] p-4">
            <img :src="previewImage" alt="Bhai avatar" class="h-16 w-16 rounded-2xl object-cover" />
            <div>
              <p class="text-lg font-semibold">{{ form.dogName || "Your Dog" }}</p>
              <p class="text-sm text-[#BFD8D6]">{{ form.breed || "Select a breed" }}</p>
            </div>
          </div>
          <div class="rounded-2xl bg-white/5 p-4 text-sm">
            <p class="font-semibold">Personality</p>
            <p class="mt-1 text-[#D8E8E6]">
              {{ form.personality || "Describe your dog's vibe to show in their Bhai card." }}
            </p>
          </div>
          <div class="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-[#FFE8C7]">
            <span class="h-2 w-2 rounded-full bg-amber-400"></span>
            Pending Bhaihood approval
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import heroMain from "@/assets/Dogeshbhai/hero-main.png";
import trioTall from "@/assets/Dogeshbhai/trio-tall.png";
import singleDogChain from "@/assets/Dogeshbhai/single-dog-chain.png";
import singleDogHoodie from "@/assets/Dogeshbhai/single-dog-hoodie.png";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "vue-router";

const form = reactive({
  ownerName: "",
  ownerEmail: "",
  dogName: "",
  breed: "",
  personality: "",
  outfit: "Hoodie",
  acceptsTerms: false,
});

const outfits = ["Hoodie", "Chain", "Full Drip"];

const saving = ref(false);
const saveError = ref<string | null>(null);
const saveSuccess = ref(false);
const router = useRouter();

const previewImage = computed(() => {
  if (form.outfit === "Chain") return singleDogChain;
  if (form.outfit === "Full Drip") return heroMain;
  return singleDogHoodie;
});

const saveBhaiProfile = async () => {
  saveError.value = null;
  saveSuccess.value = false;

  if (!form.ownerName || !form.ownerEmail || !form.dogName || !form.breed || !form.outfit) {
    saveError.value = "Please fill all required fields.";
    return;
  }

  if (!form.acceptsTerms) {
    saveError.value = "Please confirm your dog is ready to become a Bhai.";
    return;
  }

  saving.value = true;
  try {
    const dogsCol = collection(db, "dogs");
    await addDoc(dogsCol, {
      ownerId: auth.currentUser?.uid || "",
      ownerName: form.ownerName,
      ownerEmail: form.ownerEmail,
      dogName: form.dogName,
      breed: form.breed,
      personality: form.personality || "",
      outfit: form.outfit,
      city: (form as any).city || "",
      avatarImageUrl: (form as any).avatarUrl || "",
      createdAt: serverTimestamp(),
    });

    saveSuccess.value = true;
    await router.push("/feed/posts");
  } catch (err) {
    console.error("Failed to save dog profile", err);
    saveError.value = "Could not save your Bhai profile. Please try again.";
  } finally {
    saving.value = false;
  }
};
</script>
