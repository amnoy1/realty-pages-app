
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import type { PropertyDetails, UserProfile, Lead } from '../types';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<{ 
    users: UserProfile[], 
    props: PropertyDetails[], 
    leads: Lead[] 
  }>({ users: [], props: [], leads: [] });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<UserProfile | null>(null);

  const loadData = async () => {
    if (!db) {
      setError("חיבור ל-Firebase לא הוגדר כראוי.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchCollection = async (name: string) => {
        const snap = await getDocs(collection(db!, name));
        return snap.docs.map(d => ({ ...(d.data() as any), id: d.id, uid: d.id }));
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

    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת הנתונים.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteProp = async (id: string) => {
    if (!db || !window.confirm('האם אתה בטוח שברצונך למחוק נכס זה מהמערכת?')) return;
    try {
      await deleteDoc(doc(db, 'landingPages', id));
      setData(prev => ({ ...prev, props: prev.props.filter(p => p.id !== id) }));
    } catch (e) {
      alert("שגיאה במחיקה");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32" dir="rtl">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-accent border-t-transparent mb-4"></div>
      <p className="text-slate-400 font-bold">טוען נתוני מערכת...</p>
    </div>
  );

  if (selectedAgent) {
    const agentProps = data.props.filter(p => p.userId === selectedAgent.uid);
    const agentLeads = data.leads.filter(l => l.ownerId === selectedAgent.uid);

    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
        <button 
          onClick={() => setSelectedAgent(null)}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          חזרה לדשבורד ראשי
        </button>

        <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-brand-accent flex items-center justify-center text-white text-3xl font-black shadow-xl overflow-hidden">
              {selectedAgent.photoURL ? <img src={selectedAgent.photoURL} className="w-full h-full object-cover" /> : selectedAgent.displayName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">{selectedAgent.displayName}</h2>
              <p className="text-slate-400">{selectedAgent.email}</p>
              <div className="flex gap-3 mt-2">
                <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-blue-500/20">סוכן פעיל</span>
                <span className="text-slate-500 text-[10px] font-medium">הצטרף ב-{selectedAgent.createdAt ? new Date(selectedAgent.createdAt).toLocaleDateString('he-IL') : '-'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="text-center bg-slate-900/50 p-4 rounded-2xl border border-slate-700 min-w-[100px]">
                <p className="text-xs text-slate-500 mb-1">נכסים</p>
                <p className="text-2xl font-black text-white">{agentProps.length}</p>
             </div>
             <div className="text-center bg-slate-900/50 p-4 rounded-2xl border border-slate-700 min-w-[100px]">
                <p className="text-xs text-slate-500 mb-1">לידים</p>
                <p className="text-2xl font-black text-green-400">{agentLeads.length}</p>
             </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-6">נכסים של {selectedAgent.displayName}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentProps.length === 0 ? (
            <div className="col-span-full py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700 text-center">
              <p className="text-slate-500">לסוכן זה אין עדיין נכסים במערכת</p>
            </div>
          ) : (
            agentProps.map(prop => (
              <div key={prop.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden group shadow-lg">
                <div className="h-40 bg-slate-900 relative">
                  <img src={prop.images[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-4">
                  <h4 className="text-white font-bold truncate">{prop.generatedTitle}</h4>
                  <p className="text-slate-400 text-xs truncate mb-4">{prop.address}</p>
                  <div className="flex gap-2">
                    <a href={`/${prop.slug}-${prop.id}`} target="_blank" className="flex-1 bg-slate-700 hover:bg-brand-accent text-white text-center py-2 rounded-lg text-xs font-bold transition-colors">צפה באתר</a>
                    <button onClick={() => handleDeleteProp(prop.id!)} className="p-2 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
        <div>
            <h1 className="text-3xl font-black text-white">דשבורד מנהל</h1>
            <p className="text-slate-400 mt-1">ניהול כלל הסוכנים והפעילות במערכת</p>
        </div>
        <button onClick={loadData} className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl transition-all border border-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="סוכנים" value={data.users.length} color="blue" />
        <StatCard title="נכסים" value={data.props.length} color="amber" />
        <StatCard title="לידים" value={data.leads.length} color="green" />
      </div>

      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-6 bg-slate-900/50 border-b border-slate-700">
            <h3 className="font-bold text-lg text-white">רשימת סוכנים</h3>
            <p className="text-slate-500 text-xs">לחץ על סוכן כדי לצפות בנכסים שלו</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="text-slate-500 text-[10px] bg-slate-900/30 uppercase font-black">
              <tr>
                <th className="p-5">סוכן</th>
                <th className="p-5 text-center">נכסים</th>
                <th className="p-5 text-center">לידים</th>
                <th className="p-5">מייל</th>
                <th className="p-5">פעולה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {data.users.map(u => {
                const uPropsCount = data.props.filter(p => p.userId === u.uid).length;
                const uLeadsCount = data.leads.filter(l => l.ownerId === u.uid).length;
                return (
                  <tr 
                    key={u.uid} 
                    onClick={() => setSelectedAgent(u)}
                    className="hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-white border border-slate-600 group-hover:border-brand-accent transition-colors">
                            {u.photoURL ? <img src={u.photoURL} className="w-full h-full rounded-xl object-cover" /> : (u.displayName?.charAt(0) || 'U')}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-brand-accent">{u.displayName || 'סוכן ללא שם'}</div>
                          <div className="text-[10px] text-slate-500">הצטרף {u.createdAt ? new Date(u.createdAt).toLocaleDateString('he-IL') : '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center"><span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-black">{uPropsCount}</span></td>
                    <td className="p-5 text-center"><span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-black">{uLeadsCount}</span></td>
                    <td className="p-5 text-slate-400 text-sm">{u.email}</td>
                    <td className="p-5">
                      <button className="text-brand-accent text-xs font-bold hover:underline">צפה בנכסים ←</button>
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
