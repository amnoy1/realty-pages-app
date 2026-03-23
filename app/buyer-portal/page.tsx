'use client';

import React, { useEffect, useState } from 'react';
import { db, auth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import type { Lead } from '../../types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bed, Square, Layers, Car } from 'lucide-react';

interface BuyerLead extends Lead {
  propertyDetails?: any; // We'll fetch property details too
}

export default function BuyerPortal() {
  const [user, setUser] = useState<any>(null);
  const [leads, setLeads] = useState<BuyerLead[]>([]);
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Login state
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [fetchError, setFetchError] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchLeads(currentUser);
      } else {
        // Not logged in
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchLeads = async (currentUser: any) => {
    if (!db || !currentUser) {
      setLoading(false);
      return;
    }
    
    const email = currentUser.email?.toLowerCase() || null;
    setFetchError('');
    
    try {
      const queries = [];
      
      // Strategy 1: Query by Email (normalized)
      if (email) {
        queries.push(getDocs(query(collection(db, 'leads'), where('email', '==', email))));
      }
      
      // Strategy 2: Query by UID (if available)
      if (currentUser.uid) {
        queries.push(getDocs(query(collection(db, 'leads'), where('uid', '==', currentUser.uid))));
      }

      console.log(`Fetching leads for Email: ${email}, UID: ${currentUser.uid}`);

      const results = await Promise.all(queries);
      const allDocs = results.flatMap(r => r.docs);
      
      // Deduplicate by ID
      const uniqueDocs = new Map();
      allDocs.forEach(d => uniqueDocs.set(d.id, { id: d.id, ...d.data() }));
      const leadsData = Array.from(uniqueDocs.values()) as BuyerLead[];
      
      // Sort by createdAt desc
      leadsData.sort((a, b) => b.createdAt - a.createdAt);

      // Fetch property details for each lead
      const leadsWithProperties = await Promise.all(leadsData.map(async (lead) => {
        try {
          const propertyDocRef = doc(db!, 'landingPages', lead.propertyId);
          const propertyDocSnap = await getDoc(propertyDocRef);
          if (propertyDocSnap.exists()) {
            return { ...lead, propertyDetails: propertyDocSnap.data() };
          }
        } catch (e) {
          console.error("Error fetching property details for lead", lead.id, e);
        }
        return lead;
      }));

      setLeads(leadsWithProperties);

      // Fetch agent profile from the most recent lead
      if (leadsData.length > 0 && leadsData[0].ownerId) {
        const agentDocRef = doc(db, 'users', leadsData[0].ownerId);
        const agentDocSnap = await getDoc(agentDocRef);
        if (agentDocSnap.exists()) {
          setAgentProfile(agentDocSnap.data());
        }
      }

    } catch (err: any) {
      console.error("Error fetching leads:", err);
      setFetchError(err.message || 'Error fetching leads');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      setIsLoggingOut(true);
      await signOut(auth);
      router.push('/');
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the rest
    } catch (err: any) {
      console.error("Error signing in with Google:", err);
      setLoginError('שגיאה בהתחברות: ' + (err.message || 'נסה שנית מאוחר יותר'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'בוקר טוב';
    if (hour >= 12 && hour < 18) return 'צהריים טובים';
    if (hour >= 18 && hour < 22) return 'ערב טוב';
    return 'לילה טוב';
  };

  const clientName = leads.length > 0 ? leads[0].fullName : (user?.displayName || 'לקוח יקר');

  if (loading || isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-accent border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">אזור אישי לקונים</h1>
          <p className="text-slate-500 mb-8">התחבר כדי לצפות בנכסים ששמרת ובסטטוס הפניות שלך</p>
          
          <div className="space-y-4">
            {loginError && <p className="text-red-500 text-sm font-bold">{loginError}</p>}
            
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 px-6 rounded-xl font-bold shadow-sm transition-all disabled:opacity-70 flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              {isLoggingIn ? 'מתחבר...' : 'התחבר עם Google'}
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <a href="/" className="text-slate-400 hover:text-brand-accent text-sm font-medium transition-colors">חזרה לדף הבית</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             {agentProfile?.photoURL && (
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden border border-slate-100 shadow-sm">
                  <Image 
                    src={agentProfile.photoURL} 
                    alt="Agency Logo" 
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
             )}
             <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                  {getGreeting()}, {clientName}
                </h1>
                {agentProfile?.displayName && (
                  <p className="text-xs text-slate-500">לקוח של {agentProfile.displayName}</p>
                )}
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-bold bg-red-50 px-4 py-2 rounded-lg transition-colors">
              יציאה
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {leads.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
              <p className="text-xl text-slate-400 font-medium">עדיין לא הבעת עניין בנכסים.</p>
              <div className="text-xs text-slate-300 mt-4 p-4 bg-slate-50 rounded-xl inline-block text-left" dir="ltr">
                <p><strong>Debug Info:</strong></p>
                <p>User Email: {user?.email}</p>
                <p>Search Email: {user?.email?.toLowerCase()}</p>
                <p>User UID: {user?.uid}</p>
              </div>
              {fetchError && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold" dir="ltr">
                  Error: {fetchError}
                </div>
              )}
            </div>
          ) : (
            leads.map((lead) => {
              const details = lead.propertyDetails;
              const formattedPrice = details?.price ? details.price.replace(/[^\d,]/g, '') : '';
              
              return (
              <div key={lead.id} className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex-1">
                      {details?.address ? (
                        <div className="mb-4">
                          <h2 className="text-2xl font-black text-slate-900 leading-tight mb-1">
                            {details.address}
                          </h2>
                          <p className="text-lg font-bold text-slate-500">
                            {details.generatedTitle || lead.propertyTitle}
                          </p>
                        </div>
                      ) : (
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">{lead.propertyTitle || 'נכס ללא כותרת'}</h2>
                      )}
                      <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">פנייה בתאריך</span>
                        <span>{new Date(lead.createdAt).toLocaleDateString('he-IL')}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                      {formattedPrice && (
                        <div className="text-3xl font-black text-brand-accent bg-brand-accent/5 px-4 py-2 rounded-2xl border border-brand-accent/10">
                          {formattedPrice} ₪
                        </div>
                      )}
                      <a 
                        href={`/${lead.propertyId}`} 
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all text-center"
                      >
                        צפה בפרטים המלאים
                      </a>
                    </div>
                  </div>
                  
                  {details?.features && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      {details.features.rooms && (
                        <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 items-center text-center">
                          <Bed className="w-6 h-6 text-brand-accent mb-1" />
                          <span className="text-xs text-slate-400 font-medium">חדרים</span>
                          <span className="font-black text-slate-800">{details.features.rooms}</span>
                        </div>
                      )}
                      {details.features.apartmentArea && (
                        <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 items-center text-center">
                          <Square className="w-6 h-6 text-brand-accent mb-1" />
                          <span className="text-xs text-slate-400 font-medium">מ&quot;ר</span>
                          <span className="font-black text-slate-800">{details.features.apartmentArea}</span>
                        </div>
                      )}
                      {details.features.floor && (
                        <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 items-center text-center">
                          <Layers className="w-6 h-6 text-brand-accent mb-1" />
                          <span className="text-xs text-slate-400 font-medium">קומה</span>
                          <span className="font-black text-slate-800">{details.features.floor}</span>
                        </div>
                      )}
                      {details.features.parking && (
                        <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 items-center text-center">
                          <Car className="w-6 h-6 text-brand-accent mb-1" />
                          <span className="text-xs text-slate-400 font-medium">חניה</span>
                          <span className="font-black text-slate-800">{details.features.parking}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-sm text-slate-600 font-medium mb-2">סטטוס הפנייה:</p>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="font-bold text-slate-800">הפרטים התקבלו אצל הסוכן</span>
                    </div>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>
      </main>
    </div>
  );
}
