<template>
  <div class="min-h-screen flex flex-col bg-[#FFF7EC]">
    <NavBar />

    <div class="flex-1">
      <RouterView />
    </div>

    <FooterBar />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import NavBar from "@/components/layout/NavBar.vue";
import FooterBar from "@/components/layout/FooterBar.vue";
</script>
