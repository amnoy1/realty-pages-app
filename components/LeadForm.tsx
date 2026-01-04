import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface LeadFormProps {
  agentWhatsApp: string;
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
      // 1. שמירה ל-Firestore כגיבוי
      if (db && propertyId && ownerId) {
        await addDoc(collection(db, 'leads'), {
          propertyId,
          propertyTitle,
          ownerId,
          fullName,
          phone,
          createdAt: Date.now()
        });
      }

      // 2. פתיחת חלון מייל לסוכן
      const emailSubject = `ליד חדש עבור הנכס: ${propertyTitle}`;
      const emailBody = `שלום ${agentName},\n\nהתקבלה פנייה חדשה עבור הנכס: ${propertyTitle}\n\nפרטי המתעניין:\nשם מלא: ${fullName}\nטלפון: ${phone}\n\nהודעה זו נשלחה אוטומטית ממערכת דפי הנחיתה.`;
      const mailtoUrl = `mailto:${agentEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      window.location.href = mailtoUrl;
      setSubmitted(true);
    } catch (err: any) {
      console.error("Form error:", err);
      setError("חלה שגיאה קלה בשמירה, אך ניתן להמשיך.");
      // אפילו אם ה-DB נכשל, ננסה להוציא מייל
      const emailSubject = `ליד חדש: ${propertyTitle}`;
      const mailtoUrl = `mailto:${agentEmail}?subject=${encodeURIComponent(emailSubject)}`;
      window.location.href = mailtoUrl;
      setSubmitted(true);
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
            <p className="text-slate-600 text-lg mb-8 font-medium">פרטי הליד נשלחו לסוכן {agentName}.</p>
            <button onClick={() => window.location.reload()} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 px-6 rounded-2xl transition-all font-bold">חזרה לנכס</button>
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
          <label className="block text-sm font-semibold text-slate-700 mb-1 text-right">שם מלא</label>
          <input type="text" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-right" placeholder="ישראל ישראלי" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1 text-right">טלפון נייד</label>
          <input type="tel" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-right" placeholder="050-0000000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        {error && <p className="text-red-600 text-sm text-center font-bold">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-5 px-4 rounded-xl shadow-xl text-xl font-black text-white bg-gradient-to-r from-brand-accent to-orange-600 hover:from-orange-600 transition-all transform hover:scale-[1.01]">
          {isSubmitting ? 'שולח...' : 'תיאום סיור עכשיו'}
        </button>
      </form>
    </div>
  );
};