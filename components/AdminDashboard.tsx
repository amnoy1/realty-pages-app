
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { PropertyDetails, UserProfile, Lead } from '../types';

// Moved helper components to the top of the file to ensure they are defined before use and avoid potential parsing errors due to broken JSX structure below.
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;

const StatCard = ({ title, value, color }: any) => {
    const colorClasses: any = {
        blue: "border-blue-500 bg-blue-500/5",
        amber: "border-amber-500 bg-amber-500/5",
        green: "border-green-500 bg-green-500/5",
        purple: "border-purple-500 bg-purple-500/5"
    };
    return (
        <div className={`p-6 rounded-3xl border border-slate-700 border-b-4 ${colorClasses[color]} shadow-xl flex flex-col items-center text-center transition-all hover:-translate-y-1`}>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">{title}</p>
            <p className="text-4xl font-black text-white">{value}</p>
        </div>
    );
};

const TabToggle = ({ active, onClick, label, count }: any) => (
    <button 
        onClick={onClick}
        className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${active ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
        {label}
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-slate-900 text-white' : 'bg-slate-700 text-slate-300'}`}>{count}</span>
    </button>
);

const DetailRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-start gap-4">
        <span className="text-slate-500 text-sm shrink-0">{label}:</span>
        <span className="text-white font-medium text-right">{value}</span>
    </div>
);

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'properties' | 'users' | 'leads'>('properties');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [properties, setProperties] = useState<PropertyDetails[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Detail views for interactivity
  const [selectedItem, setSelectedItem] = useState<{ type: 'property' | 'lead' | 'user', data: any } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!db) return;
      try {
        const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('lastLogin', 'desc')));
        setUsers(usersSnap.docs.map(doc => ({ ...doc.data() as any, uid: doc.id })));

        const propsSnap = await getDocs(query(collection(db, 'landingPages'), orderBy('createdAt', 'desc')));
        setProperties(propsSnap.docs.map(doc => ({ ...doc.data() as any, id: doc.id })));

        const leadsSnap = await getDocs(query(collection(db, 'leads'), orderBy('createdAt', 'desc')));
        setLeads(leadsSnap.docs.map(doc => ({ ...doc.data() as any, id: doc.id })));

      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleRowClick = (type: 'property' | 'lead' | 'user', data: any) => {
      setSelectedItem({ type, data });
  };

  if (loading) return <div className="text-white text-center py-20 flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
      <p className="text-slate-400">טוען נתונים ללוח בקרה...</p>
  </div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in relative" dir="rtl">
      <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
        <div>
            <h1 className="text-4xl font-black text-white">לוח בקרה אדמין</h1>
            <p className="text-slate-400 mt-2 font-medium">ניהול משתמשים, נכסים ולידים במערכת</p>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="משתמשים פעילים" value={users.length} color="blue" />
        <StatCard title="נכסים שפורסמו" value={properties.length} color="amber" />
        <StatCard title="לידים שהתקבלו" value={leads.length} color="green" />
        <StatCard title="לידים (24 שעות)" value={leads.filter(l => Date.now() - l.createdAt < 86400000).length} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-800/50 p-1 rounded-2xl mb-8 w-fit border border-slate-700">
          <TabToggle active={activeTab === 'properties'} onClick={() => setActiveTab('properties')} label="נכסים" count={properties.length} />
          <TabToggle active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} label="לידים" count={leads.length} />
          <TabToggle active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="משתמשים" count={users.length} />
      </div>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl transition-all">
          {activeTab === 'properties' && (
              <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                      <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
                          <tr>
                              <th className="p-5 font-bold">כותרת הנכס</th>
                              <th className="p-5 font-bold">כתובת</th>
                              <th className="p-5 font-bold">סוכן (משתמש)</th>
                              <th className="p-5 font-bold">לידים</th>
                              <th className="p-5 font-bold">תאריך הצטרפות</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                          {properties.map(p => (
                              <tr key={p.id} onClick={() => handleRowClick('property', p)} className="hover:bg-brand-accent/5 cursor-pointer transition-colors group">
                                  <td className="p-5 font-bold text-white group-hover:text-brand-accent">{p.generatedTitle}</td>
                                  <td className="p-5 text-slate-300">{p.address}</td>
                                  <td className="p-5">
                                      <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">{p.userEmail?.charAt(0).toUpperCase()}</div>
                                          <span className="text-slate-400">{p.userEmail}</span>
                                      </div>
                                  </td>
                                  <td className="p-5">
                                      <span className="bg-slate-700/50 text-slate-200 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-600">
                                          {leads.filter(l => l.propertyId === p.id).length}
                                      </span>
                                  </td>
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
                              <th className="p-5 font-bold">סוכן אחראי</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                          {leads.map(l => {
                              const agent = users.find(u => u.uid === l.ownerId);
                              return (
                                  <tr key={l.id} onClick={() => handleRowClick('lead', l)} className="hover:bg-brand-accent/5 cursor-pointer transition-colors group">
                                      <td className="p-5 text-slate-400 text-xs font-mono">{new Date(l.createdAt).toLocaleString('he-IL')}</td>
                                      <td className="p-5 font-bold text-white group-hover:text-brand-accent">{l.fullName}</td>
                                      <td className="p-5 text-brand-accent font-bold tracking-wider">{l.phone}</td>
                                      <td className="p-5 text-slate-300 max-w-[180px] truncate">{l.propertyTitle}</td>
                                      <td className="p-5">
                                          <div className="flex items-center gap-2">
                                              {agent?.photoURL && <img src={agent.photoURL} className="w-5 h-5 rounded-full" />}
                                              <span className="text-slate-400 text-xs">{agent?.displayName || agent?.email || 'סוכן לא ידוע'}</span>
                                          </div>
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
                              <th className="p-5 font-bold">נכסים</th>
                              <th className="p-5 font-bold">הצטרף ב-</th>
                              <th className="p-5 font-bold">התחברות אחרונה</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                          {users.map(u => (
                              <tr key={u.uid} onClick={() => handleRowClick('user', u)} className="hover:bg-brand-accent/5 cursor-pointer transition-colors group">
                                  <td className="p-5 flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border-2 border-slate-700 group-hover:border-brand-accent transition-all">
                                          {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" /> : <div className="bg-slate-700 w-full h-full flex items-center justify-center text-white"><UserIcon /></div>}
                                      </div>
                                      <span className="text-white font-black group-hover:text-brand-accent">{u.displayName || 'משתמש חדש'}</span>
                                  </td>
                                  <td className="p-5 text-slate-400 font-medium">{u.email}</td>
                                  <td className="p-5">
                                      <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
                                          {properties.filter(p => p.userId === u.uid).length} נכסים
                                      </span>
                                  </td>
                                  <td className="p-5 text-slate-500 text-xs font-mono">{new Date(u.createdAt || u.lastLogin).toLocaleDateString('he-IL')}</td>
                                  <td className="p-5 text-slate-500 text-xs font-mono">{new Date(u.lastLogin).toLocaleString('he-IL')}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>

      {/* Detail View Modal (Interactivity) */}
      {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-800 border border-slate-600 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden" dir="rtl">
                  <div className="absolute top-0 left-0 w-full h-2 bg-brand-accent"></div>
                  <button onClick={() => setSelectedItem(null)} className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors"><CloseIcon /></button>
                  
                  <div className="p-8">
                      {selectedItem.type === 'property' && (
                          <>
                              <h2 className="text-2xl font-bold text-white mb-6">פרטי נכס</h2>
                              <div className="space-y-4">
                                  <DetailRow label="כותרת" value={selectedItem.data.generatedTitle} />
                                  <DetailRow label="כתובת" value={selectedItem.data.address} />
                                  <DetailRow label="מחיר" value={selectedItem.data.price} />
                                  <DetailRow label="סוכן שפרסם" value={users.find(u => u.uid === selectedItem.data.userId)?.displayName || selectedItem.data.userEmail} />
                                  <DetailRow label="אימייל סוכן" value={selectedItem.data.userEmail} />
                                  <div className="pt-4 border-t border-slate-700">
                                      <a href={`/${selectedItem.data.slug}-${selectedItem.data.id}`} target="_blank" className="w-full bg-slate-700 hover:bg-brand-accent text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">צפה בדף הנחיתה</a>
                                  </div>
                              </div>
                          </>
                      )}
                      {selectedItem.type === 'lead' && (
                          <>
                              <h2 className="text-2xl font-bold text-white mb-6">פרטי פנייה (ליד)</h2>
                              <div className="space-y-4">
                                  <DetailRow label="שם המתעניין" value={selectedItem.data.fullName} />
                                  <DetailRow label="טלפון" value={selectedItem.data.phone} />
                                  <DetailRow label="עבור נכס" value={selectedItem.data.propertyTitle} />
                                  <DetailRow label="סוכן שקיבל" value={users.find(u => u.uid === selectedItem.data.ownerId)?.displayName || 'סוכן במערכת'} />
                                  <DetailRow label="תאריך פנייה" value={new Date(selectedItem.data.createdAt).toLocaleString('he-IL')} />
                                  <div className="pt-4 border-t border-slate-700">
                                      <a href={`tel:${selectedItem.data.phone}`} className="w-full bg-brand-accent hover:bg-brand-accentHover text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">חיוג למתעניין</a>
                                  </div>
                              </div>
                          </>
                      )}
                      {selectedItem.type === 'user' && (
                          <>
                              <h2 className="text-2xl font-bold text-white mb-6">פרופיל סוכן</h2>
                              <div className="flex items-center gap-4 mb-6 p-4 bg-slate-700/50 rounded-2xl">
                                  <img src={selectedItem.data.photoURL || ''} className="w-16 h-16 rounded-full border-2 border-brand-accent" />
                                  <div>
                                      <p className="text-xl font-bold text-white">{selectedItem.data.displayName}</p>
                                      <p className="text-slate-400 text-sm">{selectedItem.data.email}</p>
                                  </div>
                              </div>
                              <div className="space-y-4">
                                  <DetailRow label="סה״כ נכסים" value={`${properties.filter(p => p.userId === selectedItem.data.uid).length}`} />
                                  <DetailRow label="סה״כ לידים שקיבל" value={`${leads.filter(l => l.ownerId === selectedItem.data.uid).length}`} />
                                  <DetailRow label="תאריך הצטרפות" value={new Date(selectedItem.data.createdAt || selectedItem.data.lastLogin).toLocaleDateString('he-IL')} />
                                  <DetailRow label="פעילות אחרונה" value={new Date(selectedItem.data.lastLogin).toLocaleString('he-IL')} />
                              </div>
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
