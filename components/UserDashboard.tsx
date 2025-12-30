import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import type { PropertyDetails } from '../types';

interface UserDashboardProps {
    userId: string;
    userEmail?: string | null;
    onCreateNew: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ userId, userEmail, onCreateNew }) => {
  const [myProperties, setMyProperties] = useState<PropertyDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<{
    uidCount: number;
    emailCount: number;
    totalInCollection: number | string;
  }>({ uidCount: 0, emailCount: 0, totalInCollection: 'Checking...' });

  const fetchMyProperties = async () => {
    if (!db) {
        setError("מסד הנתונים לא מחובר.");
        setLoading(false);
        return;
    }
    
    setLoading(true);
    setError(null);
    console.log("--- Dashboard Fetch Diagnostic ---");
    console.log("Current Auth UID:", userId);
    console.log("Current Auth Email:", userEmail);

    try {
      // 1. Primary Query: Search by userId
      const uidQuery = query(
          collection(db, 'landingPages'), 
          where('userId', '==', userId)
      );
      const uidSnapshot = await getDocs(uidQuery);
      const uidResults = uidSnapshot.docs.map(doc => ({ ...doc.data() as any, id: doc.id } as PropertyDetails));
      
      // 2. Fallback Query: Search by userEmail (in case UID mismatched during save)
      let emailResults: PropertyDetails[] = [];
      if (userEmail) {
          const emailQuery = query(
              collection(db, 'landingPages'), 
              where('userEmail', '==', userEmail)
          );
          const emailSnapshot = await getDocs(emailQuery);
          emailResults = emailSnapshot.docs.map(doc => ({ ...doc.data() as any, id: doc.id } as PropertyDetails));
      }

      // 3. Global Count (Quick check to see if collection is readable at all)
      let totalCount: number | string = 'Unknown';
      try {
          const globalSnapshot = await getDocs(query(collection(db, 'landingPages'), limit(1)));
          totalCount = globalSnapshot.empty ? 0 : '1+';
      } catch (e) {
          totalCount = 'Permission Denied';
      }

      setDiagnostics({
          uidCount: uidResults.length,
          emailCount: emailResults.length,
          totalInCollection: totalCount
      });

      // Merge results, removing duplicates by ID
      const mergedMap = new Map<string, PropertyDetails>();
      uidResults.forEach(p => p.id && mergedMap.set(p.id, p));
      emailResults.forEach(p => p.id && mergedMap.set(p.id, p));
      
      const finalResults = Array.from(mergedMap.values());
      finalResults.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      setMyProperties(finalResults);
      
      if (finalResults.length === 0 && totalCount !== 0) {
          console.warn("User has 0 docs but collection is not empty. Possible UID/Email mismatch.");
      }

    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError(`שגיאה בתקשורת עם Firebase: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchMyProperties();
  }, [userId, userEmail]);

  const copyToClipboard = (slug: string, id: string) => {
    // URL structure now directly after domain
    const url = `${window.location.origin}/${slug}-${id}`;
    navigator.clipboard.writeText(url);
    alert('הקישור הועתק ללוח');
  };

  if (loading) return (
    <div className="text-white text-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto"></div>
      <p className="mt-4 animate-pulse">מחפש את הנכסים שלך במסד הנתונים...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-700 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">הנכסים שלי</h1>
            <p className="text-slate-400 text-sm mt-1">ניהול והפצה של דפי הנחיתה שיצרת</p>
          </div>
          <div className="flex gap-3">
              <button 
                onClick={fetchMyProperties}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl border border-slate-700 transition-all group"
                title="רענן רשימה"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-active:rotate-180 transition-transform duration-500"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
              </button>
              <button onClick={onCreateNew} className="bg-brand-accent hover:bg-brand-accentHover text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all border border-white/10">
                  + צור דף חדש
              </button>
          </div>
      </div>

      {error && (
          <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl mb-6 text-red-200 text-sm flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <p>{error}</p>
          </div>
      )}

      {/* Diagnostic Info Box - Visible only when empty or for debugging */}
      {myProperties.length === 0 && (
          <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl mb-8 text-blue-200 text-xs font-mono">
              <p className="font-bold mb-2 uppercase border-b border-blue-500/20 pb-1">אבחון מערכת (Diagnostics):</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                  <span>UID: <span className="text-white">{userId.substring(0, 8)}...</span></span>
                  <span>Email: <span className="text-white">{userEmail}</span></span>
                  <span>Docs by UID: <span className={diagnostics.uidCount > 0 ? "text-green-400" : "text-yellow-500"}>{diagnostics.uidCount}</span></span>
                  <span>Docs by Email: <span className={diagnostics.emailCount > 0 ? "text-green-400" : "text-yellow-500"}>{diagnostics.emailCount}</span></span>
                  <span>Global Collection Status: <span className="text-white">{diagnostics.totalInCollection}</span></span>
              </div>
          </div>
      )}

      {myProperties.length === 0 ? (
          <div className="text-center py-24 bg-slate-800/30 rounded-3xl border border-slate-700 border-dashed">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-2">לא נמצאו נכסים תחת חשבון זה</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                  אם יצרת נכסים בעבר והם לא מופיעים, וודא שאתה מחובר עם אותו חשבון Google. 
                  <br/>ניתן גם לנסות לרענן את העמוד.
              </p>
              <button onClick={onCreateNew} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-bold transition-all border border-white/5">
                  צור את הנכס הראשון שלך
              </button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProperties.map((prop) => (
                  <div key={prop.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-brand-accent/50 transition-all group flex flex-col h-full shadow-xl">
                      <div className="h-52 overflow-hidden relative shrink-0">
                          {prop.images && prop.images[0] ? (
                              <img src={prop.images[0]} alt={prop.generatedTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                              <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500">אין תמונה</div>
                          )}
                          <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md border border-white/10 uppercase tracking-wider">
                              {prop.features?.rooms ? `${prop.features.rooms} חדרים` : 'נכס למכירה'}
                          </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 leading-tight group-hover:text-brand-accent transition-colors">{prop.generatedTitle}</h3>
                          <div className="flex items-center gap-2 text-slate-400 text-xs mb-6">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                              <span className="truncate">{prop.address}</span>
                          </div>
                          
                          <div className="mt-auto flex gap-2">
                              <a 
                                href={`/${prop.slug}-${prop.id}`} 
                                target="_blank"
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-center py-2.5 rounded-xl text-sm font-bold transition-all border border-slate-600"
                              >
                                  צפה בדף
                              </a>
                              <button 
                                onClick={() => copyToClipboard(prop.slug || '', prop.id || '')}
                                className="bg-slate-700 hover:bg-brand-accent text-white p-2.5 rounded-xl transition-all border border-slate-600"
                                title="העתק קישור"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};