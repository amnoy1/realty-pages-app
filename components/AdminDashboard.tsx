
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { PropertyDetails, UserProfile, Lead } from '../types';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

const StatCard = ({ title, value, color }: { title: string, value: number, color: string }) => {
    const borders: Record<string, string> = {
        blue: "border-blue-500 bg-blue-500/5",
        amber: "border-amber-500 bg-amber-500/5",
        green: "border-green-500 bg-green-500/5",
        purple: "border-purple-500 bg-purple-500/5"
    };
    return (
        <div className={`p-6 rounded-3xl border border-slate-700 border-b-4 ${borders[color]} shadow-xl flex flex-col items-center text-center transition-all hover:-translate-y-1`}>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">{title}</p>
            <p className="text-4xl font-black text-white">{value}</p>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'properties' | 'users' | 'leads'>('properties');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [properties, setProperties] = useState<PropertyDetails[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ type: 'property' | 'lead' | 'user', data: any } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!db) return;
      try {
        const [usersSnap, propsSnap, leadsSnap] = await Promise.all([
            getDocs(query(collection(db, 'users'), orderBy('lastLogin', 'desc'))),
            getDocs(query(collection(db, 'landingPages'), orderBy('createdAt', 'desc'))),
            getDocs(query(collection(db, 'leads'), orderBy('createdAt', 'desc')))
        ]);

        setUsers(usersSnap.docs.map(doc => ({ ...doc.data() as any, uid: doc.id })));
        setProperties(propsSnap.docs.map(doc => ({ ...doc.data() as any, id: doc.id })));
        setLeads(leadsSnap.docs.map(doc => ({ ...doc.data() as any, id: doc.id })));
      } catch (error) {
        console.error("Admin Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRowClick = (type: 'property' | 'lead' | 'user', data: any) => setSelectedItem({ type, data });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-white gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
        <p>טוען נתונים...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="mb-10 border-b border-slate-700 pb-6">
        <h1 className="text-4xl font-black text-white">לוח בקרה אדמין</h1>
        <p className="text-slate-400 mt-2">מעקב גלובלי אחרי משתמשים, נכסים ולידים</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="משתמשים" value={users.length} color="blue" />
        <StatCard title="נכסים" value={properties.length} color="amber" />
        <StatCard title="לידים (סה״כ)" value={leads.length} color="green" />
        <StatCard title="לידים חדשים (24ש)" value={leads.filter(l => Date.now() - l.createdAt < 86400000).length} color="purple" />
      </div>

      <div className="flex bg-slate-800/50 p-1 rounded-2xl mb-8 w-fit border border-slate-700">
          <button onClick={() => setActiveTab('properties')} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'properties' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>נכסים ({properties.length})</button>
          <button onClick={() => setActiveTab('leads')} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'leads' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>לידים ({leads.length})</button>
          <button onClick={() => setActiveTab('users')} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>משתמשים ({users.length})</button>
      </div>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
          {activeTab === 'properties' && (
              <table className="w-full text-right text-sm">
                  <thead className="bg-slate-900/80 text-slate-400">
                      <tr>
                          <th className="p-5">נכס</th>
                          <th className="p-5">כתובת</th>
                          <th className="p-5">סוכן</th>
                          <th className="p-5">לידים</th>
                          <th className="p-5">נוצר ב-</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                      {properties.map(p => (
                          <tr key={p.id} onClick={() => handleRowClick('property', p)} className="hover:bg-brand-accent/5 cursor-pointer transition-colors group">
                              <td className="p-5 font-bold text-white group-hover:text-brand-accent">{p.generatedTitle}</td>
                              <td className="p-5 text-slate-300">{p.address}</td>
                              <td className="p-5 text-slate-400">{p.userEmail}</td>
                              <td className="p-5 text-center"><span className="bg-slate-700 px-2 py-1 rounded-full text-[10px]">{leads.filter(l => l.propertyId === p.id).length}</span></td>
                              <td className="p-5 text-slate-500 text-xs">{new Date(p.createdAt || 0).toLocaleDateString('he-IL')}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          )}

          {activeTab === 'leads' && (
              <table className="w-full text-right text-sm">
                  <thead className="bg-slate-900/80 text-slate-400">
                      <tr>
                          <th className="p-5">תאריך</th>
                          <th className="p-5">מתעניין</th>
                          <th className="p-5">טלפון</th>
                          <th className="p-5">נכס</th>
                          <th className="p-5">סוכן</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                      {leads.map(l => {
                          const agent = users.find(u => u.uid === l.ownerId);
                          return (
                              <tr key={l.id} onClick={() => handleRowClick('lead', l)} className="hover:bg-brand-accent/5 cursor-pointer transition-colors group">
                                  <td className="p-5 text-slate-400 text-xs">{new Date(l.createdAt).toLocaleString('he-IL')}</td>
                                  <td className="p-5 font-bold text-white group-hover:text-brand-accent">{l.fullName}</td>
                                  <td className="p-5 text-brand-accent font-mono">{l.phone}</td>
                                  <td className="p-5 text-slate-300 truncate max-w-[150px]">{l.propertyTitle}</td>
                                  <td className="p-5 text-slate-400 text-xs">{agent?.displayName || agent?.email || 'לא ידוע'}</td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          )}

          {activeTab === 'users' && (
              <table className="w-full text-right text-sm">
                  <thead className="bg-slate-900/80 text-slate-400">
                      <tr>
                          <th className="p-5">משתמש</th>
                          <th className="p-5">אימייל</th>
                          <th className="p-5">נכסים</th>
                          <th className="p-5">הצטרף ב-</th>
                          <th className="p-5">פעילות אחרונה</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                      {users.map(u => (
                          <tr key={u.uid} onClick={() => handleRowClick('user', u)} className="hover:bg-brand-accent/5 cursor-pointer transition-colors group">
                              <td className="p-5 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-600">
                                      {u.photoURL ? <img src={u.photoURL} alt="" /> : <div className="w-full h-full bg-slate-700 flex items-center justify-center text-[10px]"><UserIcon /></div>}
                                  </div>
                                  <span className="text-white font-bold">{u.displayName || 'משתמש'}</span>
                              </td>
                              <td className="p-5 text-slate-400">{u.email}</td>
                              <td className="p-5 text-slate-300">{properties.filter(p => p.userId === u.uid).length}</td>
                              <td className="p-5 text-slate-500 text-xs">{new Date(u.createdAt || u.lastLogin).toLocaleDateString('he-IL')}</td>
                              <td className="p-5 text-slate-500 text-xs">{new Date(u.lastLogin).toLocaleString('he-IL')}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          )}
      </div>

      {/* Modal Detail View */}
      {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-800 border border-slate-600 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                  <div className="bg-brand-accent h-2 w-full"></div>
                  <button onClick={() => setSelectedItem(null)} className="absolute top-4 left-4 text-slate-400 hover:text-white"><CloseIcon /></button>
                  <div className="p-8">
                      {selectedItem.type === 'property' && (
                          <div className="space-y-4">
                              <h2 className="text-2xl font-bold text-white mb-4">פרטי נכס</h2>
                              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">כותרת:</span><span className="text-white font-bold">{selectedItem.data.generatedTitle}</span></div>
                              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">כתובת:</span><span className="text-white">{selectedItem.data.address}</span></div>
                              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">סוכן אחראי:</span><span className="text-brand-accent font-bold">{users.find(u => u.uid === selectedItem.data.userId)?.displayName || selectedItem.data.userEmail}</span></div>
                              <div className="flex justify-between"><span className="text-slate-400">לידים שהתקבלו:</span><span className="text-white">{leads.filter(l => l.propertyId === selectedItem.data.id).length}</span></div>
                              <a href={`/${selectedItem.data.slug}-${selectedItem.data.id}`} target="_blank" className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold mt-6">צפה בדף</a>
                          </div>
                      )}
                      {selectedItem.type === 'lead' && (
                          <div className="space-y-4">
                              <h2 className="text-2xl font-bold text-white mb-4">פרטי ליד</h2>
                              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">שם:</span><span className="text-white font-bold">{selectedItem.data.fullName}</span></div>
                              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">טלפון:</span><span className="text-brand-accent font-mono font-bold text-xl">{selectedItem.data.phone}</span></div>
                              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">עבור נכס:</span><span className="text-white">{selectedItem.data.propertyTitle}</span></div>
                              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">שייך לסוכן:</span><span className="text-white">{users.find(u => u.uid === selectedItem.data.ownerId)?.displayName || 'לא ידוע'}</span></div>
                              <a href={`tel:${selectedItem.data.phone}`} className="block w-full text-center bg-brand-accent text-white py-3 rounded-xl font-bold mt-6">חיוג למתעניין</a>
                          </div>
                      )}
                      {selectedItem.type === 'user' && (
                          <div className="space-y-4">
                              <h2 className="text-2xl font-bold text-white mb-4">פרופיל סוכן</h2>
                              <div className="flex items-center gap-4 bg-slate-700/50 p-4 rounded-2xl mb-4">
                                  <img src={selectedItem.data.photoURL} className="w-16 h-16 rounded-full border-2 border-brand-accent" alt="" />
                                  <div>
                                      <p className="text-xl font-bold text-white">{selectedItem.data.displayName}</p>
                                      <p className="text-slate-400 text-sm">{selectedItem.data.email}</p>
                                  </div>
                              </div>
                              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">נכסים שפורסמו:</span><span className="text-white font-bold">{properties.filter(p => p.userId === selectedItem.data.uid).length}</span></div>
                              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">לידים בסה״כ:</span><span className="text-white font-bold">{leads.filter(l => l.ownerId === selectedItem.data.uid).length}</span></div>
                              <div className="flex justify-between"><span className="text-slate-400">תאריך הצטרפות:</span><span className="text-white">{new Date(selectedItem.data.createdAt || selectedItem.data.lastLogin).toLocaleDateString('he-IL')}</span></div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
