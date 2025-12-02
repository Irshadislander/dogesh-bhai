import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "@/pages/LandingPage.vue";
import LoginPage from "@/pages/LoginPage.vue";
const SignupPage = () => import("@/pages/SignupPage.vue");
import DashboardPage from "@/pages/DashboardPage.vue";
import DogRegistrationForm from "@/pages/DogRegistrationForm.vue";
import DogProfilePage from "@/pages/DogProfilePage.vue";
import CommunityPage from "@/pages/CommunityPage.vue";
import ProductsPage from "@/pages/ProductsPage.vue";
import FeedPage from "@/pages/FeedPage.vue";
import FeedPostsPage from "@/pages/FeedPostsPage.vue";
import FeedReelsPage from "@/pages/FeedReelsPage.vue";
import ProfilePage from "@/pages/ProfilePage.vue";
import MyPackPage from "@/pages/MyPackPage.vue";
import ExplorePage from "@/pages/ExplorePage.vue";
import MessagesPage from "@/pages/MessagesPage.vue";
import NotificationsPage from "@/pages/NotificationsPage.vue";
import HashtagExplorePage from "@/pages/HashtagExplorePage.vue";
import HashtagPage from "@/pages/HashtagPage.vue";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "landing", component: LandingPage },
    { path: "/login", name: "login", component: LoginPage },
    { path: "/signup", name: "Signup", component: SignupPage },
    { path: "/dashboard", name: "dashboard", component: DashboardPage, meta: { requiresAuth: true } },
    { path: "/register", name: "register", component: DogRegistrationForm },
    { path: "/dogs/register", name: "dog-register", component: DogRegistrationForm },
    { path: "/dogs/:id", name: "dog-profile", component: DogProfilePage, props: true },
    { path: "/community", name: "community", component: CommunityPage },
    { path: "/feed", name: "feed", component: FeedPage },
    { path: "/feed/posts", name: "feed-posts", component: FeedPostsPage },
    { path: "/feed/reels", name: "feed-reels", component: FeedReelsPage },
    {
      path: "/profile/:userId",
      name: "profile",
      component: ProfilePage,
      meta: { requiresAuth: true },
      props: true,
    },
    { path: "/my-pack", name: "my-pack", component: MyPackPage, meta: { requiresAuth: true } }, // legacy link hidden
    { path: "/explore", name: "explore", component: ExplorePage }, // legacy link hidden
    { path: "/messages", name: "messages", component: MessagesPage, meta: { requiresAuth: true } },
    { path: "/notifications", name: "notifications", component: NotificationsPage, meta: { requiresAuth: true } },
    { path: "/hashtags/:tag", name: "hashtags", component: HashtagPage },
    { path: "/products", name: "products", component: ProductsPage },
    { path: "/dog/:dogId", name: "DogProfile", component: DogProfilePage, props: true },
  ],
});

router.beforeEach((to, _from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth);
  const user = auth.currentUser;
  if (requiresAuth && !user) {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }
  return next();
});

export default router;
