
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
      setError('נא למלא שם וטלפון תקינים.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // ניסיון שמירה ל-Firestore (אוסף leads)
      if (db) {
        await addDoc(collection(db, 'leads'), {
          propertyId: propertyId || 'pending_save',
          propertyTitle: propertyTitle,
          ownerId: ownerId || 'unknown',
          fullName: fullName,
          phone: phone,
          createdAt: Date.now(),
          source: 'landing_page_form'
        });
        console.log("Lead saved successfully to DB");
      }
    } catch (dbErr) {
      console.warn("Could not save lead to DB (check Firebase Rules):", dbErr);
      setError('אירעה שגיאה בשליחת הפרטים. נא לנסות שוב מאוחר יותר.');
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
            <p className="text-slate-600 text-lg mb-8 font-medium">הפרטים שלך הועברו לסוכן {agentName}. ניצור איתך קשר בהקדם לתיאום סיור.</p>
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

        {error && <p className="text-red-600 text-sm text-center font-bold animate-pulse">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-5 px-4 rounded-xl shadow-xl text-xl font-black text-white bg-gradient-to-r from-brand-accent to-orange-600 hover:from-orange-600 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'שולח...' : 'תיאום סיור עכשיו'}
        </button>
        
        <p className="text-[10px] text-slate-400 text-center mt-4">
            * בלחיצה על הכפתור פרטיך יישמרו במערכת והסוכן המטפל יחזור אליך בהקדם.
        </p>
      </form>
    </div>
  );
};
