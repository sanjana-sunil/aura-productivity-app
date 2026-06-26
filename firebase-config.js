// firebase-config.js
console.log("Firebase app init starting");
// 1. Hardcode your actual Firebase credentials here
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCi79aoLrNP9lhGbxfIi_ktXFyBvJ9GI0E",
  authDomain: "aura-4dc17.firebaseapp.com",
  projectId: "aura-4dc17",
  storageBucket: "aura-4dc17.firebasestorage.app",
  messagingSenderId: "1040677060422",
  appId: "1:1040677060422:web:6dafd19492f56e0b9b2f47",
  measurementId: "G-8N20E2ZRY3"
};

// Function to check if a config is valid (not placeholders)
export function isValidConfig(cfg) {
  return cfg && cfg.apiKey && cfg.apiKey !== "YOUR_API_KEY" && cfg.apiKey.trim() !== "";
}

// Get the config to use (Defaults to your hardcoded config)
let activeConfig = firebaseConfig;

const savedConfigStr = localStorage.getItem("aura_firebase_config");
if (savedConfigStr) {
  try {
    const savedConfig = JSON.parse(savedConfigStr);
    if (isValidConfig(savedConfig)) {
      console.log("valid config");
      activeConfig = savedConfig;
    }
  } catch (e) {
    console.error("Error parsing saved Firebase config:", e);
  }
}

// Imports from the Firebase CDN (v10 modular SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let app = null;
let auth = null;
let db = null;
let provider = null;
let isInitialized = false;

// Add initializeAuth and browserLocalPersistence to this line:
import {
  getAuth,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// ... your standard variables ...
app = initializeApp(activeConfig);
console.log("App initialized:", app);
if (isValidConfig(activeConfig)) {
  try {
    console.log("we're here");
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account"
    });
    db = getFirestore(app);
    isInitialized = true;
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
}

// Export references & functions
export {
  auth,
  db,
  provider,
  isInitialized,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy
};

// Google Auth operations
export async function loginWithGoogle() {
  if (!isInitialized) throw new Error("Firebase is not initialized. Please configure credentials first.");
  try {
    console.log("Attempting Google Sign-In...");
    return await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("Google Sign-In failed:", err);
    throw err;
  }
}

export async function logoutUser() {
  if (!isInitialized) throw new Error("Firebase is not initialized.");
  return signOut(auth);
}

// Storage helpers for configuration
export function saveConfig(config) {
  if (isValidConfig(config)) {
    localStorage.setItem("aura_firebase_config", JSON.stringify(config));
    return true;
  }
  return false;
}

export function clearConfig() {
  localStorage.removeItem("aura_firebase_config");
}

//messaging functions
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

let messaging = null;

function getMessagingSafe() {
  if (!messaging) {
    messaging = getMessaging(app);
  }
  return messaging;
}
export const requestForToken = async () => {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") return;

  const messaging = await getMessagingSafe();

  if (!messaging) {
    console.log("Messaging failed due to registry mismatch");
    return;
  }

  const token = await getToken(messaging, {
    vapidKey: "BI2ocYuY0PRO1-2uVJSmu1g_3tOHc2Amr-I9K4SHtBnldUGqx74dEo-OJh89n4wJ6nA9DEYuDLf9tdCySN6s2gA"
  });

  console.log("FCM TOKEN:", token);
};