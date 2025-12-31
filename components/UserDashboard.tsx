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

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>;
const LeadsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>;

export const UserDashboard: React.FC<UserDashboardProps> = ({ userId, userEmail, onCreateNew, onEdit }) => {
  const [myProperties, setMyProperties] = useState<PropertyDetails[]>([]);
  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'properties' | 'leads'>('properties');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!db || !userId) return;
    setLoading(true);
    try {
      // שליפת נכסי המשתמש
      const qProps = query(collection(db, 'landingPages'), where('userId', '==', userId));
      const snapProps = await getDocs(qProps);
      const props = snapProps.docs.map(doc => ({ ...doc.data() as any, id: doc.id } as PropertyDetails));
      setMyProperties(props);

      // שליפת לידים ששייכים לסוכן הזה (לפי ownerId)
      const qLeads = query(collection(db, 'leads'), where('ownerId', '==', userId));
      const snapLeads = await getDocs(qLeads);
      const leads = snapLeads.docs.map(doc => ({ ...doc.data() as any, id: doc.id } as Lead));
      leads.sort((a, b) => b.createdAt - a.createdAt);
      setMyLeads(leads);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const filteredLeads = selectedPropertyId 
    ? myLeads.filter(l => l.propertyId === selectedPropertyId)
    : myLeads;

  if (loading) return <div className="text-center py-20 text-slate-400">טוען נתונים מהדאטה-בייס...</div>;

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-black text-white">הקאופיס שלי</h1>
            <p className="text-slate-400 text-sm mt-1">שלום, {userEmail}</p>
          </div>
          <div className="flex gap-2">
              <button 
                onClick={() => { setActiveTab('properties'); setSelectedPropertyId(null); }}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'properties' ? 'bg-brand-accent text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                  הנכסים שלי ({myProperties.length})
              </button>
              <button 
                onClick={() => setActiveTab('leads')}
                className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'leads' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                  <span>לידים</span>
                  {myLeads.length > 0 && <span className="bg-white text-blue-600 text-[10px] px-1.5 rounded-full">{myLeads.length}</span>}
              </button>
              <button onClick={onCreateNew} className="bg-white text-slate-900 px-6 py-2 rounded-xl font-bold hover:bg-slate-100 transition-all">
                  + דף חדש
              </button>
          </div>
      </div>

      {activeTab === 'properties' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProperties.map(prop => (
                  <div key={prop.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-brand-accent transition-all flex flex-col">
                      <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-white font-bold text-xl line-clamp-1">{prop.generatedTitle}</h3>
                            <span className="bg-blue-900/40 text-blue-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <LeadsIcon /> {myLeads.filter(l => l.propertyId === prop.id).length}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mb-4">{prop.address}</p>
                          <div className="flex gap-2">
                              <a href={`/${prop.slug}-${prop.id}`} target="_blank" className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-center py-2 rounded-lg text-sm font-bold">צפה בדף</a>
                              <button onClick={() => { setActiveTab('leads'); setSelectedPropertyId(prop.id!); }} className="bg-blue-900/40 hover:bg-blue-900 text-blue-400 p-2 rounded-lg transition-all" title="צפה בלידים"><LeadsIcon /></button>
                              <button onClick={() => onEdit(prop)} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-all"><EditIcon /></button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      ) : (
          <div className="animate-fade-in">
              {selectedPropertyId && (
                  <div className="bg-blue-900/20 p-3 rounded-xl mb-4 flex justify-between items-center">
                      <p className="text-blue-300 text-sm">מציג לידים עבור נכס ספציפי</p>
                      <button onClick={() => setSelectedPropertyId(null)} className="text-blue-400 text-xs underline">הצג את כולם</button>
                  </div>
              )}
              
              {filteredLeads.length === 0 ? (
                  <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
                      <p className="text-slate-500">אין לידים להצגה כרגע</p>
                  </div>
              ) : (
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
                      <table className="w-full text-right">
                          <thead className="bg-slate-900/50 text-slate-500 text-xs font-bold uppercase">
                              <tr>
                                  <th className="p-4">שם הליד</th>
                                  <th className="p-4">טלפון</th>
                                  <th className="p-4">נכס</th>
                                  <th className="p-4">תאריך</th>
                                  <th className="p-4">פעולות</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                              {filteredLeads.map(lead => (
                                  <tr key={lead.id} className="hover:bg-slate-700/20 transition-colors">
                                      <td className="p-4 font-bold text-white">{lead.fullName}</td>
                                      <td className="p-4 text-slate-300 font-mono">{lead.phone}</td>
                                      <td className="p-4 text-slate-400 text-xs truncate max-w-[200px]">{lead.propertyTitle}</td>
                                      <td className="p-4 text-slate-500 text-xs">{new Date(lead.createdAt).toLocaleDateString('he-IL')}</td>
                                      <td className="p-4">
                                          <a href={`tel:${lead.phone}`} className="text-brand-accent hover:underline text-xs font-bold">התקשר</a>
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

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
