import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, deleteDoc, doc, orderBy } from 'firebase/firestore';
import type { PropertyDetails, Lead } from '../types';

interface UserDashboardProps {
    userId: string;
    userEmail?: string | null;
    onCreateNew: () => void;
    onEdit: (property: PropertyDetails) => void;
}

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const LeadsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const WhatsAppIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.334l-.694 2.54 2.59-.68c1.027.56 1.829.914 3.037.914 3.183 0 5.769-2.587 5.77-5.767.001-3.18-2.584-5.767-5.76-5.767zm3.394 8.205c-.145.409-.844.779-1.157.827-.27.042-.622.072-1.02-.057-.233-.076-.515-.17-.893-.332-1.612-.693-2.651-2.332-2.731-2.441-.08-.108-.647-.862-.647-1.644 0-.783.411-1.168.556-1.325.145-.157.315-.197.42-.197h.263c.08 0 .185-.03.284.21.108.263.367.893.4 0 .96.033.107.054.175.108.244.054.07.12.108.054.21.054.108.108.244.185.347.08.1.185.21.315.347.13.135.244.244.409.347.165.103.315.17.47.244.154.07.315.103.47.103h.367c.185 0 .332-.03.493-.076.162-.045.54-.22.616-.433.076-.213.076-.395.054-.433-.021-.038-.076-.054-.154-.096z"/></svg>;

export const UserDashboard: React.FC<UserDashboardProps> = ({ userId, userEmail, onCreateNew, onEdit }) => {
  const [myProperties, setMyProperties] = useState<PropertyDetails[]>([]);
  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'properties' | 'leads'>('properties');
  const [selectedPropertyForLeads, setSelectedPropertyForLeads] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchData = async () => {
    if (!db || !userId) return;
    setLoading(true);
    try {
      // Fetch Properties
      const qProps = query(collection(db, 'landingPages'), where('userId', '==', userId));
      const snapProps = await getDocs(qProps);
      const props = snapProps.docs.map(doc => ({ ...doc.data() as any, id: doc.id } as PropertyDetails));
      props.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setMyProperties(props);

      // Fetch Leads
      const qLeads = query(collection(db, 'leads'), where('ownerId', '==', userId));
      const snapLeads = await getDocs(qLeads);
      const leads = snapLeads.docs.map(doc => ({ ...doc.data() as any, id: doc.id } as Lead));
      leads.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setMyLeads(leads);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!db || !window.confirm('האם אתה בטוח שברצונך למחוק את דף הנחיתה הזה? פעולה זו אינה ניתנת לביטול.')) return;

    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, 'landingPages', id));
      setMyProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("שגיאה במחיקת הנכס.");
    } finally {
      setIsDeleting(null);
    }
  };

  const getLeadCountForProperty = (propertyId: string) => {
      return myLeads.filter(l => l.propertyId === propertyId).length;
  };

  const filteredLeads = selectedPropertyForLeads 
    ? myLeads.filter(l => l.propertyId === selectedPropertyForLeads)
    : myLeads;

  if (loading) return (
    <div className="text-white text-center py-20 animate-pulse">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
      <p>טוען את המידע שלך...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-slate-700 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">לוח בקרה אישי</h1>
            <p className="text-slate-400 text-sm mt-1">ניהול נכסים, לידים והפצה</p>
          </div>
          <div className="flex gap-3">
              <button 
                onClick={() => { setActiveTab('properties'); setSelectedPropertyForLeads(null); }}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all border ${activeTab === 'properties' ? 'bg-brand-accent text-white border-brand-accent' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
              >
                  הנכסים שלי ({myProperties.length})
              </button>
              <button 
                onClick={() => { setActiveTab('leads'); setSelectedPropertyForLeads(null); }}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all border ${activeTab === 'leads' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
              >
                  לידים ({myLeads.length})
              </button>
              <button onClick={onCreateNew} className="bg-slate-100 hover:bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all">
                  + חדש
              </button>
          </div>
      </div>

      {activeTab === 'properties' ? (
          myProperties.length === 0 ? (
            <div className="text-center py-24 bg-slate-800/30 rounded-3xl border border-slate-700 border-dashed">
                <h3 className="text-xl font-bold text-slate-200 mb-4">עדיין לא יצרת דפי נחיתה</h3>
                <button onClick={onCreateNew} className="bg-brand-accent hover:bg-brand-accentHover text-white px-8 py-3 rounded-xl font-bold transition-all">
                    צור את הנכס הראשון שלך
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myProperties.map((prop) => {
                    const leadCount = getLeadCountForProperty(prop.id!);
                    return (
                        <div key={prop.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-brand-accent/50 transition-all flex flex-col h-full shadow-xl group">
                            <div className="h-48 overflow-hidden relative">
                                {prop.images && prop.images[0] ? (
                                    <img src={prop.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500">אין תמונה</div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <div className="bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-bold uppercase">
                                        {prop.features?.rooms || 'נכס'} חדרים
                                    </div>
                                    {leadCount > 0 && (
                                        <div className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1">
                                            <LeadsIcon />
                                            {leadCount} פניות
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{prop.generatedTitle}</h3>
                                <p className="text-slate-400 text-sm mb-3 line-clamp-1">{prop.address}</p>
                                <p className="text-brand-accent font-bold text-lg mb-6">{prop.price}</p>
                                
                                <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-700 pt-4">
                                    <a 
                                        href={`/${prop.slug}-${prop.id}`} 
                                        target="_blank"
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-center py-2 rounded-lg text-sm font-bold transition-all"
                                    >
                                        צפה
                                    </a>
                                    <button 
                                        onClick={() => onEdit(prop)}
                                        className="bg-slate-700 hover:bg-brand-accent text-white p-2 rounded-lg transition-all"
                                        title="ערוך"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button 
                                        onClick={() => { setActiveTab('leads'); setSelectedPropertyForLeads(prop.id!); }}
                                        className="bg-slate-700 hover:bg-blue-600 text-white p-2 rounded-lg transition-all"
                                        title="צפה בלידים"
                                    >
                                        <LeadsIcon />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(e, prop.id!)}
                                        disabled={isDeleting === prop.id}
                                        className="bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-lg transition-all"
                                        title="מחק"
                                    >
                                        {isDeleting === prop.id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <TrashIcon />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
          )
      ) : (
          /* Leads Tab */
          <div className="space-y-6">
              {selectedPropertyForLeads && (
                  <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex justify-between items-center animate-fade-in">
                      <p className="text-blue-200">
                          מציג פניות עבור: <span className="font-bold">{myProperties.find(p => p.id === selectedPropertyForLeads)?.generatedTitle}</span>
                      </p>
                      <button onClick={() => setSelectedPropertyForLeads(null)} className="text-sm text-blue-400 hover:text-white underline">הצג את כל הפניות</button>
                  </div>
              )}

              {filteredLeads.length === 0 ? (
                  <div className="text-center py-24 bg-slate-800/30 rounded-3xl border border-slate-700 border-dashed">
                      <h3 className="text-xl font-bold text-slate-200 mb-2">אין עדיין פניות מהאתר</h3>
                      <p className="text-slate-400">שתף את דפי הנחיתה שלך כדי להתחיל לקבל לידים!</p>
                  </div>
              ) : (
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
                      <table className="w-full text-right">
                          <thead className="bg-slate-700/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                              <tr>
                                  <th className="p-4">שם המתעניין</th>
                                  <th className="p-4">טלפון</th>
                                  <th className="p-4">נכס מבוקש</th>
                                  <th className="p-4">תאריך פנייה</th>
                                  <th className="p-4">פעולות</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                              {filteredLeads.map((lead) => (
                                  <tr key={lead.id} className="hover:bg-slate-700/30 transition-colors group">
                                      <td className="p-4 font-bold text-white">{lead.fullName}</td>
                                      <td className="p-4 text-slate-300 font-mono">{lead.phone}</td>
                                      <td className="p-4">
                                          <p className="text-slate-400 text-xs truncate max-w-[200px]">{lead.propertyTitle}</p>
                                      </td>
                                      <td className="p-4 text-slate-500 text-xs">
                                          {new Date(lead.createdAt).toLocaleDateString('he-IL')} {new Date(lead.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                      </td>
                                      <td className="p-4">
                                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <a 
                                                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} 
                                                target="_blank" 
                                                className="bg-[#25D366] text-white p-2 rounded-lg hover:scale-110 transition-transform"
                                                title="שלח וואטסאפ"
                                              >
                                                  <WhatsAppIconSmall />
                                              </a>
                                              <a 
                                                href={`tel:${lead.phone.replace(/\D/g, '')}`} 
                                                className="bg-slate-600 text-white p-2 rounded-lg hover:scale-110 transition-transform"
                                                title="חייג"
                                              >
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                              </a>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};