
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
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
      setError("חיבור למסד הנתונים לא זמין");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // שליפת כל האוספים במקביל לשיפור ביצועים
      const [uSnap, pSnap, lSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'landingPages')),
        getDocs(collection(db, 'leads'))
      ]);
      
      const users = uSnap.docs.map(d => ({ ...(d.data() as any), uid: d.id } as UserProfile));
      const props = pSnap.docs.map(d => ({ ...(d.data() as any), id: d.id } as PropertyDetails));
      const leads = lSnap.docs.map(d => ({ ...(d.data() as any), id: d.id } as Lead));
      
      setData({ users, props, leads });
    } catch (err: any) {
      console.error("Admin load error:", err);
      setError("שגיאה בטעינת נתוני המערכת. וודא שיש לך הרשאות מנהל.");
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
      <p className="text-slate-400 font-bold animate-pulse">מרכז נתונים בטעינה...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 px-4" dir="rtl">
      <div className="bg-red-500/10 text-red-500 p-6 rounded-2xl border border-red-500/20 max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-2">אופס! תקלה</h2>
        <p>{error}</p>
        <button onClick={loadData} className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg font-bold">נסה שוב</button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
        <div>
            <h1 className="text-3xl font-black text-white">ניהול מערכת</h1>
            <p className="text-slate-400 mt-1">מבט על של הפעילות ב-Mango Realty</p>
        </div>
        <button onClick={loadData} className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl transition-all border border-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>
      
      {/* לוח סטטיסטיקות ראשי */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-800/50 p-8 rounded-3xl border border-blue-500/30 shadow-xl backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <p className="text-blue-400 text-xs uppercase font-black tracking-widest mb-2">סוכנים רשומים</p>
          <p className="text-6xl font-black text-white">{data.users.length}</p>
        </div>
        
        <div className="bg-slate-800/50 p-8 rounded-3xl border border-amber-500/30 shadow-xl backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <p className="text-amber-500 text-xs uppercase font-black tracking-widest mb-2">דפי נחיתה פעילים</p>
          <p className="text-6xl font-black text-white">{data.props.length}</p>
        </div>
        
        <div className="bg-slate-800/50 p-8 rounded-3xl border border-green-500/30 shadow-xl backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
          <p className="text-green-400 text-xs uppercase font-black tracking-widest mb-2">סה"כ לידים במערכת</p>
          <p className="text-6xl font-black text-white">{data.leads.length}</p>
        </div>
      </div>

      {/* טבלת סוכנים מפורטת */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-6 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">פירוט פעילות סוכנים</h3>
            <span className="text-xs text-slate-500">מעודכן לזמן אמת</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="text-slate-500 text-xs bg-slate-900/30 uppercase tracking-tighter">
              <tr>
                <th className="p-5">פרטי סוכן</th>
                <th className="p-5 text-center">נכסים שנוצרו</th>
                <th className="p-5 text-center">לידים שנאספו</th>
                <th className="p-5">תאריך הצטרפות</th>
                <th className="p-5">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {data.users.length === 0 ? (
                <tr>
                    <td colSpan={5} className="p-20 text-center text-slate-500">אין סוכנים רשומים במערכת עדיין</td>
                </tr>
              ) : (
                data.users.map(u => {
                  const uProps = data.props.filter(p => p.userId === u.uid);
                  const uLeads = data.leads.filter(l => l.ownerId === u.uid);
                  return (
                    <tr key={u.uid} className="hover:bg-white/5 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                            {u.photoURL ? (
                                <img src={u.photoURL} alt="" className="w-10 h-10 rounded-xl border border-slate-600 object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-white border border-slate-600">
                                    {u.displayName?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div>
                                <div className="text-white font-black group-hover:text-brand-accent transition-colors">{u.displayName || 'סוכן ללא שם'}</div>
                                <div className="text-[11px] text-slate-500 font-medium">{u.email}</div>
                            </div>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className="bg-slate-700/50 text-white px-3 py-1 rounded-full text-xs font-bold border border-slate-600">
                            {uProps.length}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                            {uLeads.length}
                        </span>
                      </td>
                      <td className="p-5 text-slate-400 text-xs font-medium">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('he-IL') : '-'}
                      </td>
                      <td className="p-5">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                            {u.role === 'admin' ? 'מנהל' : 'סוכן'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
