
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  signInWithPopup, 
  signOut, 
  auth, 
  GoogleAuthProvider, 
  initializationError, 
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as gtag from '../lib/gtag';

interface AuthProps {
  user: User | null;
  isAdmin: boolean;
  onViewChange: (view: 'create' | 'dashboard' | 'admin') => void;
  currentView: string;
  mode?: 'compact' | 'full';
}

export const Auth: React.FC<AuthProps> = ({ user, isAdmin, onViewChange, currentView, mode = 'compact' }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  
  // Email/Password state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // בדיקת לידים חדשים (מה-24 שעות האחרונות)
  useEffect(() => {
    if (user && db) {
      const fetchNewLeads = async () => {
        try {
          const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
          const q = query(
            collection(db!, 'leads'),
            where('ownerId', '==', user.uid)
          );
          const snap = await getDocs(q);
          const newLeads = snap.docs.filter(doc => {
            const data = doc.data();
            return data.createdAt && data.createdAt >= oneDayAgo;
          });
          setNewLeadsCount(newLeads.length);
        } catch (e) {
          console.error("Error fetching new leads count:", e);
        }
      };
      fetchNewLeads();
      const interval = setInterval(fetchNewLeads, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleGoogleLogin = async () => {
    if (!auth) {
      alert("מערכת האימות לא אותחלה.");
      return;
    }

    setIsLoggingIn(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      gtag.event({
        action: 'login',
        category: 'auth',
        label: 'google'
      });
    } catch (error: any) {
      console.error("Google login failed:", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(`התחברות נכשלה: ${error.message}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    
    setIsLoggingIn(true);
    setError(null);
    
    try {
      if (authMode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        gtag.event({
          action: 'sign_up',
          category: 'auth',
          label: 'email'
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        gtag.event({
          action: 'login',
          category: 'auth',
          label: 'email'
        });
      }
    } catch (error: any) {
      console.error("Email auth failed:", error);
      let msg = "שגיאה בתהליך האימות";
      if (error.code === 'auth/user-not-found') msg = "משתמש לא נמצא";
      else if (error.code === 'auth/wrong-password') msg = "סיסמה שגויה";
      else if (error.code === 'auth/email-already-in-use') msg = "האימייל כבר רשום במערכת";
      else if (error.code === 'auth/weak-password') msg = "הסיסמה חלשה מדי (לפחות 6 תווים)";
      setError(msg);
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

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-slate-800/90 backdrop-blur-md p-2 pr-4 pl-2 rounded-full border border-slate-700 shadow-lg animate-fade-in">
           <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-bold text-white leading-none">{user.displayName || user.email}</span>
              <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{isAdmin ? 'מנהל מערכת' : 'סוכן רשום'}</span>
           </div>
           
           {user.photoURL ? (
             <img src={user.photoURL} alt={user.displayName || 'User'} className="w-9 h-9 rounded-full border-2 border-slate-600 object-cover" />
           ) : (
             <div className="w-9 h-9 rounded-full bg-brand-accent flex items-center justify-center text-white font-bold shadow-inner">
               {(user.displayName || user.email)?.charAt(0).toUpperCase() || 'U'}
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
      </div>
    );
  }

  if (mode === 'compact') {
    return (
      <button 
        onClick={handleGoogleLogin}
        disabled={isLoggingIn}
        className="flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-full font-bold hover:bg-slate-100 transition-all shadow-lg"
      >
        {isLoggingIn ? 'מתחבר...' : 'התחבר עם Google'}
      </button>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 animate-fade-in text-right">
      <h2 className="text-2xl font-black text-white mb-2 text-center">
        {authMode === 'login' ? 'ברוכים הבאים' : 'הרשמה למערכת'}
      </h2>
      <p className="text-slate-400 mb-8 text-center text-sm">
        {authMode === 'login' ? 'התחבר כדי לנהל את דפי הנחיתה שלך' : 'צור חשבון והתחל לייצר דפי נחיתה מקצועיים'}
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {authMode === 'register' && (
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 mr-1">שם מלא</label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ישראל ישראלי"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-brand-accent transition-all"
              required
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 mr-1">אימייל</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-brand-accent transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 mr-1">סיסמה</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-brand-accent transition-all"
            required
            minLength={6}
          />
        </div>

        <button 
          type="submit"
          disabled={isLoggingIn}
          className="w-full bg-brand-accent hover:bg-brand-accentHover text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {isLoggingIn ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            authMode === 'login' ? 'התחבר' : 'צור חשבון'
          )}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-800 px-2 text-slate-500">או באמצעות</span>
        </div>
      </div>

      <button 
        onClick={handleGoogleLogin}
        disabled={isLoggingIn}
        className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 3.344 29.362 2 24 2C11.85 2 2 11.85 2 24s9.85 22 22 22s22-9.85 22-22c0-1.33-.112-2.633-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 3.344 29.362 2 24 2C16.257 2 9.507 6.047 5.628 12.112l.678 2.579z"/><path fill="#4CAF50" d="M24 46c5.066 0 9.535-1.681 13.064-4.51l-6.425-5.264C28.522 37.64 26.34 38 24 38c-5.411 0-10.039-3.593-11.606-8.54l-6.683 5.158C9.554 40.852 16.29 46 24 46z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.425 5.264C41.92 35.534 46 30.252 46 24c0-1.33-.112-2.633-.389-3.917z"/>
        </svg>
        התחבר עם Google
      </button>

      <p className="mt-8 text-center text-sm text-slate-500">
        {authMode === 'login' ? 'אין לך חשבון?' : 'כבר יש לך חשבון?'}
        <button 
          onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          className="mr-2 text-brand-accent font-bold hover:underline"
        >
          {authMode === 'login' ? 'הירשם עכשיו' : 'התחבר כאן'}
        </button>
      </p>
    </div>
  );
};
