import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCWQl4ko9RBLR5Cb2F9WpvinJwqSGbgsVw",
  authDomain: "hr-azoos.firebaseapp.com",
  projectId: "hr-azoos",
  storageBucket: "hr-azoos.firebasestorage.app",
  messagingSenderId: "728694964911",
  appId: "1:728694964911:web:ab8f8f1610c5d78b5a0a5a",
  measurementId: "G-V35CBWBX31"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
