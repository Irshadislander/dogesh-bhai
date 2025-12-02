<template>
  <main class="min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <section class="border-b border-white/10 bg-[#04343A] text-white">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">Bhai Dashboard</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">
          See who has officially joined the Bhaihood. These are the registered dog profiles from the community.
        </p>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto max-w-6xl px-6">
        <div v-if="loading" class="py-10 text-center text-sm text-slate-600">
          Loading Bhai profiles…
        </div>

        <div v-else-if="errorMessage" class="py-10 text-center text-sm text-red-600">
          {{ errorMessage }}
        </div>

        <div v-else-if="dogs.length === 0" class="py-10 text-center text-sm text-slate-600">
          No Bhai profiles yet. Be the first to register your dog from the <span class="font-semibold">Join the Bhaihood</span> page.
        </div>

        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="dog in dogs"
            :key="dog.id"
            class="group overflow-hidden rounded-3xl bg-[#F8E4C7] shadow transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div class="relative aspect-[4/3] overflow-hidden">
              <img
                :src="getAvatarForOutfit(dog.outfit)"
                :alt="dog.dogName"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div class="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                {{ dog.outfit || "bhai" }}
              </div>
            </div>

            <div class="space-y-2 p-4">
              <div class="flex items-baseline justify-between gap-2">
                <h2 class="text-lg font-semibold text-[#1F130A]">
                  {{ dog.dogName || "Unnamed Bhai" }}
                </h2>
                <span class="text-xs text-[#5A4634]">
                  {{ formatDate(dog.createdAt) }}
                </span>
              </div>

              <p class="text-xs font-medium uppercase tracking-wide text-[#8A6A4A]">
                {{ dog.breed || "Mystery breed" }}
              </p>

              <p v-if="dog.personality" class="text-sm text-[#413530] line-clamp-2">
                {{ dog.personality }}
              </p>

              <p class="mt-2 text-xs text-[#5A4634]">
                Owner: <span class="font-medium">{{ dog.ownerName || "Unknown" }}</span>
                <span v-if="dog.ownerEmail" class="block text-[10px] md:inline md:ml-1">
                  ({{ dog.ownerEmail }})
                </span>
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import heroMain from "@/assets/Dogeshbhai/hero-main.png";
import singleDogChain from "@/assets/Dogeshbhai/single-dog-chain.png";
import singleDogHoodie from "@/assets/Dogeshbhai/single-dog-hoodie.png";

type DogDoc = {
  id: string;
  ownerName: string;
  ownerEmail: string;
  dogName: string;
  breed: string;
  personality?: string;
  outfit?: "hoodie" | "chain" | "full" | string;
  createdAt?: any;
};

const dogs = ref<DogDoc[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  try {
    const dogsCol = collection(db, "dogs");
    const q = query(dogsCol, orderBy("createdAt", "desc"));

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: DogDoc[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            ownerName: data.ownerName ?? "",
            ownerEmail: data.ownerEmail ?? "",
            dogName: data.dogName ?? "",
            breed: data.breed ?? "",
            personality: data.personality ?? "",
            outfit: data.outfit ?? "",
            createdAt: data.createdAt ?? null,
          };
        });

        dogs.value = items;
        loading.value = false;
      },
      (err) => {
        console.error("Error loading dogs:", err);
        errorMessage.value = "Failed to load Bhai profiles.";
        loading.value = false;
      }
    );
  } catch (err) {
    console.error(err);
    errorMessage.value = "Failed to load Bhai profiles.";
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe();
});

const getAvatarForOutfit = (outfit?: string) => {
  if (!outfit) return heroMain;
  const lower = outfit.toLowerCase();

  if (lower.includes("hoodie")) return singleDogHoodie;
  if (lower.includes("chain")) return singleDogChain;
  if (lower.includes("full")) return heroMain;

  return heroMain;
};

const formatDate = (ts?: any) => {
  if (!ts || typeof ts.toDate !== "function") return "";
  const date = ts.toDate();
  return date.toLocaleString();
};
</script>
