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

// Helper to safely get environment variables in various environments
const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore - Fallback for browser-injected globals if any
  if (typeof window !== 'undefined' && window[key]) {
    // @ts-ignore
    return window[key];
  }
  return undefined;
};

const envConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

// Auto-fill common derivatives if missing
if (envConfig.projectId && !envConfig.authDomain) {
    envConfig.authDomain = `${envConfig.projectId}.firebaseapp.com`;
}
if (envConfig.projectId && !envConfig.storageBucket) {
    envConfig.storageBucket = `${envConfig.projectId}.appspot.com`;
}

// Validation - we try to initialize even with partial config if apiKey is present
const firebaseConfig = envConfig.apiKey ? envConfig : null;

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
        
        console.log("[Firebase] Successfully initialized with Project:", firebaseConfig.projectId);
    } catch (error: any) {
        console.error("[Firebase] Initialization failed:", error);
        initializationError = error.message;
    }
} else {
    initializationError = "Firebase configuration is missing (NEXT_PUBLIC_FIREBASE_API_KEY).";
    console.warn("[Firebase]", initializationError);
}

export const debugEnv = {
    source: firebaseConfig ? 'Detected Config' : 'Missing Config',
    projectId: firebaseConfig?.projectId || 'Unknown',
    isAuthReady: !!auth,
    isDbReady: !!db
};

export { db, storage, auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, initializationError };
export type { User } from 'firebase/auth';