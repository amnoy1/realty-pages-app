'use client';

import React, { useState, useEffect } from 'react';
import { db, storage, auth, onAuthStateChanged, User, initializationError, debugEnv } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { slugify } from '../lib/slugify';
import { useAppRouter } from '../components/RouterContext';

import type { PropertyDetails, PropertyFormData, PropertyFeatures, UserProfile } from '../types';
import { CreationForm } from '../components/CreationForm';
import { LandingPage } from '../components/LandingPage';
import { Auth } from '../components/Auth';
import { AdminDashboard } from '../components/AdminDashboard';
import { UserDashboard } from '../components/UserDashboard';

// --- CONFIGURATION ---
const ADMIN_EMAILS = ['amir@mango-realty.com']; 

const SystemCheckModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const checks = [
        { name: "Firebase Config Source", status: debugEnv.source },
        { name: "Firebase Auth Ready", status: auth ? "OK" : "FAIL" },
    ];
    const [serverStatus, setServerStatus] = useState("Checking...");
    const [currentDomain, setCurrentDomain] = useState("");

    useEffect(() => {
        setCurrentDomain(window.location.hostname);
        fetch('/api/generate-content', { method: 'POST', body: JSON.stringify({ ping: true }) })
            .then(async (res) => {
                if (res.status === 500) {
                     const text = await res.text();
                     if (text.includes("API_KEY is missing")) setServerStatus("MISSING API_KEY");
                     else setServerStatus("SERVER ERROR");
                } else if (res.status === 400) setServerStatus("OK");
                else setServerStatus("UNKNOWN");
            })
            .catch(() => setServerStatus("CONNECTION FAILED"));
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">בדיקת מערכת (System Check)</h3>
                <div className="space-y-3 mb-6">
                     <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg mb-4">
                        <p className="text-xs text-blue-200 mb-1">הדומיין הנוכחי (להוספה ב-Firebase Auth):</p>
                        <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
                            <code className="text-sm font-mono text-white select-all">{currentDomain}</code>
                            <button onClick={() => navigator.clipboard.writeText(currentDomain)} className="text-xs text-brand-accent hover:text-white px-2">העתק</button>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg flex justify-between items-center">
                        <span className="text-slate-300">Gemini API Key (Server)</span>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${serverStatus === "OK" ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>{serverStatus}</span>
                    </div>
                    {checks.map((check, i) => (
                        <div key={i} className="bg-slate-900 p-3 rounded-lg flex justify-between items-center">
                            <span className="text-slate-300">{check.name}</span>
                            <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${check.status.includes("OK") || check.status.includes("Manual") || check.status.includes("Vercel") ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>{check.status}</span>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors">סגור</button>
            </div>
        </div>
    );
};

const HomePage: React.FC = () => {
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showSystemCheck, setShowSystemCheck] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<'create' | 'dashboard' | 'admin'>('create');
  const router = useAppRouter();

  useEffect(() => {
    setIsClient(true);
    if (initializationError || !auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
        const userEmail = currentUser.email?.toLowerCase() || '';
        const isUserAdmin = ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail);
        setIsAdmin(isUserAdmin);
        try {
            if (db) {
                const userRef = doc(db, 'users', currentUser.uid);
                await setDoc(userRef, {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                    lastLogin: Date.now(),
                    role: isUserAdmin ? 'admin' : 'user'
                } as UserProfile, { merge: true });
            }
        } catch (e) { console.error("Error syncing user profile:", e); }
      } else {
        setIsAdmin(false);
        setCurrentView('create');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFormSubmit = async (formData: PropertyFormData) => {
    if (!user) { alert("עליך להתחבר למערכת כדי ליצור דף נחיתה."); return; }
    if (formData.images.length === 0) { alert('אנא העלה לפחות תמונה אחת.'); return; }
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalDescription: formData.description, address: formData.address }),
      });
      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      const generatedData = await response.json();
      setPropertyDetails({
        ...formData,
        generatedTitle: generatedData.title,
        enhancedDescription: generatedData.description,
        features: generatedData.features,
      });
    } catch (err: any) {
      console.error("⚠️ AI Call Failed:", err);
      if (err.message && (err.message.includes("500") || err.message.includes("API key"))) {
          setShowSystemCheck(true);
      } else { alert("שגיאה בחיבור לשרת ה-AI: " + err.message); }
    } finally { setIsLoading(false); }
  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  };

  const uploadFile = async (base64: string, path: string): Promise<string> => {
    if (!storage) throw new Error("Storage not initialized");
    try {
        console.log(`Starting upload for: ${path}`);
        const storageRef = ref(storage, path);
        const blob = base64ToBlob(base64);
        
        // Using uploadBytes instead of uploadString for reliability
        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`Upload success: ${downloadURL}`);
        return downloadURL;
    } catch (error: any) {
        console.error("Upload error for path:", path, error);
        if (error.code === 'storage/unauthorized') {
            throw new Error("אין הרשאה להעלות תמונות. וודא שב-Firebase Console מוגדר ב-Storage Rules: allow read, write: if request.auth != null;");
        }
        throw error;
    }
  };
  
  const handleSaveAndPublish = async () => {
    if (!propertyDetails || !user) return;
    if (!db || !storage) { alert("שגיאת חיבור לשירותי Firebase."); return; }

    setIsSaving(true);
    console.log("Saving process started...");

    try {
      const docRef = doc(collection(db, "landingPages"));
      const newId = docRef.id;
      const slug = slugify(propertyDetails.address);

      // 1. Upload Images
      let imageUrls: string[] = [];
      if (propertyDetails.images && propertyDetails.images.length > 0) {
          console.log(`Uploading ${propertyDetails.images.length} images...`);
          imageUrls = await Promise.all(
            propertyDetails.images.map((img, index) => 
                uploadFile(img, `properties/${newId}/image_${index}.jpg`)
            )
          );
      } else {
          throw new Error("לא נמצאו תמונות להעלאה.");
      }
      
      // 2. Upload Logo
      let logoUrl = '';
      if (propertyDetails.logo) {
        try {
            logoUrl = await uploadFile(propertyDetails.logo, `properties/${newId}/logo.png`);
        } catch (logoErr) { console.warn("Logo upload failed, continuing without logo"); }
      }

      // 3. Save to Firestore
      const dataToSave: PropertyDetails = {
        ...propertyDetails,
        id: newId,
        slug: slug,
        userId: user.uid,
        userEmail: user.email || 'unknown',
        createdAt: Date.now(),
        images: imageUrls, // REMOTE URLS replacing local base64
        logo: logoUrl,
      };

      console.log("Saving document to Firestore...");
      await setDoc(docRef, dataToSave);
      console.log("Firestore save successful.");

      // New URL structure: Directly after the slash, using address slug and unique ID
      const finalUrlPath = `/${slug}-${newId}`;
      const fullUrl = `${window.location.origin}${finalUrlPath}`;

      navigator.clipboard.writeText(fullUrl).then(() => {
        alert("הדף פורסם בהצלחה! הקישור הועתק.");
        router.push(finalUrlPath);
      }).catch(() => router.push(finalUrlPath));

    } catch (error: any) {
        console.error("Critical error during save:", error);
        alert(error.message || "אירעה שגיאה בשמירת הדף.");
        setIsSaving(false);
    }
  };
  
  const resetApp = () => setPropertyDetails(null);

  if (!isClient) return <div className="flex justify-center items-center min-h-screen bg-slate-900"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-accent"></div></div>;

  if (initializationError || !auth) {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
              <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-2xl max-w-2xl w-full text-center shadow-2xl">
                  <h1 className="text-3xl font-bold text-white mb-4">נדרשת הגדרת מפתחות</h1>
                  <p className="text-slate-300 mb-6 text-right">האפליקציה לא הצליחה להתחבר ל-Firebase. וודא שערכת את קובץ <code>lib/firebase.ts</code> ומילאת את <code>HARDCODED_CONFIG</code>.</p>
                  <button onClick={() => window.location.reload()} className="bg-brand-accent text-white px-6 py-3 rounded-xl font-bold w-full">רענן עמוד</button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen relative bg-slate-900">
      {showSystemCheck && <SystemCheckModal onClose={() => setShowSystemCheck(false)} />}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto">
             <Auth user={user} isAdmin={isAdmin} onViewChange={(view) => { setCurrentView(view); resetApp(); }} currentView={currentView} />
          </div>
      </div>
      <div className="pt-16">
          {currentView === 'admin' && isAdmin ? (
              <AdminDashboard />
          ) : currentView === 'dashboard' && user ? (
              <UserDashboard userId={user.uid} userEmail={user.email} onCreateNew={() => setCurrentView('create')} />
          ) : (
              propertyDetails ? (
                <LandingPage details={propertyDetails} isPreview={true} onReset={resetApp} onSave={handleSaveAndPublish} isSaving={isSaving} />
              ) : (
                <div className="relative">
                   {!user && (
                       <div className="absolute inset-0 z-40 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                           <h2 className="text-3xl font-bold text-white mb-4">ברוכים הבאים למחולל דפי הנחיתה</h2>
                           <p className="text-slate-300 mb-8 max-w-md">התחבר באמצעות חשבון Google כדי להתחיל.</p>
                       </div>
                   )}
                   <CreationForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                </div>
              )
          )}
      </div>
      <div className="fixed bottom-2 left-2 z-50 opacity-30 hover:opacity-100"><button onClick={() => setShowSystemCheck(true)} className="text-[10px] text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-slate-700">System Check</button></div>
    </div>
  );
};

export default HomePage;