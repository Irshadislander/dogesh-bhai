import { defineStore } from "pinia";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import type { User } from "@visway/shared";
import { firebaseAuth } from "@/lib/firebase";
import { loginWithToken } from "@/lib/api";

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    user: null,
    loading: false,
    error: null,
  }),
  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const idToken = await credential.user.getIdToken();
        const backendUser = await loginWithToken(idToken);

        this.user = {
          id: backendUser.uid,
          email: backendUser.email ?? email,
          displayName: backendUser.displayName ?? credential.user.displayName ?? undefined,
          photoURL: credential.user.photoURL ?? undefined,
        };
      } catch (err) {
        console.error(err);
        this.error = "Login failed. Check your credentials.";
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      await signOut(firebaseAuth);
      this.user = null;
    },
    setUser(user: User | null) {
      this.user = user;
    },
  },
});
