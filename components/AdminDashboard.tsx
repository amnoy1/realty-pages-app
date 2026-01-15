
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { PropertyDetails, UserProfile, Lead } from '../types';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<{ 
    users: UserProfile[], 
    props: PropertyDetails[], 
    leads: Lead[] 
  }>({ users: [], props: [], leads: [] });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!db) {
      setError("חיבור ל-Firebase לא הוגדר כראוי ב-Environment Variables.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("[Admin] Starting to fetch system data...");
      
      // שליפת נתונים עם טיפול בשגיאות פרטני לכל אוסף
      const fetchCollection = async (name: string) => {
        try {
          const snap = await getDocs(collection(db!, name));
          return snap.docs.map(d => ({ ...(d.data() as any), id: d.id, uid: d.id }));
        } catch (e: any) {
          console.error(`[Admin] Error fetching ${name}:`, e);
          throw new Error(`אין גישה לאוסף ${name}. וודא שהגדרת Rules ב-Firebase.`);
        }
      };

      const [users, props, leads] = await Promise.all([
        fetchCollection('users'),
        fetchCollection('landingPages'),
        fetchCollection('leads')
      ]);
      
      setData({ 
        users: users as UserProfile[], 
        props: props as PropertyDetails[], 
        leads: leads as Lead[] 
      });
      
      console.log("[Admin] Data loaded successfully:", { 
        users: users.length, 
        props: props.length, 
        leads: leads.length 
      });

    } catch (err: any) {
      setError(err.message || "שגיאה לא ידועה בטעינת הנתונים.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32" dir="rtl">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-accent border-t-transparent mb-4"></div>
      <p className="text-slate-400 font-bold animate-pulse">מתחבר לבסיס הנתונים...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 px-4" dir="rtl">
      <div className="bg-red-500/10 text-red-500 p-8 rounded-3xl border border-red-500/20 max-w-2xl mx-auto shadow-2xl">
        <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
        <h2 className="text-2xl font-bold mb-4">שגיאת הרשאות או נתונים</h2>
        <p className="text-lg mb-6 opacity-90">{error}</p>
        <div className="bg-black/20 p-4 rounded-xl text-right text-xs font-mono mb-6 overflow-x-auto">
          <p className="text-amber-400 mb-2 font-bold">// פתרון אפשרי: העתק את החוקים הבאים ל-Firestore Rules</p>
          <pre className="text-slate-300">
{`service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
          </pre>
        </div>
        <button onClick={loadData} className="bg-white text-red-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all">נסה שוב</button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
        <div>
            <h1 className="text-3xl font-black text-white">דשבורד ניהול מערכת</h1>
            <p className="text-slate-400 mt-1">ריכוז נתונים מכלל הסוכנים והנכסים</p>
        </div>
        <button onClick={loadData} className="bg-brand-accent hover:bg-brand-accentHover text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            רענן נתונים
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="סוכנים במערכת" value={data.users.length} color="blue" />
        <StatCard title="דפי נחיתה" value={data.props.length} color="amber" />
        <StatCard title="לידים שנאספו" value={data.leads.length} color="green" />
      </div>

      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-6 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">פעילות סוכנים</h3>
            <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1 text-blue-400"><div className="w-2 h-2 rounded-full bg-blue-400"></div> סוכנים</span>
                <span className="flex items-center gap-1 text-amber-400"><div className="w-2 h-2 rounded-full bg-amber-400"></div> נכסים</span>
                <span className="flex items-center gap-1 text-green-400"><div className="w-2 h-2 rounded-full bg-green-400"></div> לידים</span>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="text-slate-500 text-[10px] bg-slate-900/30 uppercase font-black">
              <tr>
                <th className="p-5">סוכן</th>
                <th className="p-5 text-center">נכסים</th>
                <th className="p-5 text-center">לידים</th>
                <th className="p-5">מייל</th>
                <th className="p-5">הצטרפות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {data.users.map(u => {
                const uProps = data.props.filter(p => p.userId === u.uid);
                const uLeads = data.leads.filter(l => l.ownerId === u.uid);
                return (
                  <tr key={u.uid} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white border border-slate-600 group-hover:border-brand-accent transition-colors">
                            {u.photoURL ? <img src={u.photoURL} className="w-full h-full rounded-full object-cover" /> : (u.displayName?.charAt(0) || 'U')}
                        </div>
                        <div className="font-bold text-white">{u.displayName || 'סוכן ללא שם'}</div>
                      </div>
                    </td>
                    <td className="p-5 text-center"><span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-black">{uProps.length}</span></td>
                    <td className="p-5 text-center"><span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-black">{uLeads.length}</span></td>
                    <td className="p-5 text-slate-400 text-sm">{u.email}</td>
                    <td className="p-5 text-slate-500 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('he-IL') : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }: { title: string, value: number, color: 'blue' | 'amber' | 'green' }) => {
    const colors = {
        blue: "border-blue-500/30 text-blue-400 bg-blue-500/5",
        amber: "border-amber-500/30 text-amber-500 bg-amber-500/5",
        green: "border-green-500/30 text-green-400 bg-green-500/5"
    };
    return (
        <div className={`p-8 rounded-3xl border shadow-xl relative overflow-hidden ${colors[color]}`}>
            <p className="text-xs uppercase font-black tracking-widest mb-2 opacity-80">{title}</p>
            <p className="text-6xl font-black text-white">{value}</p>
        </div>
    );
}
