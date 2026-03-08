'use client';

import React, { useEffect, useState } from 'react';
import { db, auth, onAuthStateChanged, signOut } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import type { Lead } from '../../types';
import { useRouter } from 'next/navigation';

interface BuyerLead extends Lead {
  propertyDetails?: any; // We'll fetch property details too
}

export default function BuyerPortal() {
  const [user, setUser] = useState<any>(null);
  const [leads, setLeads] = useState<BuyerLead[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchLeads(currentUser.email);
      } else {
        // Not logged in
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchLeads = async (email: string | null) => {
    if (!db || !email) return;
    try {
      // Query leads by email
      const q = query(
        collection(db, 'leads'), 
        where('email', '==', email)
        // Note: orderBy requires an index if used with where. 
        // We'll sort in memory to avoid index requirement for now if possible, 
        // or just try to use it if the index exists. 
        // Given we just created the collection, index might not exist.
        // Let's fetch then sort.
      );
      
      const querySnapshot = await getDocs(q);
      const leadsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuyerLead));
      
      // Sort by createdAt desc
      leadsData.sort((a, b) => b.createdAt - a.createdAt);

      setLeads(leadsData);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-accent border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center" dir="rtl">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">אזור אישי לקונים</h1>
        <p className="text-slate-600 mb-8">אנא התחבר באמצעות הקישור שנשלח אליך למייל.</p>
        <p className="text-sm text-slate-400">אם הגעת לכאן בטעות, חזור לדף הבית.</p>
        <a href="/" className="mt-4 text-brand-accent font-bold hover:underline">חזרה לדף הבית</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">הנכסים שלי</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:inline">{user.email}</span>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-bold">יציאה</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {leads.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
              <p className="text-xl text-slate-400 font-medium">עדיין לא הבעת עניין בנכסים.</p>
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
