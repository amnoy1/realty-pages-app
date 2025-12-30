import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import type { PropertyDetails } from '../types';

interface UserDashboardProps {
    userId: string;
    userEmail?: string | null;
    onCreateNew: () => void;
    onEdit: (property: PropertyDetails) => void;
}

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;

export const UserDashboard: React.FC<UserDashboardProps> = ({ userId, userEmail, onCreateNew, onEdit }) => {
  const [myProperties, setMyProperties] = useState<PropertyDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchMyProperties = async () => {
    if (!db || !userId) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'landingPages'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ ...doc.data() as any, id: doc.id } as PropertyDetails));
      results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setMyProperties(results);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, [userId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
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

  if (loading) return (
    <div className="text-white text-center py-20 animate-pulse">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
      <p>טוען את הנכסים שלך...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">הנכסים שלי</h1>
            <p className="text-slate-400 text-sm mt-1">ניהול, עריכה והפצה</p>
          </div>
          <button onClick={onCreateNew} className="bg-brand-accent hover:bg-brand-accentHover text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all border border-white/10">
              + צור דף חדש
          </button>
      </div>

      {myProperties.length === 0 ? (
          <div className="text-center py-24 bg-slate-800/30 rounded-3xl border border-slate-700 border-dashed">
              <h3 className="text-xl font-bold text-slate-200 mb-4">עדיין לא יצרת דפי נחיתה</h3>
              <button onClick={onCreateNew} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-bold transition-all">
                  צור את הנכס הראשון שלך
              </button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myProperties.map((prop) => (
                  <div key={prop.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-brand-accent/50 transition-all flex flex-col h-full shadow-xl relative group">
                      <div className="h-48 overflow-hidden relative">
                          {prop.images && prop.images[0] ? (
                              <img src={prop.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                              <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500">אין תמונה</div>
                          )}
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-bold uppercase">
                              {prop.features?.rooms || 'נכס'} חדרים
                          </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{prop.generatedTitle}</h3>
                          <p className="text-slate-400 text-sm mb-4 line-clamp-1">{prop.address}</p>
                          <p className="text-brand-accent font-bold text-lg mb-6">{prop.price}</p>
                          
                          <div className="mt-auto flex gap-2 border-t border-slate-700 pt-4">
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
              ))}
          </div>
      )}
    </div>
  );
};