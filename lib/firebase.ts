import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  Auth
} from 'firebase/auth';

// --- הוראות: הדבק את המפתחות שלך כאן כדי שהאפליקציה תעבוד ב-PREVIEW ---
const HARDCODED_CONFIG = {
    apiKey: "PASTE_HERE", // לדוגמה: "AIzaSy..."
    authDomain: "PASTE_HERE",
    projectId: "PASTE_HERE",
    storageBucket: "PASTE_HERE",
    messagingSenderId: "PASTE_HERE",
    appId: "PASTE_HERE"
};

// Utility to safely access environment variables
const getEnvVar = (key: string): string | undefined => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) return import.meta.env[key];
    } catch (e) {}
    return undefined;
};

// 1. Try Environment Variables (Vercel)
const envConfig = {
  apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

// 2. Determine which config to use
// If env vars are missing (like in Preview), check if user pasted keys in HARDCODED_CONFIG
const isEnvLoaded = !!envConfig.apiKey;
const isHardcodedLoaded = HARDCODED_CONFIG.apiKey !== "PASTE_HERE";

const firebaseConfig = isEnvLoaded ? envConfig : (isHardcodedLoaded ? HARDCODED_CONFIG : null);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let initializationError: string | null = null;

// Debug info for UI
let debugEnv: Record<string, string> = {
    method: isEnvLoaded ? 'Vercel Env' : (isHardcodedLoaded ? 'Hardcoded File' : 'Missing'),
    apiKey: (isEnvLoaded || isHardcodedLoaded) ? 'Loaded' : 'Missing',
};

try {
    if (!firebaseConfig) {
        console.warn("[Firebase Init] No configuration found (Env vars missing and HARDCODED_CONFIG is empty).");
        initializationError = "Missing Configuration";
    } else {
        // Initialize
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);
        console.log('[Firebase Init] Success using:', isEnvLoaded ? 'Environment Variables' : 'Hardcoded Config');
    }
} catch (error: any) {
    console.error("[Firebase Init] Exception:", error);
    initializationError = error.message || "Unknown initialization error";
}

export { db, storage, auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, initializationError, debugEnv };
export type { User } from 'firebase/auth';
