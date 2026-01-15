
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
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-20 text-center">טוען נתונים למנהל...</div>;

  return (
    <div className="container mx-auto p-8" dir="rtl">
      <h1 className="text-3xl font-black mb-10">ניהול מערכת</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-800 p-6 rounded-2xl border border-blue-500/30">
          <p className="text-slate-400 text-xs uppercase font-bold">סוכנים</p>
          <p className="text-4xl font-black">{data.users.length}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-amber-500/30">
          <p className="text-slate-400 text-xs uppercase font-bold">נכסים</p>
          <p className="text-4xl font-black">{data.props.length}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-green-500/30">
          <p className="text-slate-400 text-xs uppercase font-bold">לידים</p>
          <p className="text-4xl font-black">{data.leads.length}</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
        <h3 className="p-4 bg-slate-900/50 font-bold border-b border-slate-700">סוכנים פעילים</h3>
        <table className="w-full text-right">
          <thead className="text-slate-500 text-xs">
            <tr><th className="p-4">שם</th><th className="p-4">אימייל</th><th className="p-4">נכסים</th></tr>
          </thead>
          <tbody>
            {data.users.map(u => (
              <tr key={u.uid} className="border-b border-slate-700/50">
                <td className="p-4 text-white font-bold">{u.displayName || 'סוכן ללא שם'}</td>
                <td className="p-4 text-slate-400">{u.email}</td>
                <td className="p-4">{data.props.filter(p => p.userId === u.uid).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
