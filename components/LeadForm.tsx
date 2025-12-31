import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface LeadFormProps {
  agentWhatsApp: string; // נשמר ב-Props לצורך תאימות טיפוסים אך לא בשימוש בטופס
  agentEmail: string;
  propertyTitle: string;
  agentName: string;
  propertyId?: string;
  ownerId?: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({ 
  agentEmail, 
  propertyTitle, 
  agentName,
  propertyId,
  ownerId 
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      setError('נא למלא את כל שדות החובה.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // 1. שמירה לדאטה-בייס (Firestore)
      // הליד נשמר עם מזהה הסוכן (ownerId) כדי שיופיע בדשבורד שלו
      if (db && propertyId && ownerId) {
        await addDoc(collection(db, 'leads'), {
          propertyId,
          propertyTitle,
          ownerId,
          fullName,
          phone,
          createdAt: Date.now()
        });
        console.log("Lead saved successfully to database.");
      } else {
        console.warn("Missing database connection or IDs during save.");
      }

      // 2. הכנת והפעלת קישור למייל (mailto)
      const emailSubject = `ליד חדש עבור הנכס: ${propertyTitle}`;
      const emailBody = `שלום ${agentName},\n\nהתקבלה פנייה חדשה עבור הנכס: ${propertyTitle}\n\nפרטי המתעניין:\nשם מלא: ${fullName}\nטלפון: ${phone}\n\nהודעה זו נשלחה אוטומטית ממערכת דפי הנחיתה.`;
      const mailtoUrl = `mailto:${agentEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // הפעלה אוטומטית של חלון המייל
      window.location.href = mailtoUrl;

      setSubmitted(true);
    } catch (err: any) {
      console.error("Critical error in form submission:", err);
      setError("חלה שגיאה בשמירת הנתונים. אנא נסה שנית.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
        <div className="text-center max-w-lg mx-auto p-10 bg-white border border-slate-200 rounded-3xl shadow-2xl animate-fade-in" dir="rtl">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">הפרטים התקבלו!</h2>
            <p className="text-slate-600 text-lg mb-8 font-medium">פרטי הליד נשמרו במערכת והועברו במייל לסוכן {agentName}.</p>
            
            <button 
                onClick={() => window.location.reload()}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 px-6 rounded-2xl transition-all font-bold shadow-md"
            >
                חזרה לנכס
            </button>
        </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-100 relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-accent to-orange-500"></div>
      
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">מעוניינים בסיור בנכס?</h2>
      <p className="text-center text-slate-500 mb-8 font-medium">השאירו פרטים והסוכן יחזור אליכם בהקדם</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1">שם מלא</label>
          <input
            type="text"
            id="fullName"
            autoComplete="name"
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all placeholder-slate-400 text-slate-900"
            placeholder="ישראל ישראלי"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (error) setError('');
            }}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1">טלפון נייד</label>
          <input
            type="tel"
            id="phone"
            autoComplete="tel"
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all placeholder-slate-400 text-slate-900"
            placeholder="05X-XXXXXXX"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (error) setError('');
            }}
            required
            disabled={isSubmitting}
          />
        </div>

        {error && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center animate-shake">
                <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-5 px-4 rounded-xl shadow-xl text-xl font-black text-white bg-gradient-to-r from-brand-accent to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>שולח פנייה...</span>
              </div>
          ) : 'תיאום סיור עכשיו'}
        </button>
        
        <p className="text-[11px] text-center text-slate-400 mt-4 leading-tight font-medium">
            בלחיצה על הכפתור פרטייך יישמרו במערכת ויועברו לסוכן {agentName} במייל לתיאום סיור.
        </p>
      </form>
    </div>
  );
};