import { Router } from "express";
import { firestore } from "../config/firebase";
import { CommunityPost } from "@visway/shared";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    if (!firestore) {
      return res.status(500).json({ message: "Firebase not configured" });
    }

    const snapshot = await firestore
      .collection("community")
      .orderBy("createdAt", "desc")
      .get();

    const posts = snapshot.docs.map((doc) => doc.data());
    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch posts", error });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!firestore) {
      return res.status(500).json({ message: "Firebase not configured" });
    }

    const { authorId, content, dogId, imageUrl } = req.body;
    if (!authorId || !content) {
      return res.status(400).json({ message: "authorId and content are required" });
    }

    const docRef = firestore.collection("community").doc();
    const payload: CommunityPost = {
      id: docRef.id,
      authorId,
      dogId,
      content,
      imageUrl,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    await docRef.set(payload);
    return res.status(201).json(payload);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create post", error });
  }
});

router.post("/:id/like", async (req, res) => {
  try {
    if (!firestore) {
      return res.status(500).json({ message: "Firebase not configured" });
    }

    const docRef = firestore.collection("community").doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Post not found" });
    }

    const currentLikes = (doc.data()?.likes as number | undefined) || 0;
    await docRef.update({ likes: currentLikes + 1 });
    const updated = await docRef.get();
    return res.json(updated.data());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to like post", error });
  }
});

export default router;
