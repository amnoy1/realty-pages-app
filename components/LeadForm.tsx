import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface LeadFormProps {
  agentWhatsApp: string; // נשמר לתאימות אך לא בשימוש בטופס
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
      setError('נא למלא שם וטלפון.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    try {
      // 1. שמירה מחייבת לדאטה-בייס (טבלת leads)
      // זהו הצעד הקריטי ביותר כדי שהסוכן יראה את הליד בדשבורד
      if (db && propertyId && ownerId) {
        await addDoc(collection(db, 'leads'), {
          propertyId,
          propertyTitle,
          ownerId, // ה-UID של הסוכן שיצר את הדף
          fullName,
          phone,
          createdAt: Date.now(),
          status: 'new'
        });
        console.log("Lead successfully stored in database.");
      } else {
        throw new Error("Missing connection or IDs for database save.");
      }

      // 2. שליחת נוטיפיקציה לסוכן באמצעות המייל
      const emailSubject = `ליד חדש התקבל עבור: ${propertyTitle}`;
      const emailBody = `שלום ${agentName},\n\nהתקבלה פנייה חדשה בנכס שלך.\n\nפרטי הליד:\nשם: ${fullName}\nטלפון: ${phone}\n\nהליד נשמר כעת גם בדשבורד האישי שלך במערכת.`;
      const mailtoUrl = `mailto:${agentEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // ניסיון פתיחת המייל כנוטיפיקציה
      window.location.href = mailtoUrl;

      setSubmitted(true);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError("אירעה שגיאה בשמירת הפרטים. אנא נסה שנית או פנה לסוכן ישירות.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
        <div className="text-center max-w-lg mx-auto p-12 bg-white border border-slate-200 rounded-3xl shadow-2xl animate-fade-in" dir="rtl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">הפרטים נשמרו!</h2>
            <p className="text-slate-600 text-lg mb-8 font-medium">פנייתך נשמרה במערכת והועברה לסוכן במייל.</p>
            <button 
                onClick={() => window.location.reload()}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
            >
                סגור
            </button>
        </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 sm:p-12 rounded-[2rem] shadow-2xl border border-slate-100 relative" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-accent rounded-t-[2rem]"></div>
      
      <h2 className="text-3xl font-bold text-slate-800 mb-2">מעוניינים בפרטים נוספים?</h2>
      <p className="text-slate-500 mb-8 font-medium">השאירו פרטים והסוכן יחזור אליכם</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">שם מלא</label>
          <input
            type="text"
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
            placeholder="הכנס שם מלא"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">טלפון ליצירת קשר</label>
          <input
            type="tel"
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
            placeholder="05X-XXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        {error && <p className="text-red-600 text-sm font-bold text-center">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 text-white py-5 rounded-xl text-xl font-black shadow-lg hover:bg-brand-accent transition-all transform active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'שומר פרטים...' : 'שלח לסוכן'}
        </button>
        <p className="text-[10px] text-center text-slate-400">הפרטים נשמרים בדאטה-בייס המאובטח של המערכת.</p>
      </form>
    </div>
  );
};