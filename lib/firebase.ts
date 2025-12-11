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

// --- הוראות אבטחה חשובות ---
// 1. המפתחות למטה הם מפתחות FIREBASE בלבד. הם *ציבוריים* ובטוחים לשימוש בקוד זה.
// 2. את מפתח ה-Gemini AI (הסודי) יש לשמור *רק* ב-Vercel Environment Variables. אל תדביק אותו כאן!

const HARDCODED_CONFIG = {
    // העתק לכאן את ה-apiKey מתוך Firebase Console -> Project Settings
    apiKey: "PASTE_YOUR_FIREBASE_API_KEY_HERE", 
    
    // העתק את שאר הערכים:
    authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "PASTE_YOUR_PROJECT_ID",
    storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "PASTE_SENDER_ID",
    appId: "PASTE_YOUR_APP_ID"
};

// בדיקה: האם המשתמש אכן מילא את הפרטים הידניים?
const isHardcodedFilled = 
    HARDCODED_CONFIG.apiKey && 
    !HARDCODED_CONFIG.apiKey.includes("PASTE_YOUR") &&
    HARDCODED_CONFIG.projectId &&
    !HARDCODED_CONFIG.projectId.includes("PASTE_YOUR");

// ניסיון למשוך משתנים מ-Vercel
const envConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// בחירת התצורה: עדיפות ל-Hardcoded אם הוא מולא תקין (כדי לעקוף בעיות Vercel)
const firebaseConfig = isHardcodedFilled ? HARDCODED_CONFIG : (envConfig.apiKey ? envConfig : null);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let initializationError: string | null = null;

// מידע לדיבוג (יוצג ב-"System Check")
let debugEnv: Record<string, string> = {
    source: isHardcodedFilled ? 'Hardcoded File (Manual)' : (envConfig.apiKey ? 'Vercel Env Vars' : 'None - Missing Config'),
    details: isHardcodedFilled ? 'Using manually pasted keys' : 'Using process.env keys'
};

try {
    if (!firebaseConfig) {
        console.warn("[Firebase Init] No valid configuration found.");
        initializationError = "Missing Configuration";
    } else {
        // Initialize
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);
        console.log('[Firebase Init] Success using source:', debugEnv.source);
    }
} catch (error: any) {
    console.error("[Firebase Init] Exception:", error);
    initializationError = error.message || "Unknown initialization error";
}

export { db, storage, auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, initializationError, debugEnv };
export type { User } from 'firebase/auth';