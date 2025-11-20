import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "@/pages/LandingPage.vue";
import LoginPage from "@/pages/LoginPage.vue";
import DashboardPage from "@/pages/DashboardPage.vue";
import DogRegistrationForm from "@/pages/DogRegistrationForm.vue";
import DogProfilePage from "@/pages/DogProfilePage.vue";
import CommunityPage from "@/pages/CommunityPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "landing", component: LandingPage },
    { path: "/login", name: "login", component: LoginPage },
    { path: "/dashboard", name: "dashboard", component: DashboardPage },
    { path: "/dogs/register", name: "dog-register", component: DogRegistrationForm },
    { path: "/dogs/:id", name: "dog-profile", component: DogProfilePage, props: true },
    { path: "/community", name: "community", component: CommunityPage },
  ],
});

export default router;
