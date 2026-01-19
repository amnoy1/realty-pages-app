
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
  const [showLeadsFor, setShowLeadsFor] = useState<UserProfile | null>(null);
  const [propertyFilterId, setPropertyFilterId] = useState<string | null>(null);

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

  const getPropertyAddress = (id: string) => {
    const p = data.props.find(item => item.id === id);
    return p ? p.address : 'כתובת לא ידועה';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32" dir="rtl">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-accent border-t-transparent mb-4"></div>
      <p className="text-slate-400 font-bold">טוען נתוני מערכת...</p>
    </div>
  );

  // תצוגת טבלת לידים עבור סוכן ספציפי (תומכת בסינון לפי נכס)
  if (showLeadsFor) {
    let agentLeads = data.leads.filter(l => l.ownerId === showLeadsFor.uid);
    if (propertyFilterId) {
      agentLeads = agentLeads.filter(l => l.propertyId === propertyFilterId);
    }

    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
        <button 
          onClick={() => { setShowLeadsFor(null); setPropertyFilterId(null); setSelectedAgent(null); }} 
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          חזרה לרשימת הסוכנים
        </button>
        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="p-6 bg-slate-900/50 border-b border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-xl text-white">לידים עבור: {showLeadsFor.displayName}</h3>
              {propertyFilterId && (
                <p className="text-brand-accent text-sm mt-1 font-bold">מסונן לפי נכס: {getPropertyAddress(propertyFilterId)}</p>
              )}
            </div>
            <div className="flex gap-2">
              {propertyFilterId && (
                <button 
                  onClick={() => setPropertyFilterId(null)}
                  className="text-xs text-slate-400 hover:text-white underline px-2"
                >
                  בטל סינון נכס (הצג הכל)
                </button>
              )}
              <span className="bg-green-500/20 text-green-400 px-4 py-1.5 rounded-xl text-xs font-black border border-green-500/20">{agentLeads.length} לידים</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="text-slate-500 text-[10px] bg-slate-900/30 uppercase font-black">
                <tr>
                  <th className="p-5">תאריך</th>
                  <th className="p-5">שם הלקוח</th>
                  <th className="p-5">טלפון</th>
                  <th className="p-5">מקור (נכס)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {agentLeads.length === 0 ? (
                    <tr><td colSpan={4} className="p-10 text-center text-slate-500 italic">אין לידים התואמים את התנאים</td></tr>
                ) : (
                    agentLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-5 text-slate-400 text-sm">{new Date(lead.createdAt).toLocaleDateString('he-IL')}</td>
                            <td className="p-5 text-white font-bold">{lead.fullName}</td>
                            <td className="p-5"><a href={`tel:${lead.phone}`} className="text-brand-accent font-bold hover:underline">{lead.phone}</a></td>
                            <td className="p-5 text-slate-400 text-xs">{getPropertyAddress(lead.propertyId)}</td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // תצוגת פירוט סוכן עם הנכסים שלו והלידים פר נכס
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
          חזרה לדשבורד
        </button>

        <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-brand-accent flex items-center justify-center text-white text-3xl font-black shadow-xl overflow-hidden border-2 border-white/10">
              {selectedAgent.photoURL ? <img src={selectedAgent.photoURL} className="w-full h-full object-cover" /> : selectedAgent.displayName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">{selectedAgent.displayName}</h2>
              <p className="text-slate-400">{selectedAgent.email}</p>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="text-center bg-slate-900/50 p-4 rounded-2xl border border-slate-700 min-w-[120px]">
                <p className="text-xs text-slate-500 mb-1 font-bold">סה"כ נכסים</p>
                <p className="text-2xl font-black text-white">{agentProps.length}</p>
             </div>
             <div 
                onClick={() => { setShowLeadsFor(selectedAgent); setSelectedAgent(null); setPropertyFilterId(null); }}
                className="text-center bg-green-500/10 p-4 rounded-2xl border border-green-500/20 min-w-[120px] cursor-pointer hover:bg-green-500/20 transition-all group"
             >
                <p className="text-xs text-green-500 mb-1 font-bold italic">סה"כ לידים</p>
                <p className="text-2xl font-black text-green-400 group-hover:scale-110 transition-transform">{agentLeads.length}</p>
                <span className="text-[9px] text-green-500 font-bold underline">צפה בטבלה המלאה</span>
             </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-6">נכסים של {selectedAgent.displayName}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agentProps.map(prop => {
            const propertyLeadsCount = agentLeads.filter(l => l.propertyId === prop.id).length;
            
            return (
              <div key={prop.id} className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden group shadow-xl hover:border-brand-accent/40 transition-all flex flex-col">
                <div className="h-48 bg-slate-900 relative">
                  <img src={prop.images[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  {/* אינדיקטור לידים פר נכס - לחיץ ופותח טבלה מסוננת */}
                  <button 
                    type="button"
                    onClick={(e) => { 
                      e.stopPropagation();
                      setPropertyFilterId(prop.id!); 
                      setShowLeadsFor(selectedAgent); 
                      setSelectedAgent(null); 
                    }}
                    className="absolute top-4 left-4 bg-green-600 text-white text-xs font-black px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20 hover:bg-green-500 hover:scale-110 transition-all active:scale-95 z-20 cursor-pointer pointer-events-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    {propertyLeadsCount} לידים
                  </button>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-white font-bold text-lg mb-1 truncate">{prop.generatedTitle}</h4>
                  <p className="text-slate-500 text-xs mb-6 truncate">{prop.address}</p>
                  
                  <div className="mt-auto flex gap-3">
                    <a href={`/${prop.slug}-${prop.id}`} target="_blank" className="flex-1 bg-slate-700 hover:bg-brand-accent text-white text-center py-2.5 rounded-xl text-xs font-bold transition-all">צפה באתר</a>
                    <button onClick={() => handleDeleteProp(prop.id!)} className="bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white p-2.5 rounded-xl transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-white">ניהול סוכנים</h1>
        <button onClick={loadData} className="bg-slate-800 text-white p-3 rounded-xl hover:bg-slate-700 transition-all border border-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="סוכנים רשומים" value={data.users.length} color="blue" />
        <StatCard title="דפי נחיתה" value={data.props.length} color="amber" />
        <StatCard title="לידים במערכת" value={data.leads.length} color="green" />
      </div>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="p-6 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-white">רשימת סוכנים פעילים</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="text-slate-500 text-[10px] bg-slate-900/30 uppercase font-black">
              <tr>
                <th className="p-5">סוכן</th>
                <th className="p-5 text-center">נכסים</th>
                <th className="p-5 text-center">כמות הלידים (לחץ לפירוט)</th>
                <th className="p-5">מייל</th>
                <th className="p-5">פעולה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {data.users.map(u => {
                const uPropsCount = data.props.filter(p => p.userId === u.uid).length;
                const uLeadsCount = data.leads.filter(l => l.ownerId === u.uid).length;
                return (
                  <tr key={u.uid} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5 cursor-pointer" onClick={() => setSelectedAgent(u)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-white border border-slate-600">
                            {u.photoURL ? <img src={u.photoURL} className="w-full h-full rounded-xl object-cover" /> : (u.displayName?.charAt(0) || 'U')}
                        </div>
                        <div className="font-bold text-white group-hover:text-brand-accent transition-colors">{u.displayName}</div>
                      </div>
                    </td>
                    <td className="p-5 text-center cursor-pointer" onClick={() => setSelectedAgent(u)}>
                        <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-black border border-amber-500/10">{uPropsCount}</span>
                    </td>
                    <td className="p-5 text-center">
                        <button 
                            onClick={() => { setPropertyFilterId(null); setShowLeadsFor(u); }}
                            className="bg-green-500/10 text-green-500 px-6 py-2 rounded-xl text-xs font-black border border-green-500/20 hover:bg-green-500/20 transition-all shadow-lg active:scale-95"
                        >
                            {uLeadsCount} לידים במערכת
                        </button>
                    </td>
                    <td className="p-5 text-slate-400 text-sm">{u.email}</td>
                    <td className="p-5">
                      <button onClick={() => setSelectedAgent(u)} className="text-brand-accent text-xs font-bold hover:underline">נהל סוכן ←</button>
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
        <div className={`p-8 rounded-3xl border shadow-xl ${colors[color]}`}>
            <p className="text-xs uppercase font-black tracking-widest mb-2 opacity-70">{title}</p>
            <p className="text-5xl font-black text-white">{value}</p>
        </div>
    );
}
