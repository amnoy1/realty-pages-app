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
    apiKey: "PASTE_HERE", 
    authDomain: "PASTE_HERE",
    projectId: "PASTE_HERE",
    storageBucket: "PASTE_HERE",
    messagingSenderId: "PASTE_HERE",
    appId: "PASTE_HERE"
};

// 1. Try Environment Variables (Vercel)
// IMPORTANT: In Next.js Client Side, we must access process.env.NEXT_PUBLIC_* directly 
// so the bundler can replace them at build time. Dynamic access (process.env[key]) returns undefined.
const envConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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