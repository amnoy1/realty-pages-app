import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { PropertyDetails, UserProfile } from '../types';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [properties, setProperties] = useState<PropertyDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!db) {
          console.error("Database not initialized");
          setLoading(false);
          return;
      }
      try {
        // Fetch Users
        const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('lastLogin', 'desc')));
        const usersData = usersSnap.docs.map(doc => ({ ...doc.data() as any, uid: doc.id } as UserProfile));
        setUsers(usersData);

        // Fetch Properties
        const propsSnap = await getDocs(query(collection(db, 'landingPages'), orderBy('createdAt', 'desc')));
        const propsData = propsSnap.docs.map(doc => ({ ...doc.data() as any, id: doc.id } as PropertyDetails));
        setProperties(propsData);

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-white text-center py-10">טוען נתונים...</div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">לוח בקרה - מנהל מערכת</h1>
      
      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">משתמשים רשומים</h3>
            <p className="text-4xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">סה"כ נכסים שנוצרו</h3>
            <p className="text-4xl font-bold text-brand-accent">{properties.length}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">נכס אחרון שנוצר</h3>
            <p className="text-lg font-medium text-white truncate">{properties[0]?.generatedTitle || '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Properties Table */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
             <div className="p-4 bg-slate-800 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">כל הנכסים במערכת</h2>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-right">
                     <thead className="text-slate-400 bg-slate-700/50">
                         <tr>
                             <th className="p-3">כותרת</th>
                             <th className="p-3">נוצר ע"י</th>
                             <th className="p-3">תאריך</th>
                             <th className="p-3">פעולות</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-700">
                         {properties.map(prop => (
                             <tr key={prop.id} className="hover:bg-slate-700/30 transition-colors">
                                 <td className="p-3 font-medium text-white max-w-[200px] truncate">{prop.generatedTitle}</td>
                                 <td className="p-3 text-slate-300">{prop.userEmail || 'אנונימי'}</td>
                                 <td className="p-3 text-slate-400">{prop.createdAt ? new Date(prop.createdAt).toLocaleDateString('he-IL') : '-'}</td>
                                 <td className="p-3">
                                     <a href={`/p/${prop.slug}-${prop.id}`} target="_blank" className="text-brand-accent hover:text-white transition-colors">צפה</a>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
             <div className="p-4 bg-slate-800 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">משתמשים</h2>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-right">
                     <thead className="text-slate-400 bg-slate-700/50">
                         <tr>
                             <th className="p-3">משתמש</th>
                             <th className="p-3">אימייל</th>
                             <th className="p-3">תפקיד</th>
                             <th className="p-3">התחברות אחרונה</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-700">
                         {users.map(user => (
                             <tr key={user.uid} className="hover:bg-slate-700/30 transition-colors">
                                 <td className="p-3 flex items-center gap-2">
                                     {user.photoURL && <img src={user.photoURL} className="w-6 h-6 rounded-full" />}
                                     <span className="text-white">{user.displayName}</span>
                                 </td>
                                 <td className="p-3 text-slate-300">{user.email}</td>
                                 <td className="p-3">
                                     <span className={`px-2 py-0.5 rounded text-xs ${user.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-slate-700 text-slate-300'}`}>
                                         {user.role}
                                     </span>
                                 </td>
                                 <td className="p-3 text-slate-400">{new Date(user.lastLogin).toLocaleDateString('he-IL')}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>
      </div>
    </div>
  );
};