
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

const ADMIN_EMAILS = ['amir@mango-realty.com']; 

const SystemCheckModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [serverStatus, setServerStatus] = useState("Checking...");
    const [currentDomain, setCurrentDomain] = useState("");

    useEffect(() => {
        setCurrentDomain(window.location.hostname);
        fetch('/api/generate-content', { method: 'POST', body: JSON.stringify({ ping: true }) })
            .then(async (res) => {
                if (res.status === 500) setServerStatus("SERVER ERROR");
                else if (res.status === 400) setServerStatus("OK");
                else setServerStatus("UNKNOWN");
            })
            .catch(() => setServerStatus("CONNECTION FAILED"));
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">בדיקת מערכת</h3>
                <div className="space-y-3 mb-6">
                    <div className="bg-slate-900 p-3 rounded-lg flex justify-between items-center">
                        <span className="text-slate-300">סטטוס שרת AI</span>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${serverStatus === "OK" ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>{serverStatus}</span>
                    </div>
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
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
        const userEmail = currentUser.email?.toLowerCase() || '';
        const isUserAdmin = ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail);
        setIsAdmin(isUserAdmin);
        
        if (db) {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            const now = Date.now();
            
            if (userSnap.exists()) {
                await updateDoc(userRef, {
                    lastLogin: now,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                    email: currentUser.email
                });
            } else {
                await setDoc(userRef, {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                    role: isUserAdmin ? 'admin' : 'user',
                    lastLogin: now,
                    createdAt: now
                } as UserProfile);
            }
        }
      } else {
        setIsAdmin(false);
        setCurrentView('create');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFormSubmit = async (formData: PropertyFormData) => {
    if (!user) { alert("עליך להתחבר למערכת."); return; }
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalDescription: formData.description, address: formData.address }),
      });
      const generatedData = await response.json();
      setPropertyDetails({
        ...formData,
        userId: user.uid,
        userEmail: user.email || '',
        generatedTitle: generatedData.title,
        enhancedDescription: generatedData.description,
        features: generatedData.features,
      });
    } catch (err: any) {
      console.error(err);
      alert("שגיאה בייצור תוכן");
    } finally { setIsLoading(false); }
  };

  const uploadFile = async (base64: string, path: string): Promise<string> => {
    if (!storage) throw new Error("Storage not initialized");
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
    const blob = new Blob([uInt8Array], { type: contentType });
    
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, blob);
    return await getDownloadURL(snapshot.ref);
  };
  
  const handleSaveAndPublish = async () => {
    if (!propertyDetails || !user || !db) return;
    setIsSaving(true);
    try {
      const docRef = doc(collection(db, "landingPages"));
      const newId = docRef.id;
      const slug = slugify(propertyDetails.address);

      const imageUrls = await Promise.all(
        propertyDetails.images.map((img, index) => 
            img.startsWith('data:') 
            ? uploadFile(img, `properties/${newId}/image_${index}_${Date.now()}.jpg`)
            : Promise.resolve(img)
        )
      );
      
      let logoUrl = propertyDetails.logo || '';
      if (propertyDetails.logo?.startsWith('data:')) {
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
      router.push(`/${slug}-${newId}`);
    } catch (error: any) {
        alert("שגיאה בשמירה");
    } finally { setIsSaving(false); }
  };

  const handleUpdateProperty = async (updated: PropertyDetails) => {
    if (!db || !user || !updated.id) return;
    setIsSaving(true);
    try {
        const docRef = doc(db, 'landingPages', updated.id);
        const imageUrls = await Promise.all(
            updated.images.map(img => img.startsWith('data:') ? uploadFile(img, `properties/${updated.id}/img_${Date.now()}.jpg`) : img)
        );
        await updateDoc(docRef, { ...updated, images: imageUrls, lastUpdatedAt: Date.now() });
        setCurrentView('dashboard');
    } catch (err) { alert("שגיאה בעדכון"); }
    finally { setIsSaving(false); }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start">
          <Auth user={user} isAdmin={isAdmin} onViewChange={(view) => { setCurrentView(view); setPropertyDetails(null); setEditingProperty(null); }} currentView={currentView} />
      </div>
      <div className="pt-16">
          {currentView === 'edit' && editingProperty ? (
              <EditForm property={editingProperty} onSave={handleUpdateProperty} onCancel={() => setCurrentView('dashboard')} isSaving={isSaving} />
          ) : currentView === 'admin' && isAdmin ? (
              <AdminDashboard />
          ) : currentView === 'dashboard' && user ? (
              <UserDashboard userId={user.uid} userEmail={user.email} onCreateNew={() => setCurrentView('create')} onEdit={(p) => { setEditingProperty(p); setCurrentView('edit'); }} />
          ) : (
              propertyDetails ? (
                <LandingPage details={propertyDetails} isPreview={true} onReset={() => setPropertyDetails(null)} onSave={handleSaveAndPublish} isSaving={isSaving} />
              ) : (
                <div className="relative">
                   {!user && (
                       <div className="absolute inset-0 z-40 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                           <h2 className="text-3xl font-bold text-white mb-4">ניהול נכסי נדל"ן</h2>
                           <p className="text-slate-300">התחבר כדי להתחיל ליצור דפי נחיתה</p>
                       </div>
                   )}
                   <CreationForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                </div>
              )
          )}
      </div>
    </div>
  );
};

export default HomePage;
