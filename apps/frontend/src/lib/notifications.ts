import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

type NotificationPayload = {
  actorId: string;
  actorName: string;
  type: string;
  message: string;
};

export const createNotification = async (recipientId: string, payload: NotificationPayload) => {
  if (!recipientId || !payload.actorId) return;
  const notificationsCol = collection(db, "notifications");
  await addDoc(notificationsCol, {
    recipientId,
    ...payload,
    read: false,
    createdAt: serverTimestamp(),
  });
};

export const createNotificationsForMentions = async (handles: string[], payload: NotificationPayload) => {
  if (!handles.length) return;
  // simple lookup by username field
  const usersCol = collection(db, "users");
  for (const handle of handles) {
    const q = query(usersCol, where("username", "==", handle));
    const snap = await getDocs(q);
    snap.forEach((docSnap) => {
      createNotification(docSnap.id, { ...payload });
    });
  }
};
