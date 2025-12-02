<template>
  <main class="flex flex-col min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <!-- Hero -->
    <section
      id="hero"
      class="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center text-white"
      :style="`background-image: url(${heroMain})`"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
      <div class="relative mx-auto max-w-3xl px-6 text-center">
        <h1 class="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
          Every Dog Deserves to Be a Bhai.
        </h1>
        <p class="mt-5 text-lg text-[#FFE8C7] md:text-xl">
          Grooming. Drip. Identity. All in one pack.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            @click="goToRegister"
            class="rounded-md bg-[#F6A623] px-6 py-3 font-semibold text-[#241A0E] shadow transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Join the Bhaihood
          </button>
          <button
            type="button"
            @click="goToProducts"
            class="rounded-md border border-[#F6A623] bg-transparent px-6 py-3 font-semibold text-[#F6A623] transition hover:bg-[#F6A623]/10"
          >
            Explore Products
          </button>
        </div>
      </div>
    </section>

    <!-- About -->
    <section id="about" class="bg-[#FFF7EC] py-16">
      <div class="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div>
          <h2 class="text-3xl font-semibold text-[#1F130A] md:text-4xl">About the Bhaihood</h2>
          <p class="mt-4 text-base text-[#413530] md:text-lg">
            Dogesh Bhai is the digital brotherhood of four-legged legends. It is where every pup gets their drip,
            their identity, and their spotlight.
          </p>
          <p class="mt-4 text-base text-[#413530] md:text-lg">
            We mix playful street style with cozy grooming care so dogs feel as cool as they look. Because every Bhai
            deserves a pack that hypes them up.
          </p>
          <p class="mt-4 text-base text-[#413530] md:text-lg">
            Join the community, grab the fit, and let your dog flex their inner Bhai in the friendliest corner of the
            internet.
          </p>
        </div>
        <div class="overflow-hidden rounded-3xl bg-[#04343A] shadow-lg">
          <img :src="trioTall" alt="Three dogs in hoodies" class="h-full w-full object-cover" />
        </div>
      </div>
    </section>

    <!-- Products -->
    <section id="products" class="bg-[#FFF7EC] pb-16">
      <div class="mx-auto max-w-6xl px-6">
        <div class="grid gap-8 md:grid-cols-3">
          <div class="flex flex-col overflow-hidden rounded-3xl bg-[#F8E4C7] shadow transition hover:shadow-lg">
            <div class="relative aspect-[4/3] bg-[#F6A623]/50 flex items-center justify-center text-5xl">🧼</div>
            <div class="flex flex-1 flex-col p-6">
              <h3 class="text-xl font-semibold text-[#1F130A]">Grooming</h3>
              <p class="mt-2 text-sm text-[#413530]">
                Fresh cuts, clean coats, and spa vibes to keep every Bhai shining.
              </p>
              <button
                class="mt-4 self-start rounded-md bg-[#F6A623] px-4 py-2 text-sm font-semibold text-[#241A0E] shadow transition hover:shadow-lg"
              >
                Shop Now
              </button>
            </div>
          </div>

          <div class="flex flex-col overflow-hidden rounded-3xl bg-[#F8E4C7] shadow transition hover:shadow-lg">
            <div class="relative aspect-[4/3]">
              <img :src="singleDogChain" alt="Dog wearing chains" class="h-full w-full object-cover" />
            </div>
            <div class="flex flex-1 flex-col p-6">
              <h3 class="text-xl font-semibold text-[#1F130A]">Chains</h3>
              <p class="mt-2 text-sm text-[#413530]">
                Signature Bhai chains that bring instant swagger to any walk.
              </p>
              <button
                class="mt-4 self-start rounded-md bg-[#F6A623] px-4 py-2 text-sm font-semibold text-[#241A0E] shadow transition hover:shadow-lg"
              >
                Shop Now
              </button>
            </div>
          </div>

          <div class="flex flex-col overflow-hidden rounded-3xl bg-[#F8E4C7] shadow transition hover:shadow-lg">
            <div class="relative aspect-[4/3]">
              <img :src="singleDogHoodie" alt="Dog wearing hoodie" class="h-full w-full object-cover" />
            </div>
            <div class="flex flex-1 flex-col p-6">
              <h3 class="text-xl font-semibold text-[#1F130A]">Hoodies</h3>
              <p class="mt-2 text-sm text-[#413530]">
                Cozy streetwear hoodies built for flexing and snoozing alike.
              </p>
              <button
                class="mt-4 self-start rounded-md bg-[#F6A623] px-4 py-2 text-sm font-semibold text-[#241A0E] shadow transition hover:shadow-lg"
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Register -->
    <section id="register" class="bg-[#FFF7EC] py-16">
      <div class="mx-auto grid max-w-6xl items-start gap-10 px-6 lg:grid-cols-[1.1fr,1fr]">
        <div>
          <h2 class="text-3xl font-semibold text-[#1F130A] md:text-4xl">Register Your Dog</h2>
          <p class="mt-2 text-base text-[#413530] md:text-lg">
            Claim your dog's Bhai identity and unlock community perks, styling drops, and more.
          </p>
          <div class="mt-6 flex gap-3 overflow-x-auto pb-2">
            <div class="min-w-[140px] overflow-hidden rounded-2xl bg-white shadow">
              <img :src="trioWide" alt="Dogs trio wide" class="h-28 w-full object-cover" />
            </div>
            <div class="min-w-[140px] overflow-hidden rounded-2xl bg-white shadow">
              <img :src="singleDogChain" alt="Dog with chain" class="h-28 w-full object-cover" />
            </div>
            <div class="min-w-[140px] overflow-hidden rounded-2xl bg-white shadow">
              <img :src="singleDogHoodie" alt="Dog with hoodie" class="h-28 w-full object-cover" />
            </div>
          </div>
        </div>

        <div class="rounded-3xl bg-white p-6 shadow-lg space-y-4">
          <div>
            <p class="text-sm font-semibold text-[#1F130A]">Dog's name *</p>
            <input
              type="text"
              class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
              placeholder="Your dog's name"
            />
          </div>

          <div>
            <p class="text-sm font-semibold text-[#1F130A]">Choose avatar</p>
            <div class="mt-2 flex gap-3">
              <button class="h-12 w-12 overflow-hidden rounded-full ring-2 ring-transparent hover:ring-[#F6A623] transition">
                <img :src="heroMain" alt="Avatar hero" class="h-full w-full object-cover" />
              </button>
              <button class="h-12 w-12 overflow-hidden rounded-full ring-2 ring-transparent hover:ring-[#F6A623] transition">
                <img :src="singleDogHoodie" alt="Avatar hoodie" class="h-full w-full object-cover" />
              </button>
              <button class="h-12 w-12 overflow-hidden rounded-full ring-2 ring-transparent hover:ring-[#F6A623] transition">
                <img :src="singleDogChain" alt="Avatar chain" class="h-full w-full object-cover" />
              </button>
            </div>
          </div>

          <div>
            <p class="text-sm font-semibold text-[#1F130A]">Breed</p>
            <select
              class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-[#1F130A] outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
            >
              <option>Mixed Bhai</option>
              <option>Golden Retriever</option>
              <option>German Shepherd</option>
              <option>French Bulldog</option>
            </select>
          </div>

          <button
            class="mt-4 w-full rounded-xl bg-[#F6A623] px-4 py-3 text-sm font-semibold text-[#241A0E] shadow transition hover:shadow-lg"
          >
            Claim Your Bhai Identity
          </button>
        </div>
      </div>
    </section>

    <!-- Watch -->
    <section id="watch" class="bg-[#04343A] py-16 text-white">
      <div class="mx-auto max-w-6xl px-6">
        <h2 class="text-3xl font-semibold md:text-4xl">Watch & Laugh</h2>
        <p class="mt-3 max-w-2xl text-base text-[#E8DCCF] md:text-lg">
          Catch the funniest #DogeshBhai moments and get ready to laugh out loud.
        </p>
        <div class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div
            class="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-700 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <img :src="trioWide" alt="Trio wide" class="h-full w-full object-cover" />
            <div class="absolute inset-0 bg-black/30" />
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#04343A]">▶</div>
            </div>
          </div>

          <div
            class="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-700 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <img :src="singleDogChain" alt="Dog chain video" class="h-full w-full object-cover" />
            <div class="absolute inset-0 bg-black/30" />
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#04343A]">▶</div>
            </div>
          </div>

          <div
            class="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-700 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <img :src="singleDogHoodie" alt="Dog hoodie video" class="h-full w-full object-cover" />
            <div class="absolute inset-0 bg-black/30" />
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#04343A]">▶</div>
            </div>
          </div>

          <div
            class="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-700 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-[#0A515A] to-[#0F2E33]" />
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#04343A]">▶</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import heroMain from "@/assets/Dogeshbhai/hero-main.png";
import trioTall from "@/assets/Dogeshbhai/trio-tall.png";
import trioWide from "@/assets/Dogeshbhai/trio-wide.png";
import singleDogChain from "@/assets/Dogeshbhai/single-dog-chain.png";
import singleDogHoodie from "@/assets/Dogeshbhai/single-dog-hoodie.png";

const router = useRouter();

const goToRegister = () => router.push("/register");
const goToProducts = () => router.push("/products");
</script>
