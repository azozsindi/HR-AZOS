import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin
if (process.env.VITE_FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/^"(.*)"$/, '$1')
      .trim();

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/admin/create-user", async (req, res) => {
    const { email, password, username, role, companyData } = req.body;
    
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: username,
      });

      // User created in Auth, now SuperAdminDashboard will handle Firestore part
      // or we can do it here
      const db = admin.firestore();
      await db.collection("users").doc(userRecord.uid).set({
        id: userRecord.uid,
        username,
        role,
        companyId: userRecord.uid, // Use UID as company ID for simplicity
        email
      });

      if (companyData) {
        await db.collection("companies").doc(userRecord.uid).set(companyData);
      }

      res.json({ success: true, uid: userRecord.uid });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/delete-user/:uid", async (req, res) => {
    const { uid } = req.params;
    try {
      await admin.auth().deleteUser(uid);
      const db = admin.firestore();
      await db.collection("users").doc(uid).delete();
      await db.collection("companies").doc(uid).delete();
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
