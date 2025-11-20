import { Router } from "express";
import { firestore } from "../config/firebase";
import { DogProfile, validateDogProfile } from "@visway/shared";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    if (!firestore) {
      return res.status(500).json({ message: "Firebase not configured" });
    }

    const snapshot = await firestore.collection("dogs").get();
    const dogs = snapshot.docs.map((doc) => doc.data());
    return res.json(dogs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch dogs", error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!firestore) {
      return res.status(500).json({ message: "Firebase not configured" });
    }

    const doc = await firestore.collection("dogs").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Dog not found" });
    }

    return res.json(doc.data());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch dog", error });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!firestore) {
      return res.status(500).json({ message: "Firebase not configured" });
    }

    const validation = validateDogProfile(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: "Invalid dog profile", errors: validation.errors });
    }

    const docRef = firestore.collection("dogs").doc();
    const payload: DogProfile = {
      id: docRef.id,
      ownerId: req.body.ownerId,
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
      bio: req.body.bio,
      avatarUrl: req.body.avatarUrl,
      tags: req.body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docRef.set(payload);
    return res.status(201).json(payload);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create dog", error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!firestore) {
      return res.status(500).json({ message: "Firebase not configured" });
    }

    const docRef = firestore.collection("dogs").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Dog not found" });
    }

    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    } as Partial<DogProfile>;

    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return res.json(updatedDoc.data());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update dog", error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!firestore) {
      return res.status(500).json({ message: "Firebase not configured" });
    }

    const docRef = firestore.collection("dogs").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Dog not found" });
    }

    await docRef.delete();
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete dog", error });
  }
});

export default router;
