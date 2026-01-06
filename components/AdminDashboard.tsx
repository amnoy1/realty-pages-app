
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { PropertyDetails, UserProfile, Lead } from '../types';

// --- Icons ---
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;

// --- Helper Components ---
const StatCard = ({ title, value, color }: { title: string, value: number, color: string }) => {
    const borders: Record<string, string> = {
        blue: "border-blue-500 bg-blue-500/10",
        amber: "border-amber-500 bg-amber-500/10",
        green: "border-green-500 bg-green-500/10",
        purple: "border-purple-500 bg-purple-500/10"
    };
    return (
        <div className={`p-6 rounded-3xl border border-slate-700 border-b-4 ${borders[color]} shadow-xl flex flex-col items-center text-center transition-all hover:scale-105`}>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">{title}</p>
            <p className="text-4xl font-black text-white">{value}</p>
        </div>
    );
};

const DetailRow = ({ label, value, isBold = false, color = "text-white" }: { label: string, value: string, isBold?: boolean, color?: string }) => (
    <div className="flex justify-between items-start gap-4 py-3 border-b border-slate-700/50">
        <span className="text-slate-500 text-sm shrink-0 font-medium">{label}:</span>
        <span className={`${color} ${isBold ? 'font-black text-lg' : 'font-medium'} text-right`}>{value}</span>
    </div>
);

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'properties' | 'users' | 'leads'>('properties');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [properties, setProperties] = useState<PropertyDetails[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ type: 'property' | 'lead' | 'user', data: any } | null>(null);

  const fetchData = async () => {
    if (!db) {
        setError("מסד הנתונים לא מחובר.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      // שליפת כל הנתונים ללא orderBy כדי למנוע שגיאות אינדקסים ב-Firebase
      const [usersSnap, propsSnap, leadsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'landingPages')),
          getDocs(collection(db, 'leads'))
      ]);

      const usersList = usersSnap.docs.map(doc => ({ ...doc.data() as any, uid: doc.id }));
      const propsList = propsSnap.docs.map(doc => ({ ...doc.data() as any, id: doc.id }));
      const leadsList = leadsSnap.docs.map(doc => ({ ...doc.data() as any, id: doc.id }));

      // מיון ידני בצד הלקוח לצורך עמידות מקסימלית
      setUsers(usersList.sort((a, b) => (b.lastLogin || 0) - (a.lastLogin || 0)));
      setProperties(propsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      setLeads(leadsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));

      console.log(`Fetched: ${usersList.length} users, ${propsList.length} props, ${leadsList.length} leads`);
    } catch (err: any) {
      console.error("Admin Fetch Error:", err);
      setError("אירעה שגיאה בשליפת הנתונים. וודא שחוקי ה-Firestore מאפשרים גישה לאדמין.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (type: 'property' | 'lead' | 'user', data: any) => {
      setSelectedItem({ type, data });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-white gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
        <p className="text-slate-400">טוען נתונים מהמערכת...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-700 pb-6 gap-4">
        <div>
            <h1 className="text-4xl font-black text-white">לוח בקרה אדמין</h1>
            <p className="text-slate-400 mt-2 font-medium">ניהול גלובלי של כל הנכסים, הלידים והמשתמשים במערכת</p>
        </div>
        <button onClick={fetchData} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-600 transition-all flex items-center gap-2">
            <RefreshIcon />
            רענן נתונים
        </button>
      </div>
      
      {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-2xl mb-8 text-center font-bold">
              {error}
          </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="סוכנים פעילים" value={users.length} color="blue" />
        <StatCard title="נכסים שפורסמו" value={properties.length} color="amber" />
        <StatCard title="לידים שהתקבלו" value={leads.length} color="green" />
        <StatCard title="לידים (24 שעות)" value={leads.filter(l => Date.now() - l.createdAt < 86400000).length} color="purple" />
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-slate-800/50 p-1.5 rounded-2xl mb-8 w-fit border border-slate-700 shadow-2xl">
          <button 
            onClick={() => setActiveTab('properties')} 
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'properties' ? 'bg-white text-slate-900 shadow-xl scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
              נכסים
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'properties' ? 'bg-slate-900 text-white' : 'bg-slate-700 text-slate-300'}`}>{properties.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('leads')} 
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'leads' ? 'bg-white text-slate-900 shadow-xl scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
              לידים
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'leads' ? 'bg-slate-900 text-white' : 'bg-slate-700 text-slate-300'}`}>{leads.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-xl scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
              משתמשים
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'users' ? 'bg-slate-900 text-white' : 'bg-slate-700 text-slate-300'}`}>{users.length}</span>
          </button>
      </div>

      {/* Tables Container */}
      <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
          {activeTab === 'properties' && (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="p-5 font-bold">כותרת הנכס</th>
                            <th className="p-5 font-bold">כתובת</th>
                            <th className="p-5 font-bold">סוכן יוצר</th>
                            <th className="p-5 font-bold">סה״כ לידים</th>
                            <th className="p-5 font-bold">נוצר ב-</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {properties.length === 0 ? (
                            <tr><td colSpan={5} className="p-20 text-center text-slate-500 font-medium italic">אין נכסים במערכת</td></tr>
                        ) : properties.map(p => (
                            <tr key={p.id} onClick={() => handleRowClick('property', p)} className="hover:bg-brand-accent/10 cursor-pointer transition-colors group">
                                <td className="p-5 font-bold text-white group-hover:text-brand-accent">{p.generatedTitle}</td>
                                <td className="p-5 text-slate-300">{p.address}</td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">{p.userEmail?.charAt(0).toUpperCase()}</div>
                                        <span className="text-slate-400 max-w-[150px] truncate">{p.userEmail}</span>
                                    </div>
                                </td>
                                <td className="p-5"><span className="bg-slate-700/50 px-3 py-1 rounded-full text-xs font-bold text-brand-accent border border-brand-accent/20">{leads.filter(l => l.propertyId === p.id).length}</span></td>
                                <td className="p-5 text-slate-500 font-mono text-xs">{new Date(p.createdAt || 0).toLocaleDateString('he-IL')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
          )}

          {activeTab === 'leads' && (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="p-5 font-bold">תאריך פנייה</th>
                            <th className="p-5 font-bold">שם מתעניין</th>
                            <th className="p-5 font-bold">טלפון</th>
                            <th className="p-5 font-bold">עבור נכס</th>
                            <th className="p-5 font-bold">סוכן מטפל</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {leads.length === 0 ? (
                            <tr><td colSpan={5} className="p-20 text-center text-slate-500 font-medium italic">אין פניות עדיין</td></tr>
                        ) : leads.map(l => {
                            const agent = users.find(u => u.uid === l.ownerId);
                            return (
                                <tr key={l.id} onClick={() => handleRowClick('lead', l)} className="hover:bg-brand-accent/10 cursor-pointer transition-colors group">
                                    <td className="p-5 text-slate-400 text-xs font-mono">{new Date(l.createdAt).toLocaleString('he-IL')}</td>
                                    <td className="p-5 font-bold text-white group-hover:text-brand-accent">{l.fullName}</td>
                                    <td className="p-5 text-brand-accent font-black tracking-widest">{l.phone}</td>
                                    <td className="p-5 text-slate-300 truncate max-w-[180px]">{l.propertyTitle}</td>
                                    <td className="p-5 text-slate-400 text-xs font-medium">
                                        {agent?.displayName || agent?.email || 'סוכן לא ידוע'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
              </div>
          )}

          {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="p-5 font-bold">משתמש</th>
                            <th className="p-5 font-bold">אימייל</th>
                            <th className="p-5 font-bold">נכסים שפורסמו</th>
                            <th className="p-5 font-bold">תאריך הצטרפות</th>
                            <th className="p-5 font-bold">פעילות אחרונה</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {users.length === 0 ? (
                            <tr><td colSpan={5} className="p-20 text-center text-slate-500 font-medium italic">אין משתמשים במערכת</td></tr>
                        ) : users.map(u => (
                            <tr key={u.uid} onClick={() => handleRowClick('user', u)} className="hover:bg-brand-accent/10 cursor-pointer transition-colors group">
                                <td className="p-5 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl group-hover:border-brand-accent transition-all">
                                        {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white"><UserIcon /></div>}
                                    </div>
                                    <span className="text-white font-black group-hover:text-brand-accent">{u.displayName || 'סוכן חדש'}</span>
                                </td>
                                <td className="p-5 text-slate-400 font-medium">{u.email}</td>
                                <td className="p-5">
                                    <span className="bg-slate-900/80 px-4 py-1.5 rounded-full text-xs font-black text-white border border-slate-700">
                                        {properties.filter(p => p.userId === u.uid).length}
                                    </span>
                                </td>
                                <td className="p-5 text-slate-500 font-mono text-xs">{new Date(u.createdAt || u.lastLogin).toLocaleDateString('he-IL')}</td>
                                <td className="p-5 text-slate-500 font-mono text-xs">{new Date(u.lastLogin).toLocaleString('he-IL')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
          )}
      </div>

      {/* Detail Modal View */}
      {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
              <div className="bg-slate-800 border border-slate-600 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative" dir="rtl">
                  <div className="bg-gradient-to-r from-brand-accent to-orange-500 h-2.5 w-full"></div>
                  <button onClick={() => setSelectedItem(null)} className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors bg-slate-700 p-2.5 rounded-full shadow-lg border border-white/10"><CloseIcon /></button>
                  
                  <div className="p-10">
                      {selectedItem.type === 'property' && (
                          <div className="space-y-6">
                              <h2 className="text-3xl font-black text-white mb-2">סקירת נכס</h2>
                              <div className="aspect-video w-full rounded-3xl overflow-hidden mb-6 shadow-2xl border-4 border-slate-700 relative">
                                  <img src={selectedItem.data.images?.[0] || ''} className="w-full h-full object-cover" alt="" />
                                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                      <p className="text-brand-accent font-black text-xl">{selectedItem.data.price}</p>
                                  </div>
                              </div>
                              <DetailRow label="כותרת שיווקית" value={selectedItem.data.generatedTitle} isBold />
                              <DetailRow label="כתובת מלאה" value={selectedItem.data.address} />
                              <DetailRow label="סוכן אחראי" value={users.find(u => u.uid === selectedItem.data.userId)?.displayName || selectedItem.data.userEmail} color="text-brand-accent" />
                              <DetailRow label="לידים שנתקבלו" value={`${leads.filter(l => l.propertyId === selectedItem.data.id).length}`} />
                              <div className="pt-8">
                                  <a href={`/${selectedItem.data.slug}-${selectedItem.data.id}`} target="_blank" className="w-full bg-white hover:bg-slate-100 text-slate-900 py-4 rounded-2xl font-black text-center flex items-center justify-center gap-3 transition-all shadow-xl">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                      צפייה בדף הנחיתה
                                  </a>
                              </div>
                          </div>
                      )}

                      {selectedItem.type === 'lead' && (
                          <div className="space-y-6">
                              <h2 className="text-3xl font-black text-white mb-8">פרטי ליד נכנס</h2>
                              <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-700 mb-6 shadow-inner">
                                  <DetailRow label="שם המתעניין" value={selectedItem.data.fullName} isBold />
                                  <div className="mt-6 flex justify-between items-center bg-brand-accent/15 p-5 rounded-2xl border border-brand-accent/30">
                                      <span className="text-slate-400 text-sm font-bold">טלפון ליצירת קשר:</span>
                                      <span className="text-brand-accent font-black text-3xl tracking-tighter">{selectedItem.data.phone}</span>
                                  </div>
                              </div>
                              <DetailRow label="עבור הנכס" value={selectedItem.data.propertyTitle} />
                              <DetailRow label="סוכן משוייך" value={users.find(u => u.uid === selectedItem.data.ownerId)?.displayName || 'סוכן במערכת'} color="text-brand-accent" />
                              <DetailRow label="מועד הפנייה" value={new Date(selectedItem.data.createdAt).toLocaleString('he-IL')} />
                              <div className="pt-8">
                                  <a href={`tel:${selectedItem.data.phone}`} className="w-full bg-brand-accent hover:bg-brand-accentHover text-white py-5 rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-4 transition-all shadow-[0_10px_30px_rgba(217,119,6,0.3)]">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                      חיוג למתעניין עכשיו
                                  </a>
                              </div>
                          </div>
                      )}

                      {selectedItem.type === 'user' && (
                          <div className="space-y-6">
                              <h2 className="text-3xl font-black text-white mb-8">פרופיל סוכן נדל״ן</h2>
                              <div className="flex items-center gap-6 bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-700 mb-8 shadow-inner">
                                  <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden border-4 border-brand-accent shadow-2xl shrink-0">
                                      <img src={selectedItem.data.photoURL} className="w-full h-full object-cover" alt="" />
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-2xl font-black text-white truncate">{selectedItem.data.displayName}</p>
                                      <p className="text-slate-400 font-medium truncate text-sm">{selectedItem.data.email}</p>
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-slate-700/40 p-5 rounded-3xl text-center border border-white/5 shadow-sm">
                                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">נכסים</p>
                                      <p className="text-3xl font-black text-white">{properties.filter(p => p.userId === selectedItem.data.uid).length}</p>
                                  </div>
                                  <div className="bg-slate-700/40 p-5 rounded-3xl text-center border border-white/5 shadow-sm">
                                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">לידים</p>
                                      <p className="text-3xl font-black text-white">{leads.filter(l => l.ownerId === selectedItem.data.uid).length}</p>
                                  </div>
                              </div>
                              <div className="pt-6 space-y-2">
                                  <DetailRow label="תאריך הצטרפות למערכת" value={new Date(selectedItem.data.createdAt || selectedItem.data.lastLogin).toLocaleDateString('he-IL')} />
                                  <DetailRow label="פעילות אחרונה שנרשמה" value={new Date(selectedItem.data.lastLogin).toLocaleString('he-IL')} />
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
