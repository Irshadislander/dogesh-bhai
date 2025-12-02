import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Conversation } from "@/lib/types";

export const getOrCreateConversation = async (currentUid: string, targetUid: string) => {
  const convCol = collection(db, "conversations");
  const q = query(convCol, where("participants", "array-contains", currentUid));
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) => {
    const data = d.data() as any;
    return Array.isArray(data.participants) && data.participants.includes(targetUid);
  });
  if (existing) return existing;

  const newDoc = await addDoc(convCol, {
    participants: [currentUid, targetUid],
    lastMessage: "",
    lastSenderId: "",
    updatedAt: serverTimestamp(),
    unreadCountByUser: {
      [currentUid]: 0,
      [targetUid]: 0,
    },
  });
  return await getDoc(newDoc);
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  text: string,
  participants?: string[]
) => {
  const trimmed = text.trim();
  if (!trimmed) return;
  const msgCol = collection(db, "conversations", conversationId, "messages");
  await addDoc(msgCol, {
    senderId,
    text: trimmed,
    createdAt: serverTimestamp(),
    seenBy: [senderId],
  });

  let participantList = participants;
  if (!participantList || participantList.length === 0) {
    const snap = await getDoc(doc(db, "conversations", conversationId));
    participantList = (snap.data()?.participants as string[]) || [];
  }

  const updatePayload: Record<string, any> = {
    lastMessage: trimmed,
    lastSenderId: senderId,
    updatedAt: serverTimestamp(),
  };

  participantList.forEach((uid) => {
    if (uid !== senderId) {
      updatePayload[`unreadCountByUser.${uid}`] = increment(1);
    }
  });

  await updateDoc(doc(db, "conversations", conversationId), updatePayload);
};

export const markConversationSeen = async (conversationId: string, viewerUid: string) => {
  const convRef = doc(db, "conversations", conversationId);
  await updateDoc(convRef, {
    [`unreadCountByUser.${viewerUid}`]: 0,
  });
};
