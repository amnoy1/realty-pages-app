import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { signInWithPopup, signOut, auth, GoogleAuthProvider, initializationError } from '../lib/firebase';

interface AuthProps {
  user: User | null;
  isAdmin: boolean;
  onViewChange: (view: 'create' | 'dashboard' | 'admin') => void;
  currentView: string;
}

export const Auth: React.FC<AuthProps> = ({ user, isAdmin, onViewChange, currentView }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const handleLogin = async () => {
    if (!auth) {
      const errorMsg = initializationError || "שירות האימות (Firebase) לא הוגדר כראוי. וודא שהזנת את מפתחות ה-API בהגדרות המערכת.";
      alert(errorMsg);
      console.error("Auth object is undefined. Check your Firebase environment variables.");
      return;
    }

    setIsLoggingIn(true);
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      
      if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        alert(`הדומיין ${currentDomain} לא מורשה ב-Firebase Auth. יש להוסיפו לרשימת ה-Authorized Domains בקונסול של Firebase.`);
      } else if (error.code === 'auth/invalid-api-key') {
        alert("מפתח ה-API של Firebase אינו תקין. בדוק את הגדרות הסביבה.");
      } else if (error.code !== 'auth/popup-closed-by-user') {
        alert(`שגיאת התחברות: ${error.message}`);
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
        <div className="flex items-center gap-3 bg-slate-800/90 backdrop-blur-md p-2 pr-4 pl-2 rounded-full border border-slate-700 shadow-lg animate-fade-in pointer-events-auto">
           <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-bold text-white leading-none">{user.displayName}</span>
              <span className="text-xs text-slate-400 mt-1">{isAdmin ? 'מנהל מערכת' : 'סוכן רשום'}</span>
           </div>
           
           {user.photoURL ? (
             <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full border-2 border-slate-600" />
           ) : (
             <div className="w-9 h-9 rounded-full bg-brand-accent flex items-center justify-center text-white font-bold">
               {user.displayName?.charAt(0) || 'U'}
             </div>
           )}
           
           <div className="h-6 w-px bg-slate-600 mx-1"></div>

           <div className="flex items-center gap-1">
             <button 
                onClick={() => onViewChange('dashboard')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${currentView === 'dashboard' ? 'bg-brand-accent text-white' : 'text-slate-300 hover:bg-slate-700'}`}
             >
                נכסים
             </button>

             <button 
                onClick={() => onViewChange('create')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${currentView === 'create' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
             >
                +
             </button>

             <button onClick={handleLogout} className="p-1.5 text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg" title="התנתק">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </button>
           </div>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-brand-accent/20 transition-all pointer-events-auto flex items-center gap-2"
        >
          {isLoggingIn ? <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : null}
          {isLoggingIn ? 'מתחבר...' : 'התחבר עם Google'}
        </button>
      )}
    </div>
  );
};