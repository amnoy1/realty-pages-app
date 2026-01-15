
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import type { PropertyDetails, Lead } from '../types';

interface UserDashboardProps {
    userId: string;
    userEmail?: string | null;
    onCreateNew: () => void;
    onEdit: (property: PropertyDetails) => void;
}

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

export const UserDashboard: React.FC<UserDashboardProps> = ({ userId, userEmail, onCreateNew, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'leads'>('properties');
  const [properties, setProperties] = useState<PropertyDetails[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterId, setFilterId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!db || !userId) return;
    setLoading(true);
    try {
      const qP = query(collection(db, 'landingPages'), where('userId', '==', userId));
      const pSnap = await getDocs(qP);
      const fetchedProps = pSnap.docs.map(d => ({ ...(d.data() as object), id: d.id } as PropertyDetails));
      setProperties(fetchedProps);

      const qL = query(collection(db, 'leads'), where('ownerId', '==', userId));
      const lSnap = await getDocs(qL);
      setLeads(lSnap.docs.map(d => ({ ...(d.data() as object), id: d.id } as Lead)));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const viewLeadsForProperty = (id: string) => {
    setFilterId(id);
    setActiveTab('leads');
  };

  const filteredLeads = filterId ? leads.filter(l => l.propertyId === filterId) : leads;
  
  const getPropertyAddress = (id: string) => {
    const prop = properties.find(p => p.id === id);
    return prop ? prop.address : 'נכס לא נמצא';
  };

  if (loading) return (
    <div className="text-center py-20 flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">טוען את הנתונים שלך...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => { setActiveTab('properties'); setFilterId(null); }} 
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'properties' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          הנכסים שלי
        </button>
        <button 
          onClick={() => setActiveTab('leads')} 
          className={`px-8 py-3 rounded-xl font-bold transition-all relative ${activeTab === 'leads' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          לידים נכנסים ({leads.length})
          {leads.length > 0 && activeTab !== 'leads' && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                  {leads.length}
              </span>
          )}
        </button>
      </div>

      {activeTab === 'properties' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-700 rounded-3xl">
                  <p className="text-slate-500 text-xl">עדיין לא יצרת נכסים.</p>
                  <button onClick={onCreateNew} className="mt-4 text-brand-accent font-bold hover:underline">צור את הנכס הראשון שלך עכשיו</button>
              </div>
          ) : properties.map(p => (
            <div key={p.id} className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700 hover:border-brand-accent/50 transition-all shadow-lg group">
              <div className="relative h-48">
                <img src={p.images[0]} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-4 right-4 left-4">
                    <h3 className="font-bold text-white text-lg line-clamp-1">{p.generatedTitle}</h3>
                    <p className="text-slate-300 text-sm line-clamp-1">{p.address}</p>
                </div>
              </div>
              <div className="p-4 flex gap-2">
                   <button 
                    onClick={() => viewLeadsForProperty(p.id!)} 
                    className="flex-1 bg-brand-accent hover:bg-brand-accentHover text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors"
                   >
                     <UsersIcon/> לידים
                   </button>
                   <button onClick={() => onEdit(p)} className="px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-bold">ערוך</button>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
          {filterId && (
            <div className="p-5 bg-brand-accent/10 flex justify-between items-center border-b border-white/10">
              <span className="font-bold text-brand-accent flex items-center gap-2">
                  <UsersIcon />
                  מציג לידים עבור: {getPropertyAddress(filterId)}
              </span>
              <button onClick={() => setFilterId(null)} className="text-sm font-bold text-slate-400 hover:text-white underline">הצג את כל הלידים</button>
            </div>
          )}
          
          <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-widest font-black">
                  <tr>
                    <th className="p-5">תאריך</th>
                    <th className="p-5">שם המתעניין</th>
                    <th className="p-5">טלפון</th>
                    <th className="p-5">כתובת הנכס</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredLeads.length === 0 ? (
                      <tr>
                          <td colSpan={4} className="p-20 text-center text-slate-500 italic">לא נמצאו לידים להצגה.</td>
                      </tr>
                  ) : filteredLeads.map(l => (
                    <tr key={l.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-5 text-xs text-slate-500">{new Date(l.createdAt).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="p-5 text-white font-bold">{l.fullName}</td>
                      <td className="p-5">
                          <a href={`tel:${l.phone}`} className="text-brand-accent hover:underline font-mono">{l.phone}</a>
                      </td>
                      <td className="p-5 text-slate-300 text-sm max-w-[300px] truncate" title={getPropertyAddress(l.propertyId)}>
                        {getPropertyAddress(l.propertyId)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
      )}
    </div>
  );
};
