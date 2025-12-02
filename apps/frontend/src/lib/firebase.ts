import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// --------------------------------------
// Initialize Firebase
// --------------------------------------
const app = initializeApp(firebaseConfig);

// Analytics only works in browser
let analytics: any = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch {}
}

// --------------------------------------
// Firebase Services
// --------------------------------------
const auth = getAuth(app);
const firebaseAuth = auth; // keep named alias for existing imports
const db = getFirestore(app);
const storage = getStorage(app);

// --------------------------------------
// Exports
// --------------------------------------
export { app, analytics, auth, firebaseAuth, db, storage };
