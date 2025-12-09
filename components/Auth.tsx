import React from 'react';
import { User } from 'firebase/auth';
import { signInWithPopup, signOut, auth, GoogleAuthProvider } from '../lib/firebase';

interface AuthProps {
  user: User | null;
  isAdmin: boolean;
  onViewChange: (view: 'create' | 'dashboard' | 'admin') => void;
  currentView: string;
}

export const Auth: React.FC<AuthProps> = ({ user, isAdmin, onViewChange, currentView }) => {
  
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      alert("התחברות נכשלה. אנא נסה שנית.");
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
        <div className="flex items-center gap-3 bg-slate-800/50 p-2 pr-4 pl-2 rounded-full border border-slate-700">
           <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-bold text-white leading-none">{user.displayName}</span>
              <span className="text-xs text-slate-400">{isAdmin ? 'מנהל מערכת' : 'משתמש רשום'}</span>
           </div>
           
           {user.photoURL ? (
             <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-slate-600" />
           ) : (
             <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-white font-bold">
               {user.displayName?.charAt(0) || 'U'}
             </div>
           )}
           
           <div className="h-6 w-px bg-slate-600 mx-1"></div>

           {/* Navigation Buttons */}
           <div className="flex items-center gap-2">
             {isAdmin && (
                <button 
                  onClick={() => onViewChange('admin')}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${currentView === 'admin' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
                >
                  ניהול
                </button>
             )}
             
             <button 
                onClick={() => onViewChange('dashboard')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-brand-accent text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
             >
                הנכסים שלי
             </button>

             <button 
                onClick={() => onViewChange('create')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${currentView === 'create' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
             >
                צור חדש
             </button>

             <button 
               onClick={handleLogout}
               className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1.5 rounded-lg transition-colors"
               title="התנתק"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
             </button>
           </div>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-full font-bold hover:bg-slate-100 transition-colors shadow-lg"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          התחבר עם Google
        </button>
      )}
    </div>
  );
};
