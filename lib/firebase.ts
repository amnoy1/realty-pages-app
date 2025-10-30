// Import the functions you need from the SDKs you need
// FIX: Use Firebase v8 compat syntax since modular v9 functions are not found.
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// ---
// **הוראות למשתמש:**
// 1. היכנס ל- https://console.firebase.google.com/
// 2. צור פרויקט חדש.
// 3. עבור אל הגדרות הפרויקט (Project Settings).
// 4. תחת לשונית "General", גלול למטה אל "Your apps".
// 5. לחץ על סמל האינטרנט (</>) כדי ליצור אפליקציית אינטרנט חדשה.
// 6. העתק את אובייקט `firebaseConfig` שמופיע שם.
// 7. צור קובץ `.env.local` בשורש הפרויקט שלך.
// 8. הדבק את הערכים שהעתקת לתוך קובץ ה-`.env.local` בפורמט הבא:
//    NEXT_PUBLIC_FIREBASE_API_KEY=YourApiKey
//    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YourAuthDomain
//    ...וכו'
// ---


// Initialize Firebase using v8 syntax to avoid re-initialization in Next.js
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


export const db = firebase.firestore();
export const storage = firebase.storage();
export const auth = firebase.auth();
