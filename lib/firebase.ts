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

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let initializationError: string | null = null;
let debugEnv: Record<string, boolean> = {};

try {
    // Debug helper to see what's missing in the UI
    debugEnv = {
        apiKey: !!firebaseConfig.apiKey,
        authDomain: !!firebaseConfig.authDomain,
        projectId: !!firebaseConfig.projectId,
        storageBucket: !!firebaseConfig.storageBucket,
        appId: !!firebaseConfig.appId,
    };

    // Strict check for required keys
    const missingKeys = Object.entries(firebaseConfig)
        .filter(([key, value]) => !value && key !== 'messagingSenderId') // SenderId is optional sometimes
        .map(([key]) => key);

    if (missingKeys.length > 0) {
        initializationError = `Missing Keys: ${missingKeys.join(', ')}`;
    } else {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);
    }
    
} catch (error: any) {
    console.error("Firebase Initialization Failed:", error);
    initializationError = error.message;
}

export { db, storage, auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, initializationError, debugEnv };
export type { User } from 'firebase/auth';