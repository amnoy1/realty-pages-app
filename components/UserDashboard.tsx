
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
      setProperties(pSnap.docs.map(d => ({ ...d.data(), id: d.id } as any)));

      const qL = query(collection(db, 'leads'), where('ownerId', '==', userId));
      const lSnap = await getDocs(qL);
      setLeads(lSnap.docs.map(d => ({ ...d.data(), id: d.id } as any)));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const viewLeads = (id: string) => {
    setFilterId(id);
    setActiveTab('leads');
  };

  const filteredLeads = filterId ? leads.filter(l => l.propertyId === filterId) : leads;
  const getAddress = (id: string) => properties.find(p => p.id === id)?.address || 'כתובת לא ידועה';

  if (loading) return <div className="text-center py-20">טוען נתונים...</div>;

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="flex gap-4 mb-8">
        <button onClick={() => { setActiveTab('properties'); setFilterId(null); }} className={`px-6 py-2 rounded-full font-bold ${activeTab === 'properties' ? 'bg-white text-slate-900' : 'text-slate-400'}`}>נכסים</button>
        <button onClick={() => setActiveTab('leads')} className={`px-6 py-2 rounded-full font-bold ${activeTab === 'leads' ? 'bg-white text-slate-900' : 'text-slate-400'}`}>לידים ({leads.length})</button>
      </div>

      {activeTab === 'properties' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map(p => (
            <div key={p.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
              <img src={p.images[0]} className="h-40 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-white line-clamp-1">{p.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{p.address}</p>
                <div className="flex gap-2">
                   <button onClick={() => viewLeads(p.id!)} className="flex-1 bg-brand-accent text-white py-2 rounded-lg flex items-center justify-center gap-2"><UsersIcon/> לידים</button>
                   <button onClick={() => onEdit(p)} className="p-2 bg-slate-700 text-white rounded-lg">ערוך</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          {filterId && (
            <div className="p-4 bg-brand-accent/20 flex justify-between items-center border-b border-white/10">
              <span className="font-bold text-brand-accent">מציג לידים עבור: {getAddress(filterId)}</span>
              <button onClick={() => setFilterId(null)} className="text-sm underline text-slate-400">הצג הכל</button>
            </div>
          )}
          <table className="w-full text-right">
            <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase">
              <tr>
                <th className="p-4">תאריך</th>
                <th className="p-4">שם</th>
                <th className="p-4">טלפון</th>
                <th className="p-4">כתובת הנכס</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(l => (
                <tr key={l.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="p-4 text-xs text-slate-500">{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-white font-bold">{l.fullName}</td>
                  <td className="p-4 text-brand-accent">{l.phone}</td>
                  <td className="p-4 text-slate-300 text-sm">{getAddress(l.propertyId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
