
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { PropertyDetails, UserProfile, Lead } from '../types';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<{ users: UserProfile[], props: PropertyDetails[], leads: Lead[] }>({ users: [], props: [], leads: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!db) return;
      try {
        const [uSnap, pSnap, lSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'landingPages')),
          getDocs(collection(db, 'leads'))
        ]);
        
        setData({
          users: uSnap.docs.map(d => ({ ...(d.data() as object), uid: d.id } as UserProfile)),
          props: pSnap.docs.map(d => ({ ...(d.data() as object), id: d.id } as PropertyDetails)),
          leads: lSnap.docs.map(d => ({ ...(d.data() as object), id: d.id } as Lead))
        });
      } catch (err) {
        console.error("Admin load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold">טוען נתוני מערכת...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="mb-10 border-b border-slate-700 pb-6">
        <h1 className="text-4xl font-black text-white">דשבורד מנהל</h1>
        <p className="text-slate-400 mt-2">סקירה כללית של כלל הפעילות במערכת</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-slate-800/80 p-8 rounded-[2rem] border border-blue-500/20 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <p className="text-slate-400 text-xs uppercase font-black tracking-widest mb-2">סוכנים רשומים</p>
          <p className="text-5xl font-black text-white">{data.users.length}</p>
        </div>
        
        <div className="bg-slate-800/80 p-8 rounded-[2rem] border border-amber-500/20 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <p className="text-slate-400 text-xs uppercase font-black tracking-widest mb-2">נכסים שפורסמו</p>
          <p className="text-5xl font-black text-white">{data.props.length}</p>
        </div>
        
        <div className="bg-slate-800/80 p-8 rounded-[2rem] border border-green-500/20 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
          <p className="text-slate-400 text-xs uppercase font-black tracking-widest mb-2">סה"כ לידים</p>
          <p className="text-5xl font-black text-white">{data.leads.length}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
        <div className="p-6 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-black text-xl text-white">רשימת סוכנים</h3>
            <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full font-bold">מעודכן להיום</span>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="text-slate-500 text-[10px] uppercase tracking-tighter bg-slate-900/30">
                <tr>
                    <th className="p-5 font-black">שם הסוכן</th>
                    <th className="p-5 font-black">אימייל</th>
                    <th className="p-5 font-black text-center">נכסים</th>
                    <th className="p-5 font-black text-center">לידים</th>
                    <th className="p-5 font-black">פעילות אחרונה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {data.users.map(u => {
                  const agentProps = data.props.filter(p => p.userId === u.uid);
                  const agentLeadsCount = data.leads.filter(l => l.ownerId === u.uid).length;
                  return (
                    <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                      <td className="p-5 flex items-center gap-3">
                          {u.photoURL ? (
                              <img src={u.photoURL} className="w-8 h-8 rounded-full border border-slate-600" alt="" />
                          ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">{u.displayName?.charAt(0)}</div>
                          )}
                          <span className="text-white font-bold">{u.displayName || 'סוכן ללא שם'}</span>
                      </td>
                      <td className="p-5 text-slate-400 text-sm">{u.email}</td>
                      <td className="p-5 text-center">
                          <span className="bg-slate-700/50 px-3 py-1 rounded-lg text-white font-bold text-sm">{agentProps.length}</span>
                      </td>
                      <td className="p-5 text-center">
                          <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg font-bold text-sm">{agentLeadsCount}</span>
                      </td>
                      <td className="p-5 text-slate-500 text-xs">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('he-IL') : 'לא ידוע'}
                      </td>
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
