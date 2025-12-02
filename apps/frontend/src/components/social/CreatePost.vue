<template>
  <div class="rounded-3xl bg-[#0D2C30] p-5 shadow-lg ring-1 ring-[#0f3940] text-white">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Share with the Bhaihood</h3>
        <p class="text-xs text-[#c0d8d4]">Photo posts or short reels — your choice.</p>
      </div>
      <div class="flex gap-2 text-sm font-semibold">
        <button
          type="button"
          class="rounded-full px-3 py-2 transition"
          :class="postType === 'post' ? 'bg-[#F6A623] text-[#241A0E]' : 'bg-white/10 text-white'"
          @click="postType = 'post'"
        >
          Post
        </button>
        <button
          type="button"
          class="rounded-full px-3 py-2 transition"
          :class="postType === 'reel' ? 'bg-[#F6A623] text-[#241A0E]' : 'bg-white/10 text-white'"
          @click="postType = 'reel'"
        >
          Reel
        </button>
      </div>
    </div>

    <div class="mt-4 space-y-3">
      <div class="space-y-1">
        <p class="text-xs text-[#c0d8d4]">Posting as</p>
        <div v-if="myDogs.length">
          <select
            v-model="selectedDogId"
            class="w-full rounded-xl border border-[#184c53] bg-[#0b2429] px-3 py-2 text-sm text-white outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
          >
            <option v-for="dog in myDogs" :key="dog.id" :value="dog.id">
              {{ dog.name }} <span v-if="dog.breed">• {{ dog.breed }}</span>
            </option>
          </select>
        </div>
        <div v-else class="rounded-xl bg-white/5 px-3 py-2 text-xs text-[#c0d8d4]">
          You haven’t registered a dog yet. Register from the Join page.
        </div>
        <p v-if="dogError" class="text-xs text-red-500">{{ dogError }}</p>
      </div>

      <textarea
        v-model="content"
        rows="3"
        class="w-full rounded-2xl border border-[#184c53] bg-[#0b2429] px-3 py-2 text-sm text-white outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
        placeholder="Your dog's latest flex..."
      ></textarea>
      <p v-if="captionError" class="text-xs text-red-500">{{ captionError }}</p>

      <input
        v-model="mediaUrl"
        type="url"
        class="w-full rounded-2xl border border-[#184c53] bg-[#0b2429] px-3 py-2 text-sm text-white outline-none focus:border-[#F6A623] focus:ring-1 focus:ring-[#F6A623]"
        :placeholder="postType === 'reel' ? 'Optional video URL' : 'Optional image URL'"
      />

      <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
        <label class="flex cursor-pointer items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-white">
          <input :accept="postType === 'reel' ? 'video/*' : 'image/*'" type="file" class="hidden" @change="handleFileChange" />
          <span>{{ postType === 'reel' ? "Upload Reel (15–60s)" : "Upload Photo" }}</span>
          <span v-if="fileName" class="text-xs text-[#c0d8d4]">{{ fileName }}</span>
        </label>
        <p v-if="uploading" class="text-xs text-[#c0d8d4]">Uploading… {{ uploadProgress }}%</p>
      </div>

      <div v-if="postType === 'reel' && previewUrl" class="overflow-hidden rounded-2xl border border-white/10 bg-black">
        <video
          :src="previewUrl"
          class="w-full"
          muted
          playsinline
          controls
          :poster="posterImageUrl || undefined"
        ></video>
        <p class="px-3 py-2 text-xs text-[#c0d8d4]">
          Duration: {{ durationSeconds ? durationSeconds.toFixed(1) + 's' : '—' }}
        </p>
      </div>

      <div class="space-y-1">
        <p v-if="errorMessage" class="text-sm text-red-400">{{ errorMessage }}</p>
        <p v-if="success" class="text-sm text-emerald-400">Posted!</p>
      </div>

      <button
        type="button"
        :disabled="loading || uploading || !selectedDogId"
        @click="createPost"
        class="w-full rounded-xl bg-[#F6A623] px-4 py-3 text-sm font-semibold text-[#241A0E] shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ loading ? "Sharing…" : "Share" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db, auth, storage, app } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "vue-router";
import { ref as storageRef, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { parseMentionsAndTags } from "@/lib/socialParsing";
import { createNotificationsForMentions } from "@/lib/notifications";

const emit = defineEmits<{
  (e: "created"): void;
}>();

const content = ref("");
const mediaUrl = ref("");
const fileName = ref("");
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const success = ref(false);
const uploading = ref(false);
const postType = ref<"post" | "reel">("post");
const captionError = ref<string | null>(null);
const dogError = ref<string | null>(null);
const uploadProgress = ref(0);
const previewUrl = ref<string | null>(null);
const durationSeconds = ref<number | null>(null);
const posterImageUrl = ref<string | null>(null);
const authClient = getAuth(app);
const router = useRouter();
const currentUser = ref(authClient.currentUser);
onAuthStateChanged(authClient, (u) => {
  currentUser.value = u;
});
const isLoggedIn = computed(() => !!currentUser.value);
const myDogs = ref<
  {
    id: string;
    name: string;
    breed?: string;
    avatarUrl?: string;
  }[]
>([]);
const selectedDogId = ref<string | null>(null);
const reelReady = computed(
  () =>
    postType.value !== "reel" ||
    (!!mediaUrl.value && !!selectedDogId.value && (durationSeconds.value ?? 0) <= 30 && !uploading.value)
);

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  uploading.value = true;
  errorMessage.value = null;
  captionError.value = null;
  uploadProgress.value = 0;
  durationSeconds.value = null;
  previewUrl.value = null;
  posterImageUrl.value = null;

  try {
    const user = auth.currentUser;
    const uid = user?.uid || "anon";
    const folder = postType.value === "reel" ? "reels" : "posts";
    const name = `${folder}/${uid}/${crypto.randomUUID()}`;
    const fileRef = storageRef(storage, name);
    if (postType.value === "reel") {
      const objectUrl = URL.createObjectURL(file);
      previewUrl.value = objectUrl;
      const videoEl = document.createElement("video");
      const duration: number = await new Promise((resolve, reject) => {
        videoEl.preload = "metadata";
        videoEl.onloadedmetadata = (_ev: Event) => resolve(videoEl.duration);
        videoEl.onerror = (_ev: Event) => reject("Video load error");
        videoEl.src = objectUrl;
      });
      durationSeconds.value = duration;
      if (duration > 30) {
        errorMessage.value = "Reels must be 30 seconds or less.";
        uploading.value = false;
        mediaUrl.value = "";
        fileName.value = "";
        return;
      }
      await new Promise<void>((resolve) => {
        videoEl.currentTime = 0.1;
        videoEl.onseeked = (_ev: Event) => resolve();
      });
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      const posterBlob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));

      const uploadTask = uploadBytesResumable(fileRef, file);
      uploadTask.on("state_changed", (snap) => {
        uploadProgress.value = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
      });
      await uploadTask;
      const url = await getDownloadURL(fileRef);
      mediaUrl.value = url;
      fileName.value = file.name;

      if (posterBlob) {
        const posterRef = storageRef(storage, `reels_posters/${uid}/poster-${crypto.randomUUID()}.jpg`);
        await uploadBytes(posterRef, posterBlob);
        posterImageUrl.value = await getDownloadURL(posterRef);
      }
    } else {
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      mediaUrl.value = url;
      fileName.value = file.name;
    }
  } catch (err) {
    console.error("Upload failed", err);
    errorMessage.value = "Could not upload image.";
  } finally {
    uploading.value = false;
  }
};

const createPost = async () => {
  if (!content.value.trim() && !mediaUrl.value.trim()) {
    captionError.value = "Add a caption or media to share.";
    return;
  }
  if (!currentUser.value) {
    router.push({ path: "/login", query: { redirect: "/feed/posts" } });
    return;
  }
  if (!selectedDogId.value) {
    dogError.value = "Select a dog to post as.";
    return;
  }
  loading.value = true;
  errorMessage.value = null;
  success.value = false;
  captionError.value = null;
  dogError.value = null;

  try {
    const user = auth.currentUser;
    const postsCol = collection(db, "posts");
    const { mentions, hashtags } = parseMentionsAndTags(content.value);
    if (postType.value === "reel" && !mediaUrl.value.trim()) {
      throw new Error("Please upload or provide a video URL for reels.");
    }
    const dog = myDogs.value.find((d) => d.id === selectedDogId.value);
    await addDoc(postsCol, {
      content: content.value.trim(),
      mediaUrl: mediaUrl.value.trim() || "",
      videoUrl: postType.value === "reel" ? mediaUrl.value.trim() : "",
      posterImageUrl: postType.value === "reel" ? posterImageUrl.value || "" : "",
      soundEnabled: postType.value === "reel" ? true : undefined,
      authorId: user?.uid || "",
      authorName: user?.displayName || user?.email || "Anonymous Bhai",
      dogId: dog?.id || null,
      dogName: dog?.name || null,
      dogAvatarUrl: dog?.avatarUrl || null,
      dogBreed: dog?.breed || null,
      mentionedHandles: mentions,
      hashtags,
      type: postType.value,
      likes: 0,
      createdAt: serverTimestamp(),
    });
    if (mentions.length > 0) {
      await createNotificationsForMentions(mentions, {
        actorUserId: user?.uid || "",
        actorDisplayName: user?.displayName || user?.email || "Anonymous Bhai",
        type: "comment",
        snippet: `${user?.displayName || "Someone"} mentioned you in a ${postType.value}.`,
        postId: undefined,
      });
    }
    content.value = "";
    mediaUrl.value = "";
    success.value = true;
    emit("created");
  } catch (err) {
    console.error("Failed to post", err);
    errorMessage.value = "Could not post. Try again.";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  const user = auth.currentUser;
  if (!user) return;
  const dogsCol = collection(db, "dogs");
  const q = query(dogsCol, where("ownerId", "==", user.uid));
  const snap = await getDocs(q);
  myDogs.value = snap.docs.map((doc) => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      name: data.dogName || data.name || "My Dog",
      breed: data.breed,
      avatarUrl: data.avatarImageUrl || "",
    };
  });
  if (myDogs.value.length > 0) selectedDogId.value = myDogs.value[0].id;
});
</script>
