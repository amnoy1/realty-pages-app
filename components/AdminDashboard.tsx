
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { PropertyDetails, UserProfile, Lead } from '../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'properties' | 'users' | 'leads'>('properties');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [properties, setProperties] = useState<PropertyDetails[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-white text-center py-10">טוען לוח בקרה...</div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">ניהול מערכת (Admin)</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <StatCard title="משתמשים" value={users.length} color="blue" />
        <StatCard title="נכסים" value={properties.length} color="amber" />
        <StatCard title="לידים (סה״כ)" value={leads.length} color="green" />
        <StatCard title="לידים היום" value={leads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 mb-6 overflow-x-auto">
          <TabButton active={activeTab === 'properties'} onClick={() => setActiveTab('properties')} label="נכסים" />
          <TabButton active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} label="לידים (גלובלי)" />
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="משתמשים" />
      </div>

      {activeTab === 'properties' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-right text-sm">
                  <thead className="bg-slate-900 text-slate-400">
                      <tr>
                          <th className="p-4">נכס</th>
                          <th className="p-4">סוכן</th>
                          <th className="p-4">לידים</th>
                          <th className="p-4">תאריך יצירה</th>
                          <th className="p-4">פעולות</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                      {properties.map(p => (
                          <tr key={p.id} className="hover:bg-slate-700/30">
                              <td className="p-4 font-bold text-white">{p.generatedTitle}</td>
                              <td className="p-4 text-slate-300">{p.userEmail}</td>
                              <td className="p-4"><span className="bg-slate-700 px-2 py-1 rounded text-xs">{leads.filter(l => l.propertyId === p.id).length}</span></td>
                              <td className="p-4 text-slate-400">{new Date(p.createdAt || 0).toLocaleDateString('he-IL')}</td>
                              <td className="p-4"><a href={`/${p.slug}-${p.id}`} target="_blank" className="text-brand-accent">צפה</a></td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}

      {activeTab === 'leads' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-right text-sm">
                  <thead className="bg-slate-900 text-slate-400">
                      <tr>
                          <th className="p-4">תאריך</th>
                          <th className="p-4">שם מתעניין</th>
                          <th className="p-4">טלפון</th>
                          <th className="p-4">עבור נכס</th>
                          <th className="p-4">סוכן מטפל</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                      {leads.map(l => {
                          const agent = users.find(u => u.uid === l.ownerId);
                          return (
                              <tr key={l.id} className="hover:bg-slate-700/30">
                                  <td className="p-4 text-slate-400 text-xs">{new Date(l.createdAt).toLocaleString('he-IL')}</td>
                                  <td className="p-4 font-bold text-white">{l.fullName}</td>
                                  <td className="p-4 text-brand-accent font-mono">{l.phone}</td>
                                  <td className="p-4 text-slate-300 max-w-[150px] truncate">{l.propertyTitle}</td>
                                  <td className="p-4 text-slate-400">{agent?.displayName || agent?.email || 'אנונימי'}</td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      )}

      {activeTab === 'users' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-right text-sm">
                  <thead className="bg-slate-900 text-slate-400">
                      <tr>
                          <th className="p-4">משתמש</th>
                          <th className="p-4">אימייל</th>
                          <th className="p-4">נכסים</th>
                          <th className="p-4">התחברות אחרונה</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                      {users.map(u => (
                          <tr key={u.uid} className="hover:bg-slate-700/30">
                              <td className="p-4 flex items-center gap-2">
                                  {u.photoURL && <img src={u.photoURL} className="w-6 h-6 rounded-full" />}
                                  <span className="text-white font-bold">{u.displayName}</span>
                              </td>
                              <td className="p-4 text-slate-300">{u.email}</td>
                              <td className="p-4 text-slate-300">{properties.filter(p => p.userId === u.uid).length}</td>
                              <td className="p-4 text-slate-400 text-xs">{new Date(u.lastLogin).toLocaleDateString('he-IL')}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }: any) => (
    <div className={`bg-slate-800 p-6 rounded-2xl border-l-4 border-slate-700 shadow-xl border-${color}-500`}>
        <p className="text-slate-400 text-xs mb-1 uppercase font-bold tracking-wider">{title}</p>
        <p className="text-3xl font-black text-white">{value}</p>
    </div>
);

const TabButton = ({ active, onClick, label }: any) => (
    <button 
        onClick={onClick}
        className={`px-8 py-4 font-bold text-sm transition-all border-b-2 ${active ? 'border-brand-accent text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
        {label}
    </button>
);
