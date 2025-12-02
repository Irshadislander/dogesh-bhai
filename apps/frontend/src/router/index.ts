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
import VerifyEmailPage from "@/pages/VerifyEmailPage.vue";
import DogRegistrationIntro from "@/pages/DogRegistrationIntro.vue";
import SearchPage from "@/pages/SearchPage.vue";
import ChallengesPage from "@/pages/ChallengesPage.vue";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "landing", component: LandingPage },
    { path: "/login", name: "login", component: LoginPage },
    { path: "/signup", name: "Signup", component: SignupPage },
    { path: "/dashboard", name: "dashboard", component: DashboardPage, meta: { requiresAuth: true } },
    { path: "/verify-email", name: "verify-email", component: VerifyEmailPage, meta: { requiresAuth: true } },
    { path: "/register-dog", name: "register-dog", component: DogRegistrationIntro, meta: { requiresAuth: true } },
    {
      path: "/register-dog/form",
      name: "register-dog-form",
      component: DogRegistrationForm,
      meta: { requiresAuth: true },
    },
    { path: "/register", redirect: "/register-dog" },
    { path: "/dogs/register", redirect: "/register-dog" },
    { path: "/dogs/:id", name: "dog-profile", component: DogProfilePage, props: true },
    { path: "/community", name: "community", component: CommunityPage },
    { path: "/feed", name: "feed", component: FeedPage },
    { path: "/feed/posts", name: "feed-posts", component: FeedPostsPage },
    { path: "/feed/reels", name: "feed-reels", component: FeedReelsPage },
    { path: "/search", name: "Search", component: SearchPage },
    { path: "/challenges", name: "Challenges", component: ChallengesPage },
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

const dogCache = new Map<string, boolean>();

const getCurrentUser = () =>
  new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });

const userHasDog = async (uid: string) => {
  if (dogCache.has(uid)) return dogCache.get(uid) as boolean;
  const q = query(collection(db, "dogs"), where("ownerId", "==", uid), limit(1));
  const snap = await getDocs(q);
  const hasDog = !snap.empty;
  dogCache.set(uid, hasDog);
  return hasDog;
};

router.beforeEach(async (to, _from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth);
  const user = (await getCurrentUser()) as any;

  if (requiresAuth && !user) {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }

  if (user) {
    if (!user.emailVerified && to.path !== "/verify-email") {
      return next({ path: "/verify-email" });
    }

    const allowDogless = ["/register-dog", "/register-dog/form", "/verify-email"];
    if (user.emailVerified && !allowDogless.includes(to.path)) {
      const hasDog = await userHasDog(user.uid);
      if (!hasDog) {
        return next({ path: "/register-dog" });
      }
    }
  }

  return next();
});

export default router;
