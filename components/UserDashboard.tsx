
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

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

export const UserDashboard: React.FC<UserDashboardProps> = ({ userId, userEmail, onCreateNew, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'leads'>('properties');
  const [myProperties, setMyProperties] = useState<PropertyDetails[]>([]);
  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [filterId, setFilterId] = useState<string | null>(null);
  const [lastViewedLeads, setLastViewedLeads] = useState<number>(0);

  useEffect(() => {
    const savedTime = localStorage.getItem(`lastViewedLeads_${userId}`);
    if (savedTime) setLastViewedLeads(parseInt(savedTime));
  }, [userId]);

  const fetchData = async () => {
    if (!db || !userId) return;
    setLoading(true);
    try {
      const qProps = query(collection(db, 'landingPages'), where('userId', '==', userId));
      const propSnap = await getDocs(qProps);
      const props = propSnap.docs.map(doc => ({ ...doc.data() as object, id: doc.id } as PropertyDetails));
      setMyProperties(props.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));

      const qLeads = query(collection(db, 'leads'), where('ownerId', '==', userId));
      const leadSnap = await getDocs(qLeads);
      const leads = leadSnap.docs.map(doc => ({ ...doc.data() as object, id: doc.id } as Lead));
      setMyLeads(leads.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const handleTabChange = (tab: 'properties' | 'leads') => {
    setActiveTab(tab);
    if (tab === 'leads') {
      const now = Date.now();
      // נשמור את ה-timestamp רגע לפני העדכון כדי שנוכל להציג את הלידים כ"נקראו" עכשיו
      localStorage.setItem(`lastViewedLeads_${userId}`, now.toString());
      // אנחנו לא מעדכנים את ה-State מיד כדי שהמשתמש יראה את הצבע משתנה בזמן אמת בטאב
      setLastViewedLeads(now);
    }
  };

  const handleDeleteProperty = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!db || !window.confirm('האם למחוק את הדף?')) return;
    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, 'landingPages', id));
      setMyProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) { alert("שגיאה במחיקה"); }
    finally { setIsDeleting(null); }
  };

  const openLeadsForProperty = (id: string) => {
    setFilterId(id);
    handleTabChange('leads');
  };

  const getAddress = (id: string) => {
    const p = myProperties.find(item => item.id === id);
    return p ? p.address : 'כתובת לא ידועה';
  };

  const filteredLeads = filterId ? myLeads.filter(l => l.propertyId === filterId) : myLeads;
  
  // לידים "חדשים" באמת - כאלו שנוצרו מאז הצפייה האחרונה (לפני הטאב הנוכחי)
  // לצורך הבאדג' האדום: נשתמש בערך שנשמר ב-LocalStorage בטעינה
  const lastSavedTime = parseInt(localStorage.getItem(`lastViewedLeads_${userId}`) || "0");
  const unreadLeadsCount = myLeads.filter(l => l.createdAt > lastSavedTime).length;
  
  // לידים מה-24 שעות האחרונות
  const recentLeadsCount = myLeads.filter(l => l.createdAt >= (Date.now() - 24 * 60 * 60 * 1000)).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-accent border-t-transparent mb-4"></div>
      <p className="text-slate-400 font-sans">טוען את הנתונים שלך...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-6">
          <h1 className="text-2xl font-bold text-white font-sans">שלום, {userEmail?.split('@')[0]}</h1>
          <button onClick={onCreateNew} className="bg-brand-accent hover:bg-brand-accentHover text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all font-sans">+ נכס חדש</button>
      </div>

      <div className="flex gap-4 mb-8">
          <button onClick={() => { handleTabChange('properties'); setFilterId(null); }} className={`px-6 py-2 rounded-xl font-bold transition-all font-sans ${activeTab === 'properties' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>הנכסים שלי ({myProperties.length})</button>
          <button onClick={() => handleTabChange('leads')} className={`relative px-6 py-2 rounded-xl font-bold transition-all font-sans ${activeTab === 'leads' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            לידים נכנסים ({myLeads.length})
            {/* באדג' אדום - רק אם לא נכנסנו לטאב הלידים עדיין */}
            {unreadLeadsCount > 0 && activeTab !== 'leads' && (
              <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white shadow-lg animate-bounce border border-white/20 font-black">
                {unreadLeadsCount}
              </span>
            )}
            {/* באדג' כתום - אם כבר נכנסנו לטאב או שאין לידים חדשים מחייבים, אבל יש לידים מה-24 שעות האחרונות */}
            {(unreadLeadsCount === 0 || activeTab === 'leads') && recentLeadsCount > 0 && (
              <span className={`absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-white shadow-md border border-white/10 font-bold transition-colors ${activeTab === 'leads' ? 'bg-brand-accent/50' : 'bg-brand-accent'}`}>
                {recentLeadsCount}
              </span>
            )}
          </button>
      </div>

      {activeTab === 'properties' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProperties.map((prop) => {
            const propertyLeads = myLeads.filter(l => l.propertyId === prop.id);
            const propertyNewLeads = propertyLeads.filter(l => l.createdAt > lastSavedTime).length;

            return (
              <div key={prop.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-brand-accent/50 transition-all shadow-xl group">
                <div className="h-44 relative overflow-hidden">
                  <img src={prop.images[0] || ''} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button 
                      onClick={() => openLeadsForProperty(prop.id!)}
                      className={`text-[10px] px-2.5 py-1.5 rounded-lg font-bold shadow-lg flex items-center gap-1.5 transition-colors font-sans ${propertyNewLeads > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-brand-accent hover:bg-brand-accentHover text-white'}`}
                    >
                      <UsersIcon /> {propertyLeads.length} לידים {propertyNewLeads > 0 && `(${propertyNewLeads} חדשים!)`}
                    </button>
                  </div>
                </div>
                <div className="p-5 font-sans">
                  <h3 className="text-white font-bold line-clamp-1 mb-1">{prop.generatedTitle}</h3>
                  <p className="text-slate-400 text-xs mb-4 line-clamp-1">{prop.address}</p>
                  <div className="flex gap-2">
                    <a href={`/${prop.slug}-${prop.id}`} target="_blank" className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-center py-2 rounded-lg text-sm font-bold">צפה</a>
                    <button onClick={() => onEdit(prop)} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"><EditIcon /></button>
                    <button onClick={(e) => handleDeleteProperty(e, prop.id!)} disabled={isDeleting === prop.id} className="p-2 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors"><TrashIcon /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl animate-fade-in">
          {filterId && (
            <div className="p-4 bg-brand-accent/10 border-b border-slate-700 flex justify-between items-center font-sans">
              <span className="text-brand-accent font-bold text-sm flex items-center gap-2"><UsersIcon /> לידים עבור: {getAddress(filterId)}</span>
              <button onClick={() => setFilterId(null)} className="text-xs text-slate-400 hover:text-white underline">הצג את כל הלידים</button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm font-sans">
              <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="p-4">סטטוס</th>
                  <th className="p-4">תאריך פנייה</th>
                  <th className="p-4">שם הלקוח</th>
                  <th className="p-4">טלפון</th>
                  <th className="p-4">כתובת הנכס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredLeads.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-slate-500 italic">לא נמצאו לידים</td></tr>
                ) : (
                  filteredLeads.map((lead) => {
                    // ליד נחשב "חדש" רק אם הוא נוצר אחרי ה-timestamp ששמרנו לפני המעבר הנוכחי לטאב
                    const isNew = lead.createdAt > lastSavedTime;
                    return (
                      <tr key={lead.id} className={`hover:bg-slate-700/30 transition-colors ${isNew ? 'bg-brand-accent/5' : ''}`}>
                        <td className="p-4">
                            {isNew ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-accent text-white shadow-sm animate-pulse">נצפה עכשיו</span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-700 text-slate-400">טופל</span>
                            )}
                        </td>
                        <td className="p-4 text-slate-400 text-xs">
                          {new Date(lead.createdAt).toLocaleDateString('he-IL')} {new Date(lead.createdAt).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="p-4 font-bold text-white">{lead.fullName}</td>
                        <td className="p-4"><a href={`tel:${lead.phone}`} className="text-brand-accent hover:underline flex items-center gap-2 font-bold"><PhoneIcon /> {lead.phone}</a></td>
                        <td className="p-4 text-slate-300 truncate max-w-[200px]">{getAddress(lead.propertyId)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
