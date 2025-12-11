'use client';

import React, { useState, useEffect } from 'react';
import { db, storage, auth, onAuthStateChanged, User, initializationError, debugEnv } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { slugify } from '../lib/slugify';
import { useAppRouter } from '../components/RouterContext';

import type { PropertyDetails, PropertyFormData, PropertyFeatures, UserProfile } from '../types';
import { CreationForm } from '../components/CreationForm';
import { LandingPage } from '../components/LandingPage';
import { Auth } from '../components/Auth';
import { AdminDashboard } from '../components/AdminDashboard';
import { UserDashboard } from '../components/UserDashboard';

// --- CONFIGURATION ---
// Add your email here to get Admin access
const ADMIN_EMAILS = ['amir@mango-realty.com']; 

const HomePage: React.FC = () => {
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<'create' | 'dashboard' | 'admin'>('create');
  
  const router = useAppRouter();

  useEffect(() => {
    setIsClient(true);
    
    // Stop if initialization failed or auth is missing
    if (initializationError || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userEmail = currentUser.email?.toLowerCase() || '';
        const isUserAdmin = ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail);
        setIsAdmin(isUserAdmin);

        // Sync user to Firestore
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
        } catch (e) {
            console.error("Error syncing user profile:", e);
        }
      } else {
        setIsAdmin(false);
        setCurrentView('create'); // Reset to create view on logout
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFormSubmit = async (formData: PropertyFormData) => {
    if (!user) {
        alert("עליך להתחבר למערכת כדי ליצור דף נחיתה.");
        return;
    }

    if (formData.images.length === 0) {
      alert('אנא העלה לפחות תמונה אחת.');
      return;
    }

    setIsLoading(true);
    try {
      let generatedData;
      
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
          
          generatedData = await response.json();

      } catch (err: any) {
          console.error("⚠️ API Call Failed:", err);
          
          let errorMsg = "שגיאה בחיבור לשרת ה-AI.\n\n";
          
          if (err.message && (err.message.includes("500") || err.message.includes("API key"))) {
              errorMsg += "סיבה: מפתח ה-API (API_KEY) חסר בהגדרות השרת ב-Vercel.\n";
              errorMsg += "פתרון: יש להוסיף את המשתנה API_KEY ב-Settings -> Environment Variables ולבצע Redeploy.";
          } else {
              errorMsg += `פרטים טכניים: ${err.message}`;
          }

          alert(errorMsg);
          setIsLoading(false);
          return; // STOP HERE: Do not use fallback, do not proceed.
      }

      const newDetails: PropertyDetails = {
        ...formData,
        generatedTitle: generatedData.title,
        enhancedDescription: generatedData.description,
        features: generatedData.features,
      };
      setPropertyDetails(newDetails);
    } catch (error) {
      console.error("Critical error in form submission:", error);
      alert("אירעה שגיאה כללית. אנא נסה שנית.");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (base64: string, path: string): Promise<string> => {
    if (!storage) throw new Error("Storage not initialized");
    const storageRef = ref(storage, path);
    const snapshot = await uploadString(storageRef, base64, 'data_url');
    return getDownloadURL(snapshot.ref);
  };
  
  const handleSaveAndPublish = async () => {
    if (!propertyDetails || !user) {
        if (!user) alert("אנא התחבר כדי לשמור.");
        return;
    }
    
    if (!db) {
        alert("שגיאת חיבור לבסיס הנתונים.");
        return;
    }

    setIsSaving(true);
    try {
      const docRef = doc(collection(db, "landingPages"));
      const newId = docRef.id;
      const slug = slugify(propertyDetails.address);

      const imageUrls = await Promise.all(
        propertyDetails.images.map((img, index) => 
            uploadFile(img, `properties/${newId}/image_${index}.jpg`)
        )
      );
      
      let logoUrl = '';
      if (propertyDetails.logo) {
        logoUrl = await uploadFile(propertyDetails.logo, `properties/${newId}/logo.png`);
      }

      const dataToSave: PropertyDetails = {
        ...propertyDetails,
        id: newId,
        slug: slug,
        userId: user.uid, // LINK TO USER
        userEmail: user.email || 'unknown',
        createdAt: Date.now(),
        images: imageUrls,
        logo: logoUrl,
      };

      await setDoc(docRef, dataToSave);

      const finalUrlPath = `/p/${slug}-${newId}`;
      const fullUrl = `${window.location.origin}${finalUrlPath}`;

      navigator.clipboard.writeText(fullUrl).then(() => {
        alert("הדף פורסם בהצלחה! הקישור הועתק אוטומטית.");
        router.push(finalUrlPath);
      }).catch(err => {
        console.error("Failed to copy URL:", err);
        alert("הדף פורסם! לא ניתן היה להעתיק את הקישור אוטומטית.");
        router.push(finalUrlPath);
      });

    } catch (error: any) {
        console.error("Error saving document: ", error);
        
        let msg = "אירעה שגיאה בשמירת דף הנחיתה.";
        if (error.code === 'permission-denied') {
            msg += "\nשגיאת הרשאות: וודא שחוקי האבטחה (Rules) ב-Firebase מוגדרים נכון.";
        } else if (error.code === 'storage/unauthorized') {
             msg += "\nשגיאת אחסון: אין הרשאה להעלות תמונות.";
        }
        
        alert(msg);
        setIsSaving(false);
    }
  };
  
  const resetApp = () => {
    setPropertyDetails(null);
  };

  if (!isClient) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-900">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-accent"></div>
        </div>
    );
  }

  // --- CRITICAL ERROR UI ---
  // If Env Vars failed AND hardcoded config is empty
  if (initializationError || !auth) {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
              <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-2xl max-w-2xl w-full text-center shadow-2xl animate-fade-in">
                  <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-4">שגיאת התחברות ל-Firebase</h1>
                  <p className="text-lg text-slate-300 mb-6">
                    האפליקציה לא הצליחה לטעון את המפתחות שהגדרת ב-Vercel.
                  </p>
                  
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-right mb-6">
                      <h3 className="text-brand-accent font-bold mb-2">פתרון הבעיה:</h3>
                      <ol className="list-decimal list-inside text-slate-300 space-y-2 text-sm">
                          <li>היכנס ל-<strong>Vercel</strong> לפרויקט שלך.</li>
                          <li>לך ל-<strong>Settings</strong> ואז ל-<strong>Environment Variables</strong>.</li>
                          <li>וודא שכל המשתנים מתחילים ב-<code>NEXT_PUBLIC_FIREBASE_</code>.</li>
                          <li>וודא שהם מסומנים ב-V תחת כל הסביבות (Production, Preview, Development).</li>
                          <li><strong>חשוב מאוד:</strong> בצע Redeploy לאחר השינויים כדי שהם ייכנסו לתוקף.</li>
                      </ol>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen relative bg-slate-900">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto">
             <Auth 
                user={user} 
                isAdmin={isAdmin} 
                onViewChange={(view) => {
                    setCurrentView(view);
                    resetApp(); // Clear any active draft when switching views
                }} 
                currentView={currentView}
             />
          </div>
      </div>
      
      {/* Main Content Router */}
      <div className="pt-16">
          {currentView === 'admin' && isAdmin ? (
              <AdminDashboard />
          ) : currentView === 'dashboard' && user ? (
              <UserDashboard userId={user.uid} onCreateNew={() => setCurrentView('create')} />
          ) : (
              // Create View (Default)
              propertyDetails ? (
                <LandingPage 
                    details={propertyDetails} 
                    isPreview={true}
                    onReset={resetApp} 
                    onSave={handleSaveAndPublish}
                    isSaving={isSaving}
                />
              ) : (
                <div className="relative">
                   {!user && (
                       <div className="absolute inset-0 z-40 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                           <h2 className="text-3xl font-bold text-white mb-4">ברוכים הבאים למחולל דפי הנחיתה</h2>
                           <p className="text-slate-300 mb-8 max-w-md">התחבר באמצעות חשבון Google כדי ליצור, לשמור ולנהל את דפי הנחיתה שלך במקום אחד.</p>
                           <div className="pointer-events-none opacity-50"><Auth user={null} isAdmin={false} onViewChange={()=>{}} currentView='create' /></div>
                           <p className="mt-4 text-sm text-slate-500">לחץ על כפתור ההתחברות בפינה למעלה כדי להתחיל</p>
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