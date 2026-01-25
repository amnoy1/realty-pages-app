
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { PropertyDetails, UserProfile, Lead } from '../types';

type AdminTab = 'agents' | 'properties' | 'leads';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<{ 
    users: UserProfile[], 
    props: PropertyDetails[], 
    leads: Lead[] 
  }>({ users: [], props: [], leads: [] });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('agents');
  const [selectedAgent, setSelectedAgent] = useState<UserProfile | null>(null);

  const isLeadNew = (timestamp: number) => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return timestamp >= oneDayAgo;
  };

  const loadData = async () => {
    if (!db) {
      setError("חיבור ל-Firebase לא הוגדר כראוי.");
      setLoading(false);
      return;
    }
    setLoading(true);
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

      // Sort leads - Newest first
      const sortedLeads = (leads as Lead[]).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      setData({ 
        users: users as UserProfile[], 
        props: props as PropertyDetails[], 
        leads: sortedLeads 
      });
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת הנתונים.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const getAgentName = (uid: string) => {
    const u = data.users.find(user => user.uid === uid);
    return u ? u.displayName : 'סוכן לא ידוע';
  };

  const getPropertyAddress = (id: string) => {
    const p = data.props.find(item => item.id === id);
    return p ? p.address : 'נכס נמחק';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32" dir="rtl">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-accent border-t-transparent mb-4"></div>
      <p className="text-slate-400 font-bold font-sans">טוען נתוני מערכת...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-white font-sans">ניהול מערכת</h1>
        <button onClick={loadData} className="bg-slate-800 text-white p-3 rounded-xl hover:bg-slate-700 transition-all border border-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>
      
      {/* Tab Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <button onClick={() => { setActiveTab('agents'); setSelectedAgent(null); }} className="text-right">
            <StatCard title="סוכנים רשומים" value={data.users.length} color="blue" active={activeTab === 'agents'} />
        </button>
        <button onClick={() => { setActiveTab('properties'); setSelectedAgent(null); }} className="text-right">
            <StatCard title="דפי נחיתה" value={data.props.length} color="amber" active={activeTab === 'properties'} />
        </button>
        <button onClick={() => { setActiveTab('leads'); setSelectedAgent(null); }} className="text-right">
            <StatCard title="לידים במערכת" value={data.leads.length} color="green" active={activeTab === 'leads'} />
        </button>
      </div>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
        {activeTab === 'agents' && (
            <>
                <div className="p-6 bg-slate-900/50 border-b border-slate-700">
                    <h3 className="font-bold text-white font-sans">רשימת סוכנים</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="text-slate-500 text-[10px] bg-slate-900/30 uppercase font-black font-sans">
                            <tr>
                                <th className="p-5">סוכן</th>
                                <th className="p-5 text-center">נכסים</th>
                                <th className="p-5 text-center">לידים</th>
                                <th className="p-5">מייל</th>
                                <th className="p-5">ניהול</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 font-sans">
                            {data.users.map(u => {
                                const agentLeads = data.leads.filter(l => l.ownerId === u.uid);
                                const hasNewLeads = agentLeads.some(l => isLeadNew(l.createdAt));
                                return (
                                    <tr key={u.uid} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-5 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-white border border-slate-600 overflow-hidden">
                                                {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" /> : (u.displayName?.charAt(0))}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white group-hover:text-brand-accent transition-colors">{u.displayName}</span>
                                                {hasNewLeads && <span className="text-[10px] font-black text-red-500 animate-pulse">לידים חדשים!</span>}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center"><span className="bg-slate-900 text-slate-300 px-3 py-1 rounded-full text-xs font-bold">{data.props.filter(p => p.userId === u.uid).length}</span></td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${hasNewLeads ? 'bg-red-500/20 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                                {agentLeads.length}
                                            </span>
                                        </td>
                                        <td className="p-5 text-slate-400 text-sm">{u.email}</td>
                                        <td className="p-5">
                                            <button onClick={() => setSelectedAgent(u)} className="text-brand-accent text-xs font-bold hover:underline">פרטי סוכן ←</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </>
        )}

        {activeTab === 'properties' && (
            <>
                <div className="p-6 bg-slate-900/50 border-b border-slate-700">
                    <h3 className="font-bold text-white font-sans">כל דפי הנחיתה במערכת</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="text-slate-500 text-[10px] bg-slate-900/30 uppercase font-black font-sans">
                            <tr>
                                <th className="p-5">נכס</th>
                                <th className="p-5">סוכן מטפל</th>
                                <th className="p-5">מחיר</th>
                                <th className="p-5">לידים</th>
                                <th className="p-5">פעולה</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 font-sans">
                            {data.props.map(prop => {
                                const propLeads = data.leads.filter(l => l.propertyId === prop.id);
                                const hasNewLeads = propLeads.some(l => isLeadNew(l.createdAt));
                                return (
                                    <tr key={prop.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold">{prop.address}</span>
                                                <span className="text-slate-500 text-[10px] truncate max-w-xs">{prop.generatedTitle}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-slate-300 text-sm font-medium">{getAgentName(prop.userId!)}</td>
                                        <td className="p-5 text-brand-accent font-bold">₪ {prop.price}</td>
                                        <td className="p-5">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${hasNewLeads ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500/20 text-green-400'}`}>
                                                {propLeads.length} {hasNewLeads && "NEW"}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <a href={`/${prop.slug}-${prop.id}`} target="_blank" className="text-blue-400 hover:underline text-xs font-bold">צפה בדף</a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </>
        )}

        {activeTab === 'leads' && (
            <>
                <div className="p-6 bg-slate-900/50 border-b border-slate-700">
                    <h3 className="font-bold text-white font-sans">כל הלידים שנכנסו למערכת (חדשים בראש הרשימה)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="text-slate-500 text-[10px] bg-slate-900/30 uppercase font-black font-sans">
                            <tr>
                                <th className="p-5">סטטוס</th>
                                <th className="p-5">תאריך</th>
                                <th className="p-5">שם הלקוח</th>
                                <th className="p-5">טלפון</th>
                                <th className="p-5">סוכן יעד</th>
                                <th className="p-5">נכס</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 font-sans">
                            {data.leads.map(lead => {
                                const isNew = isLeadNew(lead.createdAt);
                                return (
                                    <tr key={lead.id} className={`hover:bg-white/5 transition-colors ${isNew ? 'bg-red-500/5' : ''}`}>
                                        <td className="p-5">
                                            {isNew ? (
                                                <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded-full font-black shadow-lg shadow-red-500/20 animate-bounce inline-block">NEW</span>
                                            ) : (
                                                <span className="text-slate-600 text-[10px] font-bold">ישן</span>
                                            )}
                                        </td>
                                        <td className="p-5 text-slate-400 text-xs">
                                            {new Date(lead.createdAt).toLocaleDateString('he-IL')}
                                            <br/>
                                            {new Date(lead.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-5 text-white font-bold">{lead.fullName}</td>
                                        <td className="p-5 text-brand-accent font-bold">{lead.phone}</td>
                                        <td className="p-5 text-slate-300 text-sm">{getAgentName(lead.ownerId)}</td>
                                        <td className="p-5 text-slate-500 text-xs truncate max-w-[150px]">{getPropertyAddress(lead.propertyId)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </>
        )}
      </div>
      
      {/* Agent drill-down modal overlay if needed */}
      {selectedAgent && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
              <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-700 shadow-2xl overflow-y-auto">
                  <div className="p-8 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-accent flex items-center justify-center text-white text-xl font-black">
                            {selectedAgent.photoURL ? <img src={selectedAgent.photoURL} className="w-full h-full object-cover rounded-2xl" /> : selectedAgent.displayName?.charAt(0)}
                        </div>
                        <h2 className="text-2xl font-black text-white font-sans">{selectedAgent.displayName} - דוח פעילות</h2>
                      </div>
                      <button onClick={() => setSelectedAgent(null)} className="text-slate-500 hover:text-white transition-colors p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                  </div>
                  <div className="p-8">
                      <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center">
                              <p className="text-slate-500 text-xs font-bold mb-1">נכסים</p>
                              <p className="text-3xl font-black text-white">{data.props.filter(p => p.userId === selectedAgent.uid).length}</p>
                          </div>
                          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center">
                              <p className="text-slate-500 text-xs font-bold mb-1">לידים</p>
                              <p className="text-3xl font-black text-green-400">{data.leads.filter(l => l.ownerId === selectedAgent.uid).length}</p>
                          </div>
                      </div>
                      <h4 className="font-bold text-white mb-4">נכסים פעילים</h4>
                      <div className="space-y-3">
                          {data.props.filter(p => p.userId === selectedAgent.uid).map(prop => {
                              const propLeads = data.leads.filter(l => l.propertyId === prop.id);
                              const hasNewLeads = propLeads.some(l => isLeadNew(l.createdAt));
                              return (
                                <div key={prop.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-bold text-sm">{prop.address}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-slate-500 text-[10px]">{propLeads.length} לידים</p>
                                            {hasNewLeads && <span className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black animate-pulse">NEW</span>}
                                        </div>
                                    </div>
                                    <a href={`/${prop.slug}-${prop.id}`} target="_blank" className="text-brand-accent text-xs font-bold">פתח דף ←</a>
                                </div>
                              );
                          })}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color, active }: { title: string, value: number, color: 'blue' | 'amber' | 'green', active: boolean }) => {
    const colors = {
        blue: active ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-800/50 hover:border-blue-500/50",
        amber: active ? "border-amber-500 bg-amber-500/10" : "border-slate-700 bg-slate-800/50 hover:border-amber-500/50",
        green: active ? "border-green-500 bg-green-500/10" : "border-slate-700 bg-slate-800/50 hover:border-green-500/50"
    };
    const textColors = {
        blue: active ? "text-blue-400" : "text-slate-500",
        amber: active ? "text-amber-500" : "text-slate-500",
        green: active ? "text-green-400" : "text-slate-500"
    };

    return (
        <div className={`p-8 rounded-3xl border shadow-xl transition-all duration-300 transform ${active ? 'scale-[1.02] shadow-2xl' : 'hover:scale-[1.01]'} ${colors[color]}`}>
            <p className={`text-xs uppercase font-black tracking-widest mb-2 transition-colors ${textColors[color]}`}>{title}</p>
            <p className="text-5xl font-black text-white font-sans">{value}</p>
        </div>
    );
}
