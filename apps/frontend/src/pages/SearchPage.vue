<template>
  <main class="min-h-screen bg-[#FFF7EC] text-[#1F130A]">
    <section class="border-b border-white/10 bg-[#04343A] text-white">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-3">
        <h1 class="text-3xl font-semibold md:text-4xl">Search Bhaihood</h1>
        <p class="max-w-2xl text-sm text-[#FFE8C7] md:text-base">Find dogs, humans, and hashtags.</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="rounded-full px-4 py-2 text-sm font-semibold transition"
            :class="activeTab === tab ? 'bg-[#F6A623] text-[#241A0E]' : 'bg-white/10 text-white border border-white/20'"
            @click="setTab(tab)"
          >
            {{ tab }}
          </button>
        </div>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto flex max-w-6xl flex-col gap-8 px-6">
        <div class="max-w-xl">
          <form class="flex items-center gap-3" @submit.prevent="handleSearch">
            <input
              v-model="queryText"
              type="search"
              class="w-full rounded-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
              placeholder="Search dogs, humans, or #tags"
            />
            <button type="submit" class="rounded-full bg-[#F6A623] px-4 py-2 text-sm font-semibold text-[#241A0E] shadow">
              Search
            </button>
          </form>
        </div>

        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-16 animate-pulse rounded-2xl bg-white/70"></div>
        </div>

        <div v-else>
          <template v-if="activeTab === 'All'">
            <SearchSection
              title="Dogs"
              :items="dogResults.slice(0, 5)"
              empty-text="No dogs found."
              see-all-label="View all dogs"
              @see-all="setTab('Dogs')"
            >
              <template #item="{ item }">
                <DogCard :dog="item" />
              </template>
            </SearchSection>

            <SearchSection
              title="Humans"
              :items="userResults.slice(0, 5)"
              empty-text="No humans found."
              see-all-label="View all humans"
              @see-all="setTab('Humans')"
            >
              <template #item="{ item }">
                <UserCard :user="item" />
              </template>
            </SearchSection>

            <SearchSection
              title="Hashtags"
              :items="hashtagResults.slice(0, 8)"
              empty-text="No hashtags found."
              see-all-label="View all hashtags"
              @see-all="setTab('Hashtags')"
            >
              <template #item="{ item }">
                <HashtagPill :tag="item.tag" :count="item.count" />
              </template>
            </SearchSection>
          </template>

          <template v-else-if="activeTab === 'Dogs'">
            <SearchSection title="Dogs" :items="dogResults" empty-text="No dogs found.">
              <template #item="{ item }">
                <DogCard :dog="item" />
              </template>
            </SearchSection>
          </template>

          <template v-else-if="activeTab === 'Humans'">
            <SearchSection title="Humans" :items="userResults" empty-text="No humans found.">
              <template #item="{ item }">
                <UserCard :user="item" />
              </template>
            </SearchSection>
          </template>

          <template v-else>
            <SearchSection title="Hashtags" :items="hashtagResults" empty-text="No hashtags found.">
              <template #item="{ item }">
                <HashtagPill :tag="item.tag" :count="item.count" />
              </template>
            </SearchSection>
          </template>

          <div v-if="!loading && !hasAnyResults" class="rounded-3xl bg-white p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200">
            No Bhai found for “{{ queryText }}”. Try searching for a different dog, human, or tag.
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseMentionsAndTags } from "@/lib/socialParsing";
import SearchSection from "@/components/social/SearchSection.vue";
import HashtagPill from "@/components/social/HashtagPill.vue";
import DogCard from "@/components/social/SearchDogCard.vue";
import UserCard from "@/components/social/SearchUserCard.vue";

type DogResult = { id: string; dogName?: string; breed?: string; city?: string; avatarImageUrl?: string; followerCount?: number };
type UserResult = { id: string; fullName?: string; city?: string };
type TagResult = { tag: string; count: number };

const tabs = ["All", "Dogs", "Humans", "Hashtags"] as const;
const activeTab = ref<(typeof tabs)[number]>("All");
const queryText = ref("");
const route = useRoute();
const router = useRouter();

const dogs = ref<DogResult[]>([]);
const users = ref<UserResult[]>([]);
const hashtags = ref<TagResult[]>([]);
const loading = ref(false);

const hasAnyResults = computed(() => dogResults.value.length || userResults.value.length || hashtagResults.value.length);

const dogResults = computed(() => filterDogs(queryText.value));
const userResults = computed(() => filterUsers(queryText.value));
const hashtagResults = computed(() => filterTags(queryText.value));

const setTab = (tab: (typeof tabs)[number]) => {
  activeTab.value = tab;
  router.replace({ name: "Search", query: { q: queryText.value, tab } });
};

const handleSearch = () => {
  const q = queryText.value.trim();
  router.replace({ name: "Search", query: { q, tab: activeTab.value } });
  refreshTags();
};

const loadData = async () => {
  loading.value = true;
  try {
    const dogsSnap = await getDocs(query(collection(db, "dogs"), orderBy("createdAt", "desc"), limit(50)));
    dogs.value = dogsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    const usersSnap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50)));
    users.value = usersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    await refreshTags();
  } catch (err) {
    console.error("Search load failed", err);
  } finally {
    loading.value = false;
  }
};

const refreshTags = async () => {
  try {
    const postsSnap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(100)));
    const counts: Record<string, number> = {};
    postsSnap.docs.forEach((d) => {
      const data = d.data() as any;
      const text = data.content || "";
      const { hashtags: tags } = parseMentionsAndTags(text);
      tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    hashtags.value = Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  } catch (err) {
    console.error("Hashtag refresh failed", err);
  }
};

const filterDogs = (q: string) => {
  const text = q.toLowerCase();
  return dogs.value.filter((d) => {
    return (
      d.dogName?.toLowerCase().includes(text) ||
      d.breed?.toLowerCase().includes(text) ||
      d.city?.toLowerCase().includes(text)
    );
  });
};

const filterUsers = (q: string) => {
  const text = q.toLowerCase();
  return users.value.filter((u) => {
    return u.fullName?.toLowerCase().includes(text) || u.city?.toLowerCase().includes(text);
  });
};

const filterTags = (q: string) => {
  const text = q.toLowerCase();
  return hashtags.value.filter((h) => h.tag.toLowerCase().includes(text));
};

watch(
  () => route.query.q,
  (val) => {
    queryText.value = (val as string) || "";
  },
  { immediate: true }
);

watch(
  () => route.query.tab,
  (val) => {
    const t = (val as string) || "All";
    if (tabs.includes(t as any)) activeTab.value = t as any;
  },
  { immediate: true }
);

onMounted(() => {
  loadData();
});
</script>
