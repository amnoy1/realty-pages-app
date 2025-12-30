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

// Helper to safely get environment variables in both Next.js and browser ESM environments
const getEnv = (key: string): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}
  
  // Fallback for some preview environments
  if (typeof window !== 'undefined' && (window as any).ENV?.[key]) {
    return (window as any).ENV[key];
  }
  return undefined;
};

const HARDCODED_CONFIG = {
    apiKey: "PASTE_YOUR_FIREBASE_API_KEY_HERE", 
    authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "PASTE_YOUR_PROJECT_ID",
    storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "PASTE_SENDER_ID",
    appId: "PASTE_YOUR_APP_ID"
};

const isHardcodedFilled = 
    HARDCODED_CONFIG.apiKey && 
    !HARDCODED_CONFIG.apiKey.includes("PASTE_YOUR") &&
    HARDCODED_CONFIG.projectId &&
    !HARDCODED_CONFIG.projectId.includes("PASTE_YOUR");

const envConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

const firebaseConfig = isHardcodedFilled ? HARDCODED_CONFIG : (envConfig.apiKey ? envConfig : null);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let initializationError: string | null = null;

if (firebaseConfig) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);
    } catch (error: any) {
        console.error("[Firebase Init Error]", error);
        initializationError = error.message;
    }
} else {
    console.warn("[Firebase] No configuration found. Authentication and Database will be unavailable.");
}

// Diagnostics for the System Check modal
let debugEnv: Record<string, string> = {
    source: isHardcodedFilled ? 'Hardcoded File (Manual)' : (envConfig.apiKey ? 'Environment Variables' : 'None - Missing Config'),
    status: firebaseConfig ? 'Config present' : 'Config missing'
};

export { db, storage, auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, initializationError, debugEnv };
export type { User } from 'firebase/auth';
