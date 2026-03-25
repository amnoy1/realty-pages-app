
import React, { useState } from 'react';
import { db, auth, sendSignInLinkToEmail } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import * as gtag from '../lib/gtag';

interface LeadFormProps {
  agentWhatsApp: string;
  agentEmail: string;
  propertyTitle: string;
  agentName: string;
  propertyId?: string;
  ownerId?: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({ 
  agentWhatsApp, 
  agentEmail, 
  propertyTitle, 
  agentName,
  propertyId,
  ownerId 
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email) {
      setError('נא למלא שם, טלפון ואימייל תקינים.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // 1. Save Lead to Firestore
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if user is already logged in and email matches
      let uid = null;
      if (auth?.currentUser && auth.currentUser.email?.toLowerCase() === normalizedEmail) {
        uid = auth.currentUser.uid;
      }

      if (db) {
        await addDoc(collection(db, 'leads'), {
          propertyId: propertyId || 'pending_save',
          propertyTitle: propertyTitle || 'Untitled Property',
          ownerId: ownerId || 'unknown',
          fullName: fullName || 'Anonymous',
          phone: phone || '',
          email: normalizedEmail,
          uid: uid, // Save UID if available
          createdAt: Date.now(),
          source: 'landing_page_form'
        });
        
        gtag.event({
          action: 'generate_lead',
          category: 'conversion',
          label: propertyTitle,
          value: 1
        });
        
        console.log("Lead saved successfully to DB");
      }
    } catch (dbErr: any) {
      console.error("Error saving lead to Firestore:", dbErr);
      setError('שגיאה בשמירת הליד: ' + (dbErr.message || dbErr.code || 'שגיאה לא ידועה'));
      setIsSubmitting(false);
      return;
    }

    try {
      // 2. Send Sign-In Link
      if (auth) {
        const actionCodeSettings = {
          // URL you want to redirect back to. The domain (www.example.com) for this
          // URL must be in the authorized domains list in the Firebase Console.
          url: `${window.location.origin}/finish-sign-up?propertyId=${propertyId || ''}`,
          handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        console.log("Sign-in email sent");
      }
    } catch (authErr: any) {
      console.warn("Error sending sign-in link:", authErr);
      
      // Lead was saved, but email failed. We should probably still show success for the lead, 
      // but warn about the email.
      // However, for now, let's show the specific error to debug.
      
      if (authErr.code === 'auth/unauthorized-continue-uri') {
          setError('הליד נשמר, אך הדומיין אינו מאושר לשליחת מיילים (Auth).');
      } else if (authErr.code === 'auth/operation-not-allowed') {
          setError('הליד נשמר, אך שליחת מיילים לא מופעלת בפרויקט (Email Link Sign-in).');
      } else {
          setError('הליד נשמר, אך אירעה שגיאה בשליחת המייל: ' + (authErr.message || authErr.code));
      }
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
    setIsSubmitting(false);
  };
  
  if (submitted) {
    return (
        <div className="text-center max-w-lg mx-auto p-10 bg-white border border-slate-200 rounded-3xl shadow-2xl animate-fade-in" dir="rtl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg text-green-600 text-3xl font-bold">
                ✓
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">תודה, {fullName}!</h2>
            <p className="text-slate-600 text-lg mb-4 font-medium">הפרטים שלך הועברו לסוכן {agentName}.</p>
            <p className="text-slate-600 text-lg mb-8 font-medium">שלחנו לך מייל עם קישור כניסה לאזור האישי שלך, שם תוכל לראות את הנכס הזה ונכסים נוספים.</p>
            <button onClick={() => setSubmitted(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 px-6 rounded-2xl transition-all font-bold shadow-lg">שלח פנייה נוספת</button>
        </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-100 relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-accent to-orange-500"></div>
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">מעוניינים בסיור בנכס?</h2>
      <p className="text-center text-slate-500 mb-8 font-medium">השאירו פרטים ונחזור אליכם בהקדם</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1">שם מלא</label>
          <input
            type="text"
            id="fullName"
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-accent outline-none transition-all placeholder-slate-400 font-medium"
            placeholder="ישראל ישראלי"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1">טלפון נייד</label>
          <input
            type="tel"
            id="phone"
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-accent outline-none transition-all placeholder-slate-400 font-medium"
            placeholder="050-0000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">אימייל</label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-accent outline-none transition-all placeholder-slate-400 font-medium"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm text-center font-bold animate-pulse">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-4 px-10 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.3)] text-xl font-bold text-white bg-gradient-to-r from-brand-accent to-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 font-sans border border-white/10"
        >
          {isSubmitting ? 'שולח...' : 'תיאום סיור בנכס'}
        </button>
        
        <p className="text-[10px] text-slate-400 text-center mt-4">
            * בלחיצה על הכפתור פרטיך יישמרו במערכת והסוכן המטפל יחזור אליך בהקדם.
        </p>
      </form>
    </div>
  );
};
