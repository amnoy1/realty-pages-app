'use client';

import { useEffect, useState } from 'react';
import { auth, isSignInWithEmailLink, signInWithEmailLink } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

export default function FinishSignUp() {
  const router = useRouter();
  const [status, setStatus] = useState('בודק קישור כניסה...');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleSignIn = async () => {
      if (!auth) return;

      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        
        if (!email) {
          // User opened link on different device. Ask for email.
          email = window.prompt('נא להזין את האימייל שלך לאימות:');
        }

        if (email) {
          try {
            setStatus('מבצע כניסה...');
            // Normalize email to lowercase to ensure consistency with stored data and auth rules
            const normalizedEmail = email.toLowerCase().trim();
            await signInWithEmailLink(auth, normalizedEmail, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            setStatus('הכניסה הצליחה! מעביר לאזור האישי...');
            
            // Redirect to buyer portal
            router.push('/buyer-portal');
          } catch (err: any) {
            console.error("Sign-in error", err);
            setError('שגיאה בכניסה: ' + err.message);
            setStatus('');
          }
        } else {
            setError('לא הוזן אימייל. לא ניתן להשלים את הכניסה.');
            setStatus('');
        }
      } else {
          setStatus('קישור לא תקין או שפג תוקפו.');
      }
    };

    handleSignIn();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">אימות כניסה</h1>
        {status && <p className="text-slate-600 animate-pulse">{status}</p>}
        {error && (
            <div className="mt-4">
                <p className="text-red-600 font-bold mb-4">{error}</p>
                <a href="/" className="text-brand-accent hover:underline">חזרה לדף הבית</a>
            </div>
        )}
      </div>
    </div>
  );
}
