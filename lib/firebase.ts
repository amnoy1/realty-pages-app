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

// Helper to safely get environment variables
const getEnv = (key: string): string | undefined => {
  // Try process.env (Next.js standard)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
};

const firebaseConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let initializationError: string | null = null;

// Only initialize if we have at least the API Key
if (firebaseConfig.apiKey) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);
        console.log("[Firebase] Initialized successfully");
    } catch (error: any) {
        console.error("[Firebase] Initialization error:", error);
        initializationError = error.message;
    }
} else {
    initializationError = "Firebase configuration is missing. Ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in Vercel.";
}

export const debugEnv = {
    source: firebaseConfig.apiKey ? 'Config Found' : 'Config Missing',
    projectId: firebaseConfig.projectId || 'Unknown',
    isAuthReady: !!auth,
};

export { db, storage, auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, initializationError };
export type { User } from 'firebase/auth';