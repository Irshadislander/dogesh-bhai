import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

let firebaseApp: admin.app.App | null = null;

if (!admin.apps.length && projectId && clientEmail && privateKey) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
} else if (!projectId || !clientEmail || !privateKey) {
  console.warn("Firebase admin is not fully configured. Set FIREBASE_* env vars.");
}

export const firebaseAuth = firebaseApp ? admin.auth() : null;
export const firestore = firebaseApp ? admin.firestore() : null;
export const isFirebaseConfigured = !!firebaseApp;

export const assertFirebase = () => {
  if (!firebaseApp || !firebaseAuth || !firestore) {
    throw new Error("Firebase admin not configured. Check environment variables.");
  }
};
