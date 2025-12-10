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

// Utility to safely access environment variables in all environments (Next.js & Vite/Preview)
const getEnvVar = (key: string): string | undefined => {
    try {
        // 1. Try standard Node/Next.js process.env
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
        // 2. Try Vite/Modern Bundler import.meta.env
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
            // @ts-ignore
            return import.meta.env[key];
        }
    } catch (e) {
        // Ignore access errors
    }
    return undefined;
};

// 1. Try to load manual config from LocalStorage
let manualConfig: any = null;
if (typeof window !== 'undefined') {
    try {
        const saved = localStorage.getItem('firebase_manual_config');
        if (saved) {
            manualConfig = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to parse manual config', e);
    }
}

// 2. Load from Environment Variables (Direct Access)
// We access these directly to ensure Next.js build-time inlining works correctly
const envConfig = {
  apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

// 3. Selection Logic
const firebaseConfig = manualConfig || envConfig;

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let initializationError: string | null = null;
// Initialize with safe defaults to prevent UI crashes
let debugEnv: Record<string, string> = {
    apiKey: 'Checking...',
    authDomain: 'Checking...',
    projectId: 'Checking...',
    storageBucket: 'Checking...',
    appId: 'Checking...'
};

try {
    // Populate debug object for UI
    debugEnv = {
        apiKey: envConfig.apiKey ? 'Loaded' : 'Missing',
        authDomain: envConfig.authDomain ? 'Loaded' : 'Missing',
        projectId: envConfig.projectId ? 'Loaded' : 'Missing',
        storageBucket: envConfig.storageBucket ? 'Loaded' : 'Missing',
        appId: envConfig.appId ? 'Loaded' : 'Missing',
    };
    
    // Strict Validation
    const missingKeys = Object.entries(firebaseConfig)
        .filter(([key, value]) => !value && key !== 'messagingSenderId') // messagingSenderId is optional
        .map(([key]) => key);

    if (missingKeys.length > 0) {
        // Only log warning, as this is expected in first-time setup or preview
        console.warn(`[Firebase Init] Configuration missing for: ${missingKeys.join(', ')}`);
        initializationError = `Missing Keys: ${missingKeys.join(', ')}`;
    } else {
        // Initialize
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);
        console.log('[Firebase Init] Success.');
    }
    
} catch (error: any) {
    console.error("[Firebase Init] Exception:", error);
    initializationError = error.message || "Unknown initialization error";
}

// Helper methods for manual override
export const saveManualConfig = (configStr: string) => {
    try {
        const parsed = JSON.parse(configStr);
        localStorage.setItem('firebase_manual_config', JSON.stringify(parsed));
        window.location.reload();
    } catch (e) {
        alert("Invalid JSON format");
    }
};

export const clearManualConfig = () => {
    localStorage.removeItem('firebase_manual_config');
    window.location.reload();
};

export { db, storage, auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, initializationError, debugEnv };
export type { User } from 'firebase/auth';