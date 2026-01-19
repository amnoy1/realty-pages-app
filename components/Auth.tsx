
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { signInWithPopup, signOut, auth, GoogleAuthProvider, initializationError, db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AuthProps {
  user: User | null;
  isAdmin: boolean;
  onViewChange: (view: 'create' | 'dashboard' | 'admin') => void;
  currentView: string;
}

export const Auth: React.FC<AuthProps> = ({ user, isAdmin, onViewChange, currentView }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  
  // בדיקת לידים חדשים (מה-24 שעות האחרונות)
  useEffect(() => {
    if (user && db) {
      const fetchNewLeads = async () => {
        try {
          const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
          // שימוש ב-db! כדי לפתור את שגיאת ה-TypeScript
          const q = query(
            collection(db!, 'leads'),
            where('ownerId', '==', user.uid),
            where('createdAt', '>=', oneDayAgo)
          );
          const snap = await getDocs(q);
          setNewLeadsCount(snap.size);
        } catch (e) {
          console.error("Error fetching new leads count:", e);
        }
      };
      fetchNewLeads();
      const interval = setInterval(fetchNewLeads, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogin = async () => {
    if (!auth) {
      let errorMsg = "מערכת האימות (Auth) לא אותחלה.";
      if (initializationError) {
          errorMsg += `\nשגיאת Firebase: ${initializationError}`;
      } else {
          errorMsg += "\nסיבה: מפתחות Firebase חסרים.";
      }
      alert(errorMsg);
      return;
    }

    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login attempt failed:", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        alert(`התחברות נכשלה: ${error.message || 'שגיאה לא ידועה'}`);
      }
    } finally {
        setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      onViewChange('create');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-3 bg-slate-800/90 backdrop-blur-md p-2 pr-4 pl-2 rounded-full border border-slate-700 shadow-lg animate-fade-in">
           <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-bold text-white leading-none">{user.displayName}</span>
              <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{isAdmin ? 'מנהל מערכת' : 'סוכן רשום'}</span>
           </div>
           
           {user.photoURL ? (
             <img src={user.photoURL} alt={user.displayName || 'User'} className="w-9 h-9 rounded-full border-2 border-slate-600 object-cover" />
           ) : (
             <div className="w-9 h-9 rounded-full bg-brand-accent flex items-center justify-center text-white font-bold shadow-inner">
               {user.displayName?.charAt(0) || 'U'}
             </div>
           )}
           
           <div className="h-6 w-px bg-slate-600 mx-1"></div>

           <div className="flex items-center gap-1">
             {isAdmin && (
                <button 
                  onClick={() => onViewChange('admin')}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all font-bold ${currentView === 'admin' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
                >
                  אדמין
                </button>
             )}
             
             <button 
                onClick={() => onViewChange('dashboard')}
                className={`relative text-xs px-3 py-1.5 rounded-lg transition-all font-bold ${currentView === 'dashboard' ? 'bg-brand-accent text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
             >
                הנכסים שלי
                {newLeadsCount > 0 && (
                  <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white shadow-lg animate-bounce border border-white/20 font-black">
                    {newLeadsCount}
                  </span>
                )}
             </button>

             <button 
                onClick={() => onViewChange('create')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all font-bold ${currentView === 'create' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
             >
                חדש
             </button>

             <button 
               onClick={handleLogout}
               className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 px-2 py-1.5 rounded-lg transition-colors ml-1"
               title="התנתק"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
             </button>
           </div>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-full font-bold hover:bg-slate-100 transition-all shadow-lg"
        >
          {isLoggingIn ? 'מתחבר...' : 'התחבר עם Google'}
        </button>
      )}
    </div>
  );
};
