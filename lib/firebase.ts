import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";

// הגדרת המפתחות
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let db: firebase.firestore.Firestore;
let storage: firebase.storage.Storage;
let auth: firebase.auth.Auth;

// משתנה שבודק אם אנחנו במצב דמה (ללא מפתחות)
export let isMockMode = false;

// בדיקה האם יש מפתחות קונפיגורציה
const hasKeys = !!firebaseConfig.apiKey; 

if (!hasKeys) {
    console.warn("⚠️ חסרים מפתחות Firebase. האפליקציה עברה למצב MOCK (הדגמה) כדי למנוע קריסה.");
    isMockMode = true;

    // --- יצירת אובייקטים מזויפים (Mocks) כדי שהאפליקציה תעלה ---
    
    // Mock Database
    db = {
        collection: (name: string) => ({
            doc: (id?: string) => ({
                id: id || 'mock-id-' + Date.now(),
                set: async (data: any) => { console.log('Mock DB: Data "saved"', data); },
                get: async () => ({ exists: false, data: () => null }),
            })
        })
    } as unknown as firebase.firestore.Firestore;

    // Mock Storage
    storage = {
        ref: (path: string) => ({
            putString: async (data: string, format: string) => ({
                ref: { 
                    getDownloadURL: async () => "https://placehold.co/800x600/1e293b/FFF?text=Mock+Image" 
                }
            })
        })
    } as unknown as firebase.storage.Storage;

    // Mock Auth
    auth = {} as unknown as firebase.auth.Auth;

} else {
    // יש מפתחות - מנסים להתחבר באמת
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        storage = firebase.storage();
        auth = firebase.auth();
    } catch (error) {
        console.error("Firebase Initialization Error:", error);
        // במקרה של שגיאה (למשל מפתח לא תקין), עוברים ל-Mock כדי לא להקריס
        isMockMode = true;
        db = { collection: () => ({ doc: () => ({ set: async () => {}, get: async () => ({ exists: false }) }) }) } as any;
        storage = { ref: () => ({ putString: async () => ({ ref: { getDownloadURL: async () => "" } }) }) } as any;
        auth = {} as any;
    }
}

export { db, storage, auth };