import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { signInWithPopup, signOut, auth, GoogleAuthProvider } from '../lib/firebase';

interface AuthProps {
  user: User | null;
  isAdmin: boolean;
  onViewChange: (view: 'create' | 'dashboard' | 'admin') => void;
  currentView: string;
}

export const Auth: React.FC<AuthProps> = ({ user, isAdmin, onViewChange, currentView }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const handleLogin = async () => {
    console.log("Login button clicked"); // Debug log
    setIsLoggingIn(true);
    
    try {
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
          throw new Error("מפתחות Firebase לא נמצאו בדפדפן. וודא שהגדרת את המשתנים ב-Vercel עם הקידומת NEXT_PUBLIC_");
      }

      console.log("Starting Google Popup...");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log("Login successful");
      
    } catch (error: any) {
      console.error("Login failed details:", error);
      setIsLoggingIn(false);
      
      // Detailed Error Handling for User Feedback
      if (error.code === 'auth/unauthorized-domain') {
        alert("שגיאה: הדומיין חסום.\nיש להיכנס ל-Firebase Console -> Authentication -> Settings -> Authorized Domains ולהוסיף את הדומיין של Vercel.");
      } else if (error.code === 'auth/operation-not-allowed') {
        alert("שגיאה: כניסה עם גוגל לא מופעלת.\nיש להיכנס ל-Firebase Console -> Authentication -> Sign-in method ולהפעיל את Google.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        // Ignore close
      } else if (error.code === 'auth/api-key-not-valid' || error.message.includes("API key")) {
        alert("שגיאה: מפתח ה-API אינו תקין.\n1. בדוק שהעתקת את המפתחות נכון ל-Vercel.\n2. וודא ששמות המשתנים מתחילים ב-NEXT_PUBLIC_");
      } else {
        alert(`התחברות נכשלה:\n${error.message}`);
      }
    } finally {
        setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
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
              <span className="text-[10px] text-slate-400 mt-0.5">{isAdmin ? 'מנהל מערכת' : 'משתמש רשום'}</span>
           </div>
           
           {user.photoURL ? (
             <img src={user.photoURL} alt={user.displayName || 'User'} className="w-9 h-9 rounded-full border-2 border-slate-600" />
           ) : (
             <div className="w-9 h-9 rounded-full bg-brand-accent flex items-center justify-center text-white font-bold shadow-inner">
               {user.displayName?.charAt(0) || 'U'}
             </div>
           )}
           
           <div className="h-6 w-px bg-slate-600 mx-1"></div>

           {/* Navigation Buttons */}
           <div className="flex items-center gap-1.5">
             {isAdmin && (
                <button 
                  onClick={() => onViewChange('admin')}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${currentView === 'admin' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
                >
                  ניהול
                </button>
             )}
             
             <button 
                onClick={() => onViewChange('dashboard')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${currentView === 'dashboard' ? 'bg-brand-accent text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
             >
                הנכסים שלי
             </button>

             <button 
                onClick={() => onViewChange('create')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${currentView === 'create' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
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
          className={`flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-full font-bold hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 border-2 border-transparent hover:border-brand-accent/20 ${isLoggingIn ? 'opacity-75 cursor-wait' : ''}`}
        >
          {isLoggingIn ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          )}
          {isLoggingIn ? 'מתחבר...' : 'התחבר עם Google'}
        </button>
      )}
    </div>
  );
};
