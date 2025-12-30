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

// Safely get environment variables across different environments (Next.js, Vite, Browser ESM)
const getEnv = (key: string): string | undefined => {
  // 1. Try process.env (Node/Next.js/some previewers)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}
  
  // 2. Try window.ENV or global ENV
  try {
    const globalObj = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
    if ((globalObj as any).ENV?.[key]) {
      return (globalObj as any).ENV[key];
    }
    // Check for process.env on globalObj too
    if ((globalObj as any).process?.env?.[key]) {
      return (globalObj as any).process.env[key];
    }
  } catch (e) {}

  // 3. Special case for the Gemini API Key which is often injected as 'API_KEY'
  if (key.includes('FIREBASE_API_KEY')) {
    const fallback = getEnv('API_KEY') || getEnv('GEMINI_API_KEY');
    if (fallback) return fallback;
  }

  return undefined;
};

// Check if hardcoded keys were pasted
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

// Build config from environment or defaults
const projectId = getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || getEnv('FIREBASE_PROJECT_ID');
const envConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY') || getEnv('FIREBASE_API_KEY') || getEnv('API_KEY'),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') || (projectId ? `${projectId}.firebaseapp.com` : undefined),
  projectId: projectId,
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') || (projectId ? `${projectId}.appspot.com` : undefined),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

const firebaseConfig = isHardcodedFilled ? HARDCODED_CONFIG : (envConfig.apiKey ? envConfig : null);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let initializationError: string | null = null;

if (firebaseConfig && firebaseConfig.apiKey) {
    try {
        // We use a more permissive initialization to let Firebase provide specific errors if keys are weak
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);
    } catch (error: any) {
        console.error("[Firebase Init Error]", error);
        initializationError = error.message;
    }
}

export const debugEnv: Record<string, string> = {
    source: isHardcodedFilled ? 'Hardcoded' : (envConfig.apiKey ? 'Env Vars' : 'None'),
    hasApiKey: !!(envConfig.apiKey || HARDCODED_CONFIG.apiKey) ? 'Yes' : 'No',
    hasProjectId: !!(envConfig.projectId || HARDCODED_CONFIG.projectId) ? 'Yes' : 'No',
};

export { db, storage, auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, initializationError };
export type { User } from 'firebase/auth';
