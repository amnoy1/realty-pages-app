'use client';

import React, { useEffect, useState } from 'react';
import { db, auth, onAuthStateChanged, signOut, sendSignInLinkToEmail } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import type { Lead } from '../../types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface BuyerLead extends Lead {
  propertyDetails?: any; // We'll fetch property details too
}

export default function BuyerPortal() {
  const [user, setUser] = useState<any>(null);
  const [leads, setLeads] = useState<BuyerLead[]>([]);
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [fetchError, setFetchError] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchLeads(currentUser.email?.toLowerCase() || null);
      } else {
        // Not logged in
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchLeads = async (email: string | null) => {
    if (!db || !user) return;
    setFetchError('');
    
    try {
      const queries = [];
      const constraints = [];
      
      // Strategy 1: Query by Email (normalized)
      if (email) {
        queries.push(getDocs(query(collection(db, 'leads'), where('email', '==', email))));
      }
      
      // Strategy 2: Query by UID (if available)
      if (user.uid) {
        queries.push(getDocs(query(collection(db, 'leads'), where('uid', '==', user.uid))));
      }

      console.log(`Fetching leads for Email: ${email}, UID: ${user.uid}`);

      const results = await Promise.all(queries);
      const allDocs = results.flatMap(r => r.docs);
      
      // Deduplicate by ID
      const uniqueDocs = new Map();
      allDocs.forEach(d => uniqueDocs.set(d.id, { id: d.id, ...d.data() }));
      const leadsData = Array.from(uniqueDocs.values()) as BuyerLead[];
      
      // Sort by createdAt desc
      leadsData.sort((a, b) => b.createdAt - a.createdAt);

      setLeads(leadsData);

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

  const handleSendLoginLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    
    const normalizedEmail = loginEmail.toLowerCase().trim();
    
    setIsSendingLink(true);
    setLoginError('');

    try {
      if (auth) {
        const actionCodeSettings = {
          url: `${window.location.origin}/finish-sign-up`,
          handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', normalizedEmail);
        setLinkSent(true);
      }
    } catch (err: any) {
      console.error("Error sending login link:", err);
      setLoginError('שגיאה בשליחת הקישור: ' + (err.message || 'נסה שנית מאוחר יותר'));
    } finally {
      setIsSendingLink(false);
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
          
          {linkSent ? (
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl">✓</div>
              <h3 className="font-bold text-green-800 text-lg mb-2">הקישור נשלח בהצלחה!</h3>
              <p className="text-green-700 text-sm">בדוק את תיבת המייל שלך ({loginEmail}) ולחץ על הקישור כדי להיכנס.</p>
              <button 
                onClick={() => setLinkSent(false)} 
                className="mt-4 text-sm text-green-600 font-bold hover:underline"
              >
                לא קיבלת? נסה שוב
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendLoginLink} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1 text-right">כתובת אימייל</label>
                <input
                  type="email"
                  id="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-accent outline-none transition-all text-right"
                  placeholder="name@example.com"
                  required
                />
              </div>
              
              {loginError && <p className="text-red-500 text-sm font-bold">{loginError}</p>}
              
              <button
                type="submit"
                disabled={isSendingLink}
                className="w-full bg-brand-accent hover:bg-brand-accentHover text-white py-3 px-6 rounded-xl font-bold shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSendingLink ? 'שולח...' : 'שלח לי קישור כניסה'}
              </button>
            </form>
          )}
          
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
            leads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">{lead.propertyTitle || 'נכס ללא כותרת'}</h2>
                      <p className="text-slate-500 text-sm">פנית בתאריך: {new Date(lead.createdAt).toLocaleDateString('he-IL')}</p>
                    </div>
                    <a 
                      href={`/${lead.propertyId}`} 
                      className="bg-brand-accent hover:bg-brand-accentHover text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all text-sm whitespace-nowrap"
                    >
                      צפה בנכס
                    </a>
                  </div>
                  
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-sm text-slate-600 font-medium mb-2">סטטוס הפנייה:</p>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="font-bold text-slate-800">הפרטים התקבלו אצל הסוכן</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
