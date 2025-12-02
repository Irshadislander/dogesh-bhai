import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { NotificationDoc, NotificationType } from "@/lib/types";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  actorUserId?: string;
  actorDogId?: string;
  actorDisplayName?: string;
  actorDogName?: string;
  actorDogAvatarUrl?: string;
  postId?: string;
  conversationId?: string;
  snippet?: string;
};

export const createNotification = async (input: CreateNotificationInput) => {
  const { userId, actorUserId } = input;
  if (!userId) return;
  if (actorUserId && actorUserId === userId) return;

  const col = collection(db, "users", userId, "notifications");
  await addDoc(col, {
    ...input,
    createdAt: serverTimestamp(),
    isRead: false,
  });
};

export const markAllNotificationsRead = async (userId: string) => {
  if (!userId) return;
  const col = collection(db, "users", userId, "notifications");
  const q = query(col, where("isRead", "==", false));
  const snap = await getDocs(q);
  const promises: Promise<any>[] = [];
  snap.forEach((docSnap) => {
    promises.push(updateDoc(docSnap.ref, { isRead: true }));
  });
  await Promise.all(promises);
};

export const subscribeToUnreadCount = (userId: string, callback: (count: number) => void) => {
  const col = collection(db, "users", userId, "notifications");
  const q = query(col, where("isRead", "==", false));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.size);
    },
    (err) => {
      console.error("Unread notifications listener failed", err);
      callback(0);
    }
  );
};

// Mentions helper for legacy mention notifications (username based)
export const createNotificationsForMentions = async (
  handles: string[],
  payload: Omit<CreateNotificationInput, "userId">
) => {
  if (!handles.length) return;
  const usersCol = collection(db, "users");
  for (const handle of handles) {
    const q = query(usersCol, where("username", "==", handle));
    const snap = await getDocs(q);
    snap.forEach((docSnap) => {
      createNotification({ ...payload, userId: docSnap.id });
    });
  }
};
