import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider as GAP, 
  signInWithPopup as signInPopup, 
  signOut as signOutAuth, 
  onAuthStateChanged as onAuthChanged, 
  User 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Variables to hold the exported instances
let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;
let GoogleAuthProvider: any;
let signInWithPopup: any;
let signOut: any;
let onAuthStateChanged: any;

export let isMockMode = false;

const hasKeys = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

if (!hasKeys) {
    console.warn("⚠️ Firebase keys are missing. App is running in SAFE MOCK mode.");
    isMockMode = true;
    
    // Create Mock Objects that mimic Firebase structure to prevent crashes
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
    auth = {} as Auth;
    
    // Mock Auth Functions
    GoogleAuthProvider = class { constructor() {} };
    
    signInWithPopup = async () => {
        console.log("Mock Login Triggered");
        // Simulate a successful login after delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    user: {
                        uid: 'mock-user-123',
                        displayName: 'משתמש הדגמה',
                        email: 'demo@example.com',
                        photoURL: null
                    }
                });
            }, 1000);
        });
    };

    signOut = async () => {
        console.log("Mock Logout");
        return Promise.resolve();
    };

    // Important: Mock listener that returns a no-op unsubscribe function
    onAuthStateChanged = (authInstance: any, callback: (user: any) => void) => {
        console.log("Mock Auth Listener Attached");
        // Immediately verify "no user" initially in mock mode, or simulate user if needed
        callback(null); 
        return () => {}; // Return empty unsubscribe function
    };

} else {
    // REAL FIREBASE INITIALIZATION
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);
        
        // Map real functions
        GoogleAuthProvider = GAP;
        signInWithPopup = signInPopup;
        signOut = signOutAuth;
        onAuthStateChanged = onAuthChanged;
        
    } catch (error) {
        console.error("Firebase Initialization Error:", error);
        isMockMode = true;
    }
}

export { db, storage, auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged };
export type { User };