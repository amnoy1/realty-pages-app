import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;
export let isMockMode = false;

const hasKeys = !!firebaseConfig.apiKey;

if (!hasKeys) {
    console.warn("⚠️ Firebase keys are missing. App is running in MOCK mode to prevent crashing.");
    isMockMode = true;
    // Assign empty objects to satisfy type-checking and prevent runtime errors.
    // The actual logic will be handled inside components that also check for isMockMode.
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
    auth = {} as Auth;
} else {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);
    } catch (error) {
        console.error("Firebase Initialization Error:", error);
        isMockMode = true;
        // Fallback to mock objects if initialization fails
        db = {} as Firestore;
        storage = {} as FirebaseStorage;
        auth = {} as Auth;
    }
}

export { db, storage, auth };