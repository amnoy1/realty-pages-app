import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  Auth
} from 'firebase/auth';

/**
 * EXPLICIT ENVIRONMENT VARIABLE ACCESS
 * This ensures that the app uses the keys defined in Vercel/Production.
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

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let initializationError: string | null = null;

if (envConfig.apiKey && envConfig.projectId) {
    try {
        app = !getApps().length ? initializeApp(envConfig) : getApp();
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);
        console.log("[Firebase] Initialized with environment variables");
    } catch (error: any) {
        console.error("[Firebase] Init Error:", error);
        initializationError = error.message;
    }
} else {
    const msg = "Firebase configuration is missing in environment variables.";
    console.warn("[Firebase]", msg);
    initializationError = msg;
}

export const debugEnv: Record<string, string> = {
    source: 'Environment Variables',
    projectId: envConfig?.projectId || 'Not Found',
    hasApiKey: envConfig?.apiKey ? 'Yes' : 'No'
};

export { db, storage, auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, initializationError };
export type { User } from 'firebase/auth';
