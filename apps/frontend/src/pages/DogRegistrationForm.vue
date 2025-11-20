<template>
  <section class="max-w-2xl space-y-4">
    <div>
      <p class="text-sm uppercase tracking-wide text-slate-500">Register</p>
      <h2 class="text-3xl font-bold text-slate-900">Create a dog profile</h2>
      <p class="text-sm text-slate-600">
        Use this form to register your pup and keep their details synced with the community backend.
      </p>
    </div>

    <el-form
      :model="form"
      label-position="top"
      class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      @submit.prevent="handleSubmit"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <el-form-item label="Dog name" required>
          <el-input v-model="form.name" placeholder="Milo" />
        </el-form-item>

        <el-form-item label="Owner ID" required>
          <el-input v-model="form.ownerId" placeholder="firebase-uid" />
        </el-form-item>

        <el-form-item label="Breed">
          <el-input v-model="form.breed" placeholder="Border Collie" />
        </el-form-item>

        <el-form-item label="Age">
          <el-input v-model.number="form.age" type="number" min="0" />
        </el-form-item>
      </div>

      <el-form-item label="Bio">
        <el-input
          v-model="form.bio"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 5 }"
        />
      </el-form-item>

      <el-form-item label="Tags (comma separated)">
        <el-input v-model="tags" placeholder="playful, friendly" />
      </el-form-item>

      <div class="flex items-center gap-3">
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          Save profile
        </el-button>
        <p v-if="error" class="text-sm text-rose-600">
          {{ error }}
        </p>
      </div>
    </el-form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

import type { DogProfile } from "@visway/shared";
import { validateDogProfile } from "@visway/shared";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const router = useRouter();
const error = ref<string | null>(null);
const submitting = ref(false);
const tags = ref("");

// local form state
const form = reactive<Partial<DogProfile>>({
  name: "",
  ownerId: "",
  breed: "",
  age: undefined,
  bio: "",
  avatarUrl: "",
});

const handleSubmit = async () => {
  error.value = null;

  // build payload including tags[]
  const payload: Partial<DogProfile> = {
    ...form,
    tags: tags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };

  // run shared validator
  const validation = validateDogProfile(payload);
  if (!validation.valid) {
    error.value = validation.errors.join(", ");
    return;
  }

  submitting.value = true;

  try {
    // prepare Firestore-safe data
    const dataToSave = {
      name: payload.name ?? "",
      ownerId: payload.ownerId ?? "",
      breed: payload.breed ?? "",
      age: payload.age ?? null,
      bio: payload.bio ?? "",
      avatarUrl: payload.avatarUrl ?? "",
      tags: (payload.tags as string[]) ?? [],
      createdAt: serverTimestamp(),
    };

    const dogsCol = collection(db, "dogs");
    const docRef = await addDoc(dogsCol, dataToSave);

    ElMessage.success("Dog profile saved");
    // navigate to dog profile page using new doc id
    router.push(`/dogs/${docRef.id}`);
  } catch (err) {
    console.error(err);
    error.value = "Failed to save dog profile";
  } finally {
    submitting.value = false;
  }
};
</script>