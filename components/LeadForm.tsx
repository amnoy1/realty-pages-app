import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface LeadFormProps {
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
      // 1. שמירה לדאטה-בייס (טבלת leads)
      if (db && propertyId && ownerId) {
        await addDoc(collection(db, 'leads'), {
          propertyId,
          propertyTitle,
          ownerId, 
          fullName,
          phone,
          createdAt: Date.now(),
        });
      }

      // 2. פתיחת חלון מייל לסוכן כנוטיפיקציה
      const emailSubject = `ליד חדש עבור הנכס: ${propertyTitle}`;
      const emailBody = `שלום ${agentName},\n\nהתקבלה פנייה חדשה עבור הנכס: ${propertyTitle}\n\nפרטי המתעניין:\nשם: ${fullName}\nטלפון: ${phone}\n\nהליד נשמר כעת גם בדשבורד שלך במערכת.`;
      const mailtoUrl = `mailto:${agentEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      window.location.href = mailtoUrl;

      setSubmitted(true);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError("שגיאה בשמירת הנתונים. נא לנסות שנית.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl animate-fade-in" dir="rtl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">הפרטים נשלחו!</h2>
            <p className="text-slate-600">תודה, פנייתך הועברה לסוכן ותופיע במייל ובדשבורד שלו.</p>
        </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100" dir="rtl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">השאירו פרטים לתיאום סיור</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">שם מלא</label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-accent"
            placeholder="ישראל ישראלי"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">טלפון</label>
          <input
            type="tel"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-accent"
            placeholder="050-0000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-brand-accent transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'מעבד...' : 'שלח פרטים לסוכן'}
        </button>
      </form>
    </div>
  );
};