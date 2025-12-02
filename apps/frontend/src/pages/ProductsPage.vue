<template>
  <main class="min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <section class="bg-[#04343A] py-12 text-white">
      <div class="mx-auto max-w-6xl px-6">
        <h1 class="text-3xl font-semibold md:text-4xl">Explore Products</h1>
        <p class="mt-3 text-[#FFE8C7]">
          Everything your dog needs to become a certified Bhai – from grooming brushes to gold chains and hoodies.
        </p>
      </div>
    </section>

    <section class="py-12">
      <div class="mx-auto max-w-6xl px-6">
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="product in products"
            :key="product.id"
            class="flex flex-col overflow-hidden rounded-3xl bg-[#F8E4C7] shadow transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div class="relative aspect-[4/3]">
              <img :src="product.image" :alt="product.name" class="h-full w-full object-cover" />
            </div>
            <div class="flex flex-1 flex-col p-6">
              <p class="text-xs uppercase tracking-wide text-[#705945]">{{ product.category }}</p>
              <h3 class="mt-1 text-xl font-semibold text-[#1F130A]">{{ product.name }}</h3>
              <p class="mt-2 text-sm text-[#413530]">{{ product.description }}</p>
              <div class="mt-4 flex items-center justify-between text-sm font-semibold text-[#1F130A]">
                <span>${{ product.price }}</span>
                <button
                  class="rounded-md bg-[#F6A623] px-4 py-2 text-xs font-semibold text-[#241A0E] shadow transition hover:shadow-lg"
                  type="button"
                >
                  Add to Bhai Cart
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import heroMain from "@/assets/Dogeshbhai/hero-main.png";
import singleDogChain from "@/assets/Dogeshbhai/single-dog-chain.png";
import singleDogHoodie from "@/assets/Dogeshbhai/single-dog-hoodie.png";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

const products: Product[] = [
  {
    id: "groom-1",
    name: "Bhai Grooming Kit",
    category: "Grooming",
    price: 29,
    image: heroMain,
    description: "Brushes, balms, and shine sprays to keep every Bhai photo-ready.",
  },
  {
    id: "chain-1",
    name: "Signature Bhai Chain",
    category: "Chains",
    price: 45,
    image: singleDogChain,
    description: "Gold-tone statement chain with comfy fit for daily flexing.",
  },
  {
    id: "hoodie-1",
    name: "Hoodie Drop v1",
    category: "Hoodies",
    price: 55,
    image: singleDogHoodie,
    description: "Cozy streetwear hoodie built for park hangs and chill nights.",
  },
];
</script>
