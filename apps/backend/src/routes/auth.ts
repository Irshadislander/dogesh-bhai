import { Router } from "express";
import { firebaseAuth } from "../config/firebase";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    if (!firebaseAuth) {
      return res.status(500).json({ message: "Firebase not configured" });
    }

    const { email, password, displayName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const userRecord = await firebaseAuth.createUser({
      email,
      password,
      displayName,
    });

    return res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Registration failed", error });
  }
});

router.post("/login", async (req, res) => {
  try {
    if (!firebaseAuth) {
      return res.status(500).json({ message: "Firebase not configured" });
    }

    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    const decoded = await firebaseAuth.verifyIdToken(idToken);
    return res.json({
      uid: decoded.uid,
      email: decoded.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token", error });
  }
});

router.get("/profile/:uid", async (req, res) => {
  try {
    if (!firebaseAuth) {
      return res.status(500).json({ message: "Firebase not configured" });
    }

    const { uid } = req.params;
    const user = await firebaseAuth.getUser(uid);
    return res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "User not found", error });
  }
});

export default router;
