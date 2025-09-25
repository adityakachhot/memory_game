import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAnalytics,
  isSupported as analyticsIsSupported,
} from "firebase/analytics";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
} from "firebase/auth";

// Firebase configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyCkw0OAIIgFNAEMddJEy6AdT-GVpzY8Zhk",
  authDomain: "memory-master-41cca.firebaseapp.com",
  projectId: "memory-master-41cca",
  storageBucket: "memory-master-41cca.appspot.com",
  messagingSenderId: "1041110557030",
  appId: "1:1041110557030:web:1e2545ae291e8de28128a7",
  measurementId: "G-1T8WWB611L",
};

// Initialize Firebase (avoid re-initializing in HMR/dev)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore Database
export const db = getFirestore(app);

// Auth with local persistence
export const auth = getAuth(app);
setPersistence(auth, indexedDBLocalPersistence).catch(() =>
  setPersistence(auth, browserLocalPersistence).catch(() => {}),
);

// Analytics (only on supported browsers and client-side)
export const analyticsPromise = (() => {
  if (typeof window === "undefined") return Promise.resolve(null);
  return analyticsIsSupported()
    .then((supported) => (supported ? getAnalytics(app) : null))
    .catch(() => null);
})();
