
import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface LeadFormProps {
  agentWhatsApp: string;
  agentEmail: string;
  propertyTitle: string;
  agentName: string;
  propertyId?: string; // מזהה הנכס לצורך שמירה ב-DB
  ownerId?: string;    // מזהה הסוכן לצורך שמירה ב-DB
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
      // 1. שמירה ל-Firestore (אופציונלי - רק אם יש IDs)
      // זה קורה ברקע עבור משתמשים שגולשים בדף
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

      // 2. הכנת הודעות ליצירת קשר ישיר
      const message = `היי, אני מעוניין/ת לקבוע סיור בנכס "${propertyTitle}".\nשמי: ${fullName}\nטלפון: ${phone}`;
      const whatsappUrl = `https://wa.me/${agentWhatsApp}?text=${encodeURIComponent(message)}`;
      
      const emailSubject = `ליד חדש עבור הנכס: ${propertyTitle}`;
      const emailBody = `שלום ${agentName},\n\nהתקבלה פנייה חדשה דרך דף הנחיתה.\n\nפרטי המתעניין/ת:\nשם מלא: ${fullName}\nטלפון: ${phone}\n\nנכס: ${propertyTitle}`;
      const mailtoUrl = `mailto:${agentEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // 3. ביצוע הפעולות
      // פותחים וואטסאפ בטאב חדש ומייל בטאב הנוכחי (או להפך)
      window.open(whatsappUrl, '_blank');
      window.location.href = mailtoUrl;

      setSubmitted(true);
    } catch (err: any) {
      console.error("Error saving lead:", err);
      setError("אירעה שגיאה בשמירת הפרטים. ניתן לנסות שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
        <div className="text-center max-w-lg mx-auto p-10 bg-white border border-slate-200 rounded-3xl shadow-2xl animate-fade-in" dir="rtl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg text-green-600 text-3xl font-bold">
                ✓
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">הפרטים התקבלו!</h2>
            <p className="text-slate-600 text-lg mb-8 font-medium">פרטיך הועברו לסוכן {agentName}. ניצור איתך קשר בהקדם.</p>
            <button onClick={() => window.location.reload()} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 px-6 rounded-2xl transition-all font-bold">חזרה לנכס</button>
        </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-100 relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-accent to-orange-500"></div>
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">מעוניינים בסיור בנכס?</h2>
      <p className="text-center text-slate-500 mb-8 font-medium">השאירו פרטים ונחזור אליכם לתיאום סיור בהקדם</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1">שם מלא</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-accent outline-none transition-all placeholder-slate-400"
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
            name="phone"
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-accent outline-none transition-all placeholder-slate-400"
            placeholder="050-0000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {error && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-5 px-4 rounded-xl shadow-xl text-xl font-black text-white bg-gradient-to-r from-brand-accent to-orange-600 hover:from-orange-600 transition-all duration-300 transform hover:scale-[1.01] disabled:opacity-50"
        >
          {isSubmitting ? 'שולח...' : 'תיאום סיור עכשיו'}
        </button>
      </form>
    </div>
  );
};
