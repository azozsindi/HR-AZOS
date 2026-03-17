import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp as initializeAdminApp, cert } from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load Firebase config safely
let firebaseConfig: any = {};
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
try {
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    console.log("Loaded Firebase config for project:", firebaseConfig.projectId);
  } else {
    console.warn("firebase-applet-config.json not found at:", configPath);
  }
} catch (err) {
  console.error("Failed to load firebase-applet-config.json:", err);
}

// Initialize Firebase Admin SDK
let adminDb: any;
try {
  if (firebaseConfig.projectId) {
    // In this environment, we can often initialize with just the project ID
    // if running on Cloud Run or with default credentials.
    initializeAdminApp({
      projectId: firebaseConfig.projectId,
    });
    adminDb = getAdminFirestore();
    console.log("Firebase Admin SDK initialized successfully");
  } else {
    console.warn("Firebase Admin initialization skipped: No projectId found");
  }
} catch (error) {
  console.error("Firebase Admin initialization failed:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Global logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API Routes - Using Admin SDK for Firestore operations
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", firebase: !!adminDb });
  });

  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working" });
  });

  app.post("/api/admin/create-user", async (req, res) => {
    console.log("Creating user with data:", req.body);
    if (!adminDb) {
      return res.status(500).json({ error: "Admin Database not initialized" });
    }
    const { email, password, username, role, companyData } = req.body;
    
    try {
      const userRef = adminDb.collection("users").doc();
      const uid = userRef.id;

      await userRef.set({
        id: uid,
        username,
        password, 
        role,
        companyId: uid,
        email
      });

      if (companyData) {
        const companyRef = adminDb.collection("companies").doc(uid);
        await companyRef.set({
          ...companyData,
          id: uid
        });
      }

      console.log("User created successfully via Admin SDK:", uid);
      res.json({ success: true, uid });
    } catch (error: any) {
      console.error("Error creating user in Firestore (Admin):", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/delete-user/:uid", async (req, res) => {
    const { uid } = req.params;
    if (!adminDb) {
      return res.status(500).json({ error: "Admin Database not initialized" });
    }
    try {
      await adminDb.collection("users").doc(uid).delete();
      await adminDb.collection("companies").doc(uid).delete();
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting user from Firestore (Admin):", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Debug route
  app.get("/debug", (req, res) => {
    res.json({
      status: "running",
      env: process.env.NODE_ENV,
      firebaseAdmin: !!adminDb,
      config: {
        projectId: firebaseConfig.projectId
      }
    });
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

  // Final Catch-all 404 for everything
  app.use((req, res) => {
    console.error(`[FINAL 404] ${req.method} ${req.url}`);
    res.status(404).send(`Cannot ${req.method} ${req.url} - No route matched in Express`);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is strictly listening on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}

console.log("Starting server process...");
startServer().catch(err => {
  console.error("FATAL: Server failed to start:", err);
});
