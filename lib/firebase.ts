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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseConfig = isHardcodedFilled ? HARDCODED_CONFIG : (envConfig.apiKey ? envConfig : null);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let initializationError: string | null = null;

let debugEnv: Record<string, string> = {
    source: isHardcodedFilled ? 'Hardcoded File (Manual)' : (envConfig.apiKey ? 'Vercel Env Vars' : 'None - Missing Config'),
    details: isHardcodedFilled ? 'Using manually pasted keys' : 'Using process.env keys'
};

// Only initialize if we have a config, otherwise we skip to let the build pass
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
    console.warn("[Firebase] No configuration found. Auth and DB will be unavailable.");
}

export { db, storage, auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, initializationError, debugEnv };
export type { User } from 'firebase/auth';
