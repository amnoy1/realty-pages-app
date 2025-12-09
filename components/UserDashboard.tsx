import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import type { PropertyDetails } from '../types';

interface UserDashboardProps {
    userId: string;
    onCreateNew: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ userId, onCreateNew }) => {
  const [myProperties, setMyProperties] = useState<PropertyDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProperties = async () => {
      if (!db) {
          console.error("Database not initialized");
          setLoading(false);
          return;
      }
      try {
        const q = query(
            collection(db, 'landingPages'), 
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const propsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PropertyDetails));
        setMyProperties(propsData);
      } catch (error) {
        console.error("Error fetching user properties:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchMyProperties();
  }, [userId]);

  const copyToClipboard = (slug: string, id: string) => {
    const url = `${window.location.origin}/p/${slug}-${id}`;
    navigator.clipboard.writeText(url);
    alert('הקישור הועתק ללוח');
  };

  if (loading) return <div className="text-white text-center py-10">טוען נכסים...</div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-bold text-white">הנכסים שלי</h1>
          <button onClick={onCreateNew} className="bg-brand-accent hover:bg-brand-accentHover text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all">
              + צור דף חדש
          </button>
      </div>

      {myProperties.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-700 border-dashed">
              <h3 className="text-xl text-slate-300 mb-4">עדיין לא יצרת דפי נחיתה</h3>
              <button onClick={onCreateNew} className="text-brand-accent hover:underline">צור את הדף הראשון שלך</button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProperties.map((prop) => (
                  <div key={prop.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-brand-accent/50 transition-all group">
                      <div className="h-48 overflow-hidden relative">
                          <img src={prop.images[0]} alt={prop.generatedTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                              {prop.features.rooms ? `${prop.features.rooms} חדרים` : 'נכס'}
                          </div>
                      </div>
                      <div className="p-5">
                          <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{prop.generatedTitle}</h3>
                          <p className="text-slate-400 text-sm mb-4">{prop.address}</p>
                          
                          <div className="flex gap-2 mt-4">
                              <a 
                                href={`/p/${prop.slug}-${prop.id}`} 
                                target="_blank"
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-center py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                  צפה בדף
                              </a>
                              <button 
                                onClick={() => copyToClipboard(prop.slug || '', prop.id || '')}
                                className="bg-slate-700 hover:bg-brand-accent text-white p-2 rounded-lg transition-colors"
                                title="העתק קישור"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
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