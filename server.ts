import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc } from "firebase/firestore";
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());

  // Initialize Firebase inside startServer to catch errors
  let db: any;
  try {
    if (!firebaseConfig.projectId) {
      throw new Error("Firebase Project ID is missing in config");
    }
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || undefined);
    console.log("Firebase Client SDK initialized successfully");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }

  // Debug route
  app.get("/debug", (req, res) => {
    res.json({
      status: "running",
      env: process.env.NODE_ENV,
      firebase: !!db,
      config: {
        projectId: firebaseConfig.projectId,
        databaseId: firebaseConfig.firestoreDatabaseId
      }
    });
  });

  // API Router
  const apiRouter = express.Router();

  apiRouter.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.path}`);
    next();
  });

  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok", firebase: !!db });
  });

  apiRouter.get("/test", (req, res) => {
    res.json({ message: "API is working" });
  });

  apiRouter.post("/admin/create-user", async (req, res) => {
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }
    const { email, password, username, role, companyData } = req.body;
    
    try {
      const usersCol = collection(db, "users");
      const userRef = doc(usersCol);
      const uid = userRef.id;

      await setDoc(userRef, {
        id: uid,
        username,
        password, 
        role,
        companyId: uid,
        email
      });

      if (companyData) {
        const companyRef = doc(db, "companies", uid);
        await setDoc(companyRef, {
          ...companyData,
          id: uid
        });
      }

      res.json({ success: true, uid });
    } catch (error: any) {
      console.error("Error creating user in Firestore:", error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.delete("/admin/delete-user/:uid", async (req, res) => {
    const { uid } = req.params;
    try {
      const userRef = doc(db, "users", uid);
      const companyRef = doc(db, "companies", uid);
      
      await deleteDoc(userRef);
      await deleteDoc(companyRef);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting user from Firestore:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.use("/api", apiRouter);

  // API 404 Handler
  apiRouter.use("*", (req, res) => {
    console.warn(`[API 404] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: `API Route ${req.originalUrl} not found` });
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
