<template>
  <main class="min-h-screen bg-gradient-to-b from-[#fdf7ef] to-[#eef4f5] text-[#1F130A] scroll-smooth">
    <section class="border-b border-white/10 bg-[#04343A] text-white">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">Bhaihood Feed</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">See what the pack is posting in real time.</p>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto flex max-w-3xl flex-col gap-6 px-4 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex gap-2 rounded-full bg-white/70 p-1 text-sm font-semibold text-[#1F130A] ring-1 ring-slate-200">
            <button
              class="rounded-full px-4 py-2 transition"
              :class="activeTab === 'foryou' ? 'bg-[#F6A623] text-[#241A0E]' : ''"
              @click="setTab('foryou')"
            >
              For You
            </button>
            <button
              class="rounded-full px-4 py-2 transition"
              :class="activeTab === 'following' ? 'bg-[#F6A623] text-[#241A0E]' : ''"
              @click="setTab('following')"
              :disabled="!isLoggedIn"
            >
              Following
            </button>
          </div>
          <TrendingHashtags post-type="post" />
        </div>
        <div ref="createRef">
          <CreatePost @created="handleCreated" />
        </div>

        <template v-if="loading">
          <div
            v-for="i in 3"
            :key="i"
            class="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 animate-pulse"
          >
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-full bg-slate-200"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3 w-24 rounded bg-slate-200"></div>
                <div class="h-3 w-16 rounded bg-slate-200"></div>
              </div>
            </div>
            <div class="h-64 rounded-xl bg-slate-200"></div>
            <div class="h-3 w-full rounded bg-slate-200"></div>
            <div class="h-3 w-3/4 rounded bg-slate-200"></div>
          </div>
        </template>

        <div v-else-if="errorMessage" class="py-8 text-center text-sm text-red-600">{{ errorMessage }}</div>
        <div
          v-else-if="posts.length === 0"
          class="rounded-3xl bg-white p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200"
        >
          <template v-if="activeTab === 'following'">
            Follow a few humans or dogs to see their Bhai posts here.
          </template>
          <template v-else>No posts yet — follow more dogs or create your first post.</template>
        </div>

        <div v-else class="space-y-4">
          <PostCard v-for="post in posts" :key="post.id" :post="post" />
        </div>
      </div>
    </section>

    <button
      class="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#F6A623] text-xl font-bold text-[#241A0E] shadow-lg hover:shadow-xl sm:bottom-8 sm:right-8"
      @click="scrollToCreate"
      title="Create new post"
    >
      +
    </button>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { collection, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import CreatePost from "@/components/social/CreatePost.vue";
import PostCard from "@/components/social/PostCard.vue";
import TrendingHashtags from "@/components/social/TrendingHashtags.vue";

type FeedPost = {
  id: string;
  content: string;
  mediaUrl?: string;
  authorName?: string;
  authorId?: string;
  createdAt?: any;
  likes?: number;
  type?: string;
};

const posts = ref<FeedPost[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);
let unsub: (() => void) | null = null;
const createRef = ref<HTMLElement | null>(null);
const activeTab = ref<"foryou" | "following">("foryou");
const followedUserIds = ref<string[]>([]);
const followedDogIds = ref<string[]>([]);
const isLoggedIn = computed(() => !!auth.currentUser);

const loadForYou = () => {
  if (unsub) unsub();
  loading.value = true;
  const postsCol = collection(db, "posts");
  const qPosts = query(postsCol, where("type", "==", "post"), orderBy("createdAt", "desc"));
  unsub = onSnapshot(
    qPosts,
    (snapshot) => {
      posts.value = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      loading.value = false;
    },
    (err) => {
      console.error("Failed to load posts", err);
      errorMessage.value = "Failed to load feed.";
      loading.value = false;
    }
  );
};

const loadFollowing = async () => {
  if (!auth.currentUser) {
    activeTab.value = "foryou";
    return;
  }
  if (unsub) unsub();
  loading.value = true;
  try {
    // get followed users
    const followingSnap = await getDocs(collection(db, "users", auth.currentUser.uid, "following"));
    followedUserIds.value = followingSnap.docs.map((d) => d.id).slice(0, 20);
    // get dogs for these users
    const dogPromises = followedUserIds.value.map((uid) =>
      getDocs(query(collection(db, "dogs"), where("ownerId", "==", uid)))
    );
    const dogSnaps = await Promise.all(dogPromises);
    const dogIds: string[] = [];
    dogSnaps.forEach((snap) => {
      snap.docs.forEach((d) => dogIds.push(d.id));
    });
    followedDogIds.value = dogIds;

    const postsCol = collection(db, "posts");
    const qPosts = query(postsCol, where("type", "==", "post"), orderBy("createdAt", "desc"));
    unsub = onSnapshot(
      qPosts,
      (snapshot) => {
        const all = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
        posts.value = all.filter((p) => followedDogIds.value.includes(p.dogId));
        loading.value = false;
      },
      (err) => {
        console.error("Failed to load following posts", err);
        errorMessage.value = "Failed to load feed.";
        loading.value = false;
      }
    );
  } catch (err) {
    console.error("Failed to load following posts", err);
    errorMessage.value = "Failed to load feed.";
    loading.value = false;
  }
};

const setTab = (tab: "foryou" | "following") => {
  activeTab.value = tab;
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (tab === "foryou") {
    loadForYou();
  } else {
    if (!auth.currentUser) {
      activeTab.value = "foryou";
      return;
    }
    loadFollowing();
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  loadForYou();
});

onBeforeUnmount(() => {
  if (unsub) unsub();
});

const handleCreated = () => {
  // snapshot listener updates automatically
};

const scrollToCreate = () => {
  createRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
};
</script>
