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

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let auth: Auth | undefined;

// בדיקה האם כל המפתחות ההכרחיים קיימים לפני ניסיון אתחול
const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined";

if (isConfigValid) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);
    } catch (error: any) {
        console.error("Firebase initialization error:", error);
    }
} else {
    console.warn("Firebase configuration is missing or invalid. Please set NEXT_PUBLIC_FIREBASE_API_KEY and other variables.");
}

const initializationError = !isConfigValid ? "Missing or invalid Firebase API Key" : null;
const debugEnv = {
    source: isConfigValid ? "Config Valid" : "Config Missing/Invalid"
};

export { 
  db, 
  storage, 
  auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  initializationError,
  debugEnv
};
export type { User } from 'firebase/auth';