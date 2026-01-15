
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { PropertyDetails, UserProfile, Lead } from '../types';

// --- Icons ---
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>;

const StatCard = ({ title, value, color, status }: { title: string, value: number, color: string, status: 'loading' | 'success' | 'error' }) => {
    const borders: Record<string, string> = {
        blue: "border-blue-500 bg-blue-500/10",
        amber: "border-amber-500 bg-amber-500/10",
        green: "border-green-500 bg-green-500/10",
        purple: "border-purple-500 bg-purple-500/10"
    };
    return (
        <div className={`p-6 rounded-3xl border border-slate-700 border-b-4 ${borders[color]} shadow-xl flex flex-col items-center text-center transition-all relative overflow-hidden`}>
            {status === 'loading' && <div className="absolute top-2 left-2 animate-spin w-3 h-3 border-2 border-white/20 border-t-white rounded-full"></div>}
            {status === 'error' && <div className="absolute top-2 left-2"><AlertIcon /></div>}
            {status === 'success' && <div className="absolute top-2 left-2"><CheckIcon /></div>}
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">{title}</p>
            <p className="text-4xl font-black text-white">{status === 'error' ? '?' : value}</p>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'properties' | 'users' | 'leads'>('properties');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [properties, setProperties] = useState<PropertyDetails[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  
  const [status, setStatus] = useState({
      users: 'loading' as 'loading' | 'success' | 'error',
      properties: 'loading' as 'loading' | 'success' | 'error',
      leads: 'loading' as 'loading' | 'success' | 'error'
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // שימוש ב-Generics כדי להבטיח טיפוסים תקינים
  const fetchCollection = async <T,>(collectionName: string, idField: string): Promise<T[] | null> => {
      if (!db) return null;
      try {
          const snap = await getDocs(collection(db, collectionName));
          const data = snap.docs.map(doc => ({
              ...doc.data(),
              [idField]: doc.id
          })) as T[];
          console.log(`[Admin] Fetched ${data.length} items from ${collectionName}`);
          return data;
      } catch (err: any) {
          console.error(`[Admin] Error fetching ${collectionName}:`, err);
          return null;
      }
  };

  const loadAllData = async () => {
    setErrorMsg(null);
    setStatus({ users: 'loading', properties: 'loading', leads: 'loading' });

    try {
        const uData = await fetchCollection<UserProfile>('users', 'uid');
        const pData = await fetchCollection<PropertyDetails>('landingPages', 'id');
        const lData = await fetchCollection<Lead>('leads', 'id');

        if (uData) {
            setUsers([...uData].sort((a, b) => (b.lastLogin || 0) - (a.lastLogin || 0)));
            setStatus(s => ({ ...s, users: 'success' }));
        } else {
            setStatus(s => ({ ...s, users: 'error' }));
        }

        if (pData) {
            setProperties([...pData].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
            setStatus(s => ({ ...s, properties: 'success' }));
        } else {
            setStatus(s => ({ ...s, properties: 'error' }));
        }

        if (lData) {
            setLeads([...lData].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
            setStatus(s => ({ ...s, leads: 'success' }));
        } else {
            setStatus(s => ({ ...s, leads: 'error' }));
        }

        if (!uData && !pData && !lData) {
            setErrorMsg("לא ניתן היה לשלוף אף קולקשן. וודא שחוקי האבטחה (Rules) מאפשרים 'list' לכל הקולקשנים.");
        }
    } catch (globalErr) {
        console.error("Global fetch error in Admin:", globalErr);
        setErrorMsg("אירעה שגיאה בלתי צפויה בטעינת הנתונים.");
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in" dir="rtl">
      <div className="flex justify-between items-end mb-10 border-b border-slate-700 pb-6">
        <div>
            <h1 className="text-4xl font-black text-white">דשבורד ניהול מערכת</h1>
            <p className="text-slate-400 mt-2">תצוגת מנהל - סנכרון נתונים מלא מהדאטה-בייס</p>
        </div>
        <button onClick={loadAllData} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold border border-slate-600 transition-all flex items-center gap-2">
            <RefreshIcon />
            רענן הכל
        </button>
      </div>

      {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-6 rounded-3xl mb-8 flex flex-col items-center gap-4">
              <div className="text-center font-bold">{errorMsg}</div>
              <div className="text-xs bg-black/40 p-4 rounded-xl font-mono text-left w-full overflow-x-auto">
                  allow read, write: if request.auth != null; // וודא שזה מופיע ב-Firestore Rules
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="סוכנים" value={users.length} color="blue" status={status.users} />
        <StatCard title="דפי נחיתה" value={properties.length} color="amber" status={status.properties} />
        <StatCard title="לידים (סה״כ)" value={leads.length} color="green" status={status.leads} />
        <StatCard title="לידים חדשים (24ש)" value={leads.filter(l => Date.now() - l.createdAt < 86400000).length} color="purple" status={status.leads} />
      </div>

      <div className="flex bg-slate-800/50 p-1.5 rounded-2xl mb-8 w-fit border border-slate-700 shadow-xl">
          <TabButton active={activeTab === 'properties'} onClick={() => setActiveTab('properties')} label="נכסים" count={properties.length} status={status.properties} />
          <TabButton active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} label="לידים" count={leads.length} status={status.leads} />
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="משתמשים" count={users.length} status={status.users} />
      </div>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
          {activeTab === 'properties' && <DataTable 
              headers={['נכס', 'כתובת', 'סוכן', 'תאריך']} 
              data={properties} 
              status={status.properties}
              renderRow={(p: PropertyDetails) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors border-b border-slate-700/50">
                      <td className="p-4 font-bold text-white">{p.generatedTitle}</td>
                      <td className="p-4 text-slate-300">{p.address}</td>
                      <td className="p-4 text-slate-400 text-xs">{p.userEmail}</td>
                      <td className="p-4 text-slate-500 text-xs">{new Date(p.createdAt || 0).toLocaleDateString('he-IL')}</td>
                  </tr>
              )}
          />}

          {activeTab === 'leads' && <DataTable 
              headers={['תאריך', 'שם', 'טלפון', 'נכס']} 
              data={leads} 
              status={status.leads}
              renderRow={(l: Lead) => (
                  <tr key={l.id} className="hover:bg-white/5 transition-colors border-b border-slate-700/50">
                      <td className="p-4 text-slate-500 text-xs">{new Date(l.createdAt).toLocaleString('he-IL')}</td>
                      <td className="p-4 font-bold text-white">{l.fullName}</td>
                      <td className="p-4 text-brand-accent font-bold">{l.phone}</td>
                      <td className="p-4 text-slate-300 truncate max-w-[200px]">{l.propertyTitle}</td>
                  </tr>
              )}
          />}

          {activeTab === 'users' && <DataTable 
              headers={['סוכן', 'אימייל', 'נכסים', 'פעילות']} 
              data={users} 
              status={status.users}
              renderRow={(u: UserProfile) => (
                  <tr key={u.uid} className="hover:bg-white/5 transition-colors border-b border-slate-700/50">
                      <td className="p-4 flex items-center gap-3">
                          <img src={u.photoURL || ''} className="w-8 h-8 rounded-full bg-slate-700" alt="" />
                          <span className="font-bold text-white">{u.displayName || 'סוכן'}</span>
                      </td>
                      <td className="p-4 text-slate-400">{u.email}</td>
                      <td className="p-4"><span className="bg-slate-700 px-2 py-1 rounded-lg text-xs">{properties.filter(p => p.userId === u.uid).length}</span></td>
                      <td className="p-4 text-slate-500 text-xs">{new Date(u.lastLogin).toLocaleString('he-IL')}</td>
                  </tr>
              )}
          />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label, count, status }: any) => (
    <button onClick={onClick} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${active ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
        {label}
        {status === 'success' && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-slate-900 text-white' : 'bg-slate-700 text-slate-300'}`}>{count}</span>}
        {status === 'error' && <AlertIcon />}
    </button>
);

const DataTable = ({ headers, data, renderRow, status }: any) => {
    if (status === 'loading') return <div className="p-20 text-center text-slate-500 animate-pulse">טוען נתונים...</div>;
    if (status === 'error') return <div className="p-20 text-center text-red-400 italic">שגיאת הרשאות בשליפת המידע</div>;
    if (data.length === 0) return <div className="p-20 text-center text-slate-500 italic">לא נמצאו נתונים בקולקשן</div>;
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase">
                    <tr>{headers.map((h: string) => <th key={h} className="p-4 font-black">{h}</th>)}</tr>
                </thead>
                <tbody>{data.map(renderRow)}</tbody>
            </table>
        </div>
    );
};
