
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { PropertyDetails, UserProfile, Lead } from '../types';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<{ users: UserProfile[], props: PropertyDetails[], leads: Lead[] }>({ users: [], props: [], leads: [] });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!db) return;
    setLoading(true);
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

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
      <p className="text-slate-400 font-bold">טוען נתוני מערכת...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <h1 className="text-3xl font-black text-white mb-10 border-b border-slate-700 pb-4">דשבורד מנהל</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-800 p-8 rounded-3xl border border-blue-500/20 shadow-xl">
          <p className="text-slate-400 text-xs uppercase font-black tracking-widest mb-2">סוכנים</p>
          <p className="text-5xl font-black text-white">{data.users.length}</p>
        </div>
        <div className="bg-slate-800 p-8 rounded-3xl border border-amber-500/20 shadow-xl">
          <p className="text-slate-400 text-xs uppercase font-black tracking-widest mb-2">נכסים</p>
          <p className="text-5xl font-black text-white">{data.props.length}</p>
        </div>
        <div className="bg-slate-800 p-8 rounded-3xl border border-green-500/20 shadow-xl">
          <p className="text-slate-400 text-xs uppercase font-black tracking-widest mb-2">לידים</p>
          <p className="text-5xl font-black text-white">{data.leads.length}</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
        <div className="p-5 bg-slate-900/50 border-b border-slate-700 font-bold">רשימת סוכנים ופעילות</div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="text-slate-500 text-xs bg-slate-900/30">
              <tr>
                <th className="p-4">סוכן</th>
                <th className="p-4 text-center">נכסים</th>
                <th className="p-4 text-center">לידים</th>
                <th className="p-4">פעילות אחרונה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data.users.map(u => {
                const uProps = data.props.filter(p => p.userId === u.uid);
                const uLeads = data.leads.filter(l => l.ownerId === u.uid);
                return (
                  <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">{u.displayName?.charAt(0) || 'U'}</div>
                      <div>
                        <div className="text-white font-bold">{u.displayName || 'סוכן ללא שם'}</div>
                        <div className="text-[10px] text-slate-500">{u.email}</div>
                      </div>
                    </td>
                    <td className="p-4 text-center"><span className="bg-slate-700 px-2 py-1 rounded text-xs">{uProps.length}</span></td>
                    <td className="p-4 text-center"><span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs">{uLeads.length}</span></td>
                    <td className="p-4 text-slate-500 text-xs">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('he-IL') : '-'}</td>
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
