import { collection, deleteDoc, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const followUser = async (currentUid: string, targetUid: string) => {
  if (!currentUid || !targetUid || currentUid === targetUid) return;
  const followerRef = doc(db, "users", targetUid, "followers", currentUid);
  const followingRef = doc(db, "users", currentUid, "following", targetUid);
  await setDoc(followerRef, { followerId: currentUid, followedAt: new Date().toISOString() });
  await setDoc(followingRef, { followingId: targetUid, followedAt: new Date().toISOString() });
};

export const unfollowUser = async (currentUid: string, targetUid: string) => {
  if (!currentUid || !targetUid || currentUid === targetUid) return;
  const followerRef = doc(db, "users", targetUid, "followers", currentUid);
  const followingRef = doc(db, "users", currentUid, "following", targetUid);
  await deleteDoc(followerRef);
  await deleteDoc(followingRef);
};

export const subscribeToUserFollowers = (userId: string, cb: (count: number, isFollowing: boolean) => void, currentUid?: string) => {
  const col = collection(db, "users", userId, "followers");
  return onSnapshot(col, (snap) => {
    const isFollowing = !!currentUid && snap.docs.some((d) => d.id === currentUid);
    cb(snap.size, isFollowing);
  });
};

export const subscribeToUserFollowing = (userId: string, cb: (count: number) => void) => {
  const col = collection(db, "users", userId, "following");
  return onSnapshot(col, (snap) => cb(snap.size));
};

export const isFollowingUser = async (currentUid: string, targetUid: string) => {
  if (!currentUid || !targetUid) return false;
  const ref = doc(db, "users", targetUid, "followers", currentUid);
  const snap = await getDoc(ref);
  return snap.exists();
};
