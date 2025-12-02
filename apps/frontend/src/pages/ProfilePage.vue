<template>
  <main class="min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <section class="border-b border-white/10 bg-[#04343A] text-white">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">Bhai Profile</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">
          Your Bhai card plus every post you have dropped in the feed.
        </p>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto flex max-w-6xl flex-col gap-6 px-6">
        <div v-if="loading" class="space-y-4">
          <div class="h-6 w-40 rounded bg-slate-200"></div>
          <div class="h-40 rounded-3xl bg-slate-200"></div>
          <div class="h-6 w-32 rounded bg-slate-200"></div>
        </div>
        <div v-else-if="errorMessage" class="py-8 text-center text-sm text-red-600">{{ errorMessage }}</div>
        <div v-else-if="!userData" class="py-8 text-center text-sm text-slate-600">Profile not found.</div>

        <div v-else class="grid gap-6 md:grid-cols-[1fr,1.2fr] items-start">
          <div class="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <img
              :src="userData.avatar || fallbackAvatar"
              alt="avatar"
              class="h-20 w-20 rounded-full object-cover ring-2 ring-[#F6A623]"
            />
            <div>
              <p class="text-2xl font-semibold text-[#1F130A]">{{ userData.username || 'Bhai User' }}</p>
              <p class="text-sm text-[#5A4634]">Joined: {{ userData.joinedDate || '—' }}</p>
            </div>
            <div v-if="userData.bio" class="rounded-2xl bg-[#F8E4C7] p-4 text-sm text-[#413530]">
              {{ userData.bio }}
            </div>
            <div class="flex items-center gap-3 text-sm text-[#5A4634]">
              <span class="rounded-full bg-[#F8E4C7] px-3 py-1 font-semibold text-[#1F130A]">
                Followers: {{ followerCount }}
              </span>
              <span class="rounded-full bg-[#F8E4C7] px-3 py-1 font-semibold text-[#1F130A]">
                Following: {{ followingCount }}
              </span>
            </div>

            <div v-if="userBadges.length" class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <p class="text-sm font-semibold text-[#1F130A]">Badges</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="badgeId in userBadges"
                  :key="badgeId"
                  class="inline-flex items-center gap-1 rounded-full bg-[#F8E4C7] px-3 py-1 text-xs font-semibold text-[#1F130A]"
                >
                  <span>{{ badgeLookup(badgeId)?.icon || "🎖️" }}</span>
                  <span>{{ badgeLookup(badgeId)?.name || badgeId }}</span>
                </span>
              </div>
            </div>
            <div v-else class="rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
              Join challenges to earn your first badge.
            </div>

            <div v-if="!isOwnProfile" class="flex gap-3">
              <button
                type="button"
                :disabled="followLoading"
                @click="toggleFollow"
                class="rounded-xl bg-[#F6A623] px-4 py-2 text-sm font-semibold text-[#241A0E] shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ isFollowing ? 'Unfollow' : 'Follow' }}
              </button>
              <p v-if="followError" class="text-sm text-red-600">{{ followError }}</p>
              <SendMessage :target-user-id="userDataId" />
            </div>
          </div>

          <div class="space-y-4">
            <div v-if="dogs.length" class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <p class="text-sm font-semibold text-[#1F130A] mb-2">Dogs</p>
              <div class="grid gap-3 sm:grid-cols-2">
                <button
                  v-for="dog in dogs"
                  :key="dog.id"
                  class="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-left hover:border-[#F6A623]"
                  @click="goToDog(dog.id)"
                >
                  <div class="h-10 w-10 rounded-full bg-slate-100 overflow-hidden">
                    <img v-if="dog.avatarUrl" :src="dog.avatarUrl" alt="dog avatar" class="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-[#1F130A]">{{ dog.name }}</p>
                    <p class="text-xs text-[#5A4634]">{{ dog.breed }}</p>
                  </div>
                </button>
              </div>
            </div>

            <h3 class="text-xl font-semibold text-[#1F130A]">Posts</h3>
            <div v-if="posts.length === 0" class="rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
              No posts yet.
            </div>
            <PostCard v-else v-for="post in posts" :key="post.id" :post="post" />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import PostCard from "@/components/social/PostCard.vue";
import heroMain from "@/assets/Dogeshbhai/hero-main.png";
import SendMessage from "@/components/social/SendMessage.vue";
import { badges } from "@/lib/badges";

type UserDoc = {
  avatar?: string;
  username?: string;
  joinedDate?: string;
  bio?: string;
};

type FeedPost = {
  id: string;
  content: string;
  mediaUrl?: string;
  authorName?: string;
  authorId?: string;
  createdAt?: any;
  likes?: number;
};

const route = useRoute();
const userData = ref<UserDoc | null>(null);
const posts = ref<FeedPost[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);
const fallbackAvatar = heroMain;
const followerCount = ref(0);
const followingCount = ref(0);
const isFollowing = ref(false);
const followLoading = ref(false);
const followError = ref<string | null>(null);
const currentUserId = ref<string | null>(null);
const userBadges = ref<string[]>([]);
const dogs = ref<
  {
    id: string;
    name: string;
    breed?: string;
    avatarUrl?: string;
  }[]
>([]);

const isOwnProfile = computed(() => currentUserId.value && userDataId.value === currentUserId.value);
const userDataId = computed(() => (route.params.userId as string) || "");
const router = useRouter();

let followersUnsub: (() => void) | null = null;
let followingUnsub: (() => void) | null = null;

onMounted(async () => {
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const userId = userDataId.value;
    currentUserId.value = auth.currentUser?.uid || null;

    const userDoc = await getDoc(doc(db, "users", userId));
    userData.value = userDoc.exists() ? (userDoc.data() as UserDoc) : null;
    userBadges.value = (userDoc.data()?.badges as string[]) || [];

    const postsQuery = query(collection(db, "posts"), where("authorId", "==", userId), where("type", "==", "post"));
    const snap = await getDocs(postsQuery);
    posts.value = snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as any) }));

    const dogsQuery = query(collection(db, "dogs"), where("ownerId", "==", userId));
    const dogsSnap = await getDocs(dogsQuery);
    dogs.value = dogsSnap.docs.map((d) => {
      const data = d.data() as any;
      return { id: d.id, name: data.dogName || data.name || "Dog", breed: data.breed, avatarUrl: data.avatarImageUrl || "" };
    });

    // Followers listener
    followersUnsub = onSnapshot(collection(db, "users", userId, "followers"), (snapshot) => {
      followerCount.value = snapshot.size;
      isFollowing.value = !!snapshot.docs.find((d) => d.id === currentUserId.value);
    });

    // Following count for profile owner
    followingUnsub = onSnapshot(collection(db, "users", userId, "following"), (snapshot) => {
      followingCount.value = snapshot.size;
    });
  } catch (err) {
    console.error("Failed to load profile", err);
    errorMessage.value = "Failed to load profile.";
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (followersUnsub) followersUnsub();
  if (followingUnsub) followingUnsub();
});

const toggleFollow = async () => {
  if (!currentUserId.value) {
    followError.value = "Log in to follow.";
    return;
  }
  followError.value = null;
  followLoading.value = true;
  const targetId = userDataId.value;
  const me = currentUserId.value;
  try {
    const followerRef = doc(db, "users", targetId, "followers", me);
    const followingRef = doc(db, "users", me, "following", targetId);
    if (isFollowing.value) {
      await deleteDoc(followerRef);
      await deleteDoc(followingRef);
    } else {
      await setDoc(followerRef, { followerId: me, followedAt: new Date().toISOString() });
      await setDoc(followingRef, { followingId: targetId, followedAt: new Date().toISOString() });
    }
  } catch (err) {
    console.error("Failed to toggle follow", err);
    followError.value = "Failed to update follow state.";
  } finally {
    followLoading.value = false;
  }
};

const badgeLookup = (id: string) => badges.find((b) => b.id === id);

const goToDog = (dogId: string) => {
  router.push({ name: "DogProfile", params: { dogId } });
};
</script>
