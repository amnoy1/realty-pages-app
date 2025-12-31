import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  Auth
} from 'firebase/auth';

const envConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Fallbacks
if (envConfig.projectId && !envConfig.authDomain) {
    envConfig.authDomain = `${envConfig.projectId}.firebaseapp.com`;
}
if (envConfig.projectId && !envConfig.storageBucket) {
    envConfig.storageBucket = `${envConfig.projectId}.appspot.com`;
}

const firebaseConfig = (envConfig.apiKey && envConfig.projectId) ? envConfig : null;

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
        
        console.log("[Firebase] Initialized with Project ID:", firebaseConfig.projectId);
    } catch (error: any) {
        console.error("[Firebase] Initialization error:", error);
        initializationError = error.message;
    }
} else {
    initializationError = "Firebase environment variables are missing.";
    console.warn("[Firebase]", initializationError);
}

export const debugEnv = {
    source: envConfig.apiKey ? 'Environment Variables' : 'Missing',
    projectId: firebaseConfig?.projectId || 'Unknown',
    isAuthReady: !!auth,
    isDbReady: !!db
};

export { db, storage, auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, initializationError };
export type { User } from 'firebase/auth';