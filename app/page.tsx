
'use client';

import React, { useState, useEffect } from 'react';
import { db, storage, auth, onAuthStateChanged, User, initializationError, debugEnv } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { slugify } from '../lib/slugify';
import { useAppRouter } from '../components/RouterContext';

import type { PropertyDetails, PropertyFormData, UserProfile } from '../types';
import { CreationForm } from '../components/CreationForm';
import { LandingPage } from '../components/LandingPage';
import { Auth } from '../components/Auth';
import { AdminDashboard } from '../components/AdminDashboard';
import { UserDashboard } from '../components/UserDashboard';
import { EditForm } from '../components/EditForm';

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
  const [editingProperty, setEditingProperty] = useState<PropertyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showSystemCheck, setShowSystemCheck] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<'create' | 'dashboard' | 'admin' | 'edit'>('create');
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
                const userSnap = await getDoc(userRef);
                const existingData = userSnap.data();
                
                await setDoc(userRef, {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                    lastLogin: Date.now(),
                    role: isUserAdmin ? 'admin' : 'user',
                    createdAt: existingData?.createdAt || Date.now()
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
        userId: user.uid, // מוודאים שה-userId נשמר כבר כאן
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

  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(';base64,');
    if (parts.length < 2) return new Blob();
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
        const storageRef = ref(storage, path);
        const blob = base64ToBlob(base64);
        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error: any) {
        console.error("Upload error:", error);
        throw error;
    }
  };
  
  const handleSaveAndPublish = async () => {
    if (!propertyDetails || !user) return;
    if (!db || !storage) { alert("שגיאת חיבור לשירותי Firebase."); return; }

    setIsSaving(true);
    try {
      const docRef = doc(collection(db, "landingPages"));
      const newId = docRef.id;
      const slug = slugify(propertyDetails.address);

      let imageUrls: string[] = [];
      if (propertyDetails.images && propertyDetails.images.length > 0) {
          imageUrls = await Promise.all(
            propertyDetails.images.map((img, index) => 
                img.startsWith('data:') 
                ? uploadFile(img, `properties/${newId}/image_${index}_${Date.now()}.jpg`)
                : Promise.resolve(img)
            )
          );
      }
      
      let logoUrl = propertyDetails.logo || '';
      if (propertyDetails.logo && propertyDetails.logo.startsWith('data:')) {
        logoUrl = await uploadFile(propertyDetails.logo, `properties/${newId}/logo_${Date.now()}.png`);
      }

      const dataToSave: PropertyDetails = {
        ...propertyDetails,
        id: newId,
        slug: slug,
        userId: user.uid,
        userEmail: user.email || 'unknown',
        createdAt: Date.now(),
        images: imageUrls,
        logo: logoUrl,
      };

      await setDoc(docRef, dataToSave);
      const finalUrlPath = `/${slug}-${newId}`;
      navigator.clipboard.writeText(`${window.location.origin}${finalUrlPath}`).then(() => {
        alert("הדף פורסם בהצלחה! הקישור הועתק.");
        router.push(finalUrlPath);
      }).catch(() => router.push(finalUrlPath));

    } catch (error: any) {
        console.error("Critical error during save:", error);
        alert(error.message || "אירעה שגיאה בשמירת הדף.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleUpdateProperty = async (updated: PropertyDetails) => {
    if (!db || !user || !updated.id) return;
    setIsSaving(true);
    try {
        const docRef = doc(db, 'landingPages', updated.id);
        
        const imageUrls = await Promise.all(
            updated.images.map(async (img, index) => {
                if (img.startsWith('data:')) {
                    return await uploadFile(img, `properties/${updated.id}/image_${index}_${Date.now()}.jpg`);
                }
                return img;
            })
        );

        const dataToUpdate = {
            ...updated,
            images: imageUrls,
            lastUpdatedAt: Date.now()
        };

        await updateDoc(docRef, dataToUpdate);
        alert("השינויים נשמרו בהצלחה!");
        setCurrentView('dashboard');
    } catch (err: any) {
        console.error("Update error:", err);
        alert("שגיאה בעדכון הנכס: " + err.message);
    } finally {
        setIsSaving(false);
    }
  };
  
  const resetApp = () => {
      setPropertyDetails(null);
      setEditingProperty(null);
  };

  if (!isClient) return <div className="flex justify-center items-center min-h-screen bg-slate-900"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-accent"></div></div>;

  return (
    <div className="min-h-screen relative bg-slate-900">
      {showSystemCheck && <SystemCheckModal onClose={() => setShowSystemCheck(false)} />}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto">
             <Auth user={user} isAdmin={isAdmin} onViewChange={(view) => { setCurrentView(view); resetApp(); }} currentView={currentView} />
          </div>
      </div>
      <div className="pt-16">
          {currentView === 'edit' && editingProperty ? (
              <EditForm 
                property={editingProperty} 
                onSave={handleUpdateProperty} 
                onCancel={() => setCurrentView('dashboard')} 
                isSaving={isSaving} 
              />
          ) : currentView === 'admin' && isAdmin ? (
              <AdminDashboard />
          ) : currentView === 'dashboard' && user ? (
              <UserDashboard 
                userId={user.uid} 
                userEmail={user.email} 
                onCreateNew={() => setCurrentView('create')} 
                onEdit={(p) => { setEditingProperty(p); setCurrentView('edit'); }}
              />
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
