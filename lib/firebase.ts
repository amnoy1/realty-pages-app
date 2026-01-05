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

/**
 * EXPLICIT ENVIRONMENT VARIABLE ACCESS
 * In Next.js/Browser environments, dynamic access like process.env[key] 
 * often fails because the bundler replaces literal strings during build.
 */
const envConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Fallback logic for project-based domains if not explicitly provided
if (envConfig.projectId && !envConfig.authDomain) {
    envConfig.authDomain = `${envConfig.projectId}.firebaseapp.com`;
}
if (envConfig.projectId && !envConfig.storageBucket) {
    envConfig.storageBucket = `${envConfig.projectId}.appspot.com`;
}

/**
 * HARDCODED FALLBACK
 * Only used if environment variables are completely missing.
 */
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

// Final config selection
const firebaseConfig = (envConfig.apiKey && envConfig.projectId) ? envConfig : (isHardcodedFilled ? HARDCODED_CONFIG : null);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let initializationError: string | null = null;

if (firebaseConfig && firebaseConfig.apiKey) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);
        console.log("[Firebase] Initialized successfully with project:", firebaseConfig.projectId);
    } catch (error: any) {
        console.error("[Firebase] Init Error:", error);
        initializationError = error.message;
    }
} else {
    const msg = "Firebase configuration is missing or incomplete.";
    console.warn("[Firebase]", msg);
    initializationError = msg;
}

export const debugEnv: Record<string, string> = {
    source: isHardcodedFilled ? 'Hardcoded File' : (envConfig.apiKey ? 'Environment Variables' : 'Missing'),
    projectId: firebaseConfig?.projectId || 'Not Found',
    hasApiKey: firebaseConfig?.apiKey ? 'Yes' : 'No'
};

export { db, storage, auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, initializationError };
export type { User } from 'firebase/auth';
