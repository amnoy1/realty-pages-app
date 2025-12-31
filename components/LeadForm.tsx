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
      setError('נא למלא את כל שדות החובה.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // Save lead to Firestore if IDs are provided
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

      // WhatsApp Message
      const message = `היי, אני מעוניין/ת לקבוע סיור בנכס "${propertyTitle}".\nשמי: ${fullName}\nטלפון: ${phone}`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${agentWhatsApp}?text=${encodedMessage}`;
      
      // Email Message
      const emailSubject = `פנייה חדשה עבור הנכס: ${propertyTitle}`;
      const emailBody = `שלום ${agentName},\n\nהתקבלה פנייה חדשה דרך דף הנחיתה.\n\nפרטי המתעניין/ת:\nשם מלא: ${fullName}\nטלפון: ${phone}\n\nנכס: ${propertyTitle}`;
      const encodedEmailSubject = encodeURIComponent(emailSubject);
      const encodedEmailBody = encodeURIComponent(emailBody);
      const mailtoUrl = `mailto:${agentEmail}?subject=${encodedEmailSubject}&body=${encodedEmailBody}`;

      // Open both links
      window.open(mailtoUrl);
      window.open(whatsappUrl, '_blank');

      setSubmitted(true);
    } catch (err: any) {
      console.error("Error saving lead:", err);
      setError("אירעה שגיאה בשליחת הפרטים. אנא נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
        <div className="text-center max-w-lg mx-auto p-8 bg-green-50 border-2 border-green-200 rounded-2xl animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">תודה רבה!</h2>
            <p className="text-green-700">הפרטים נשלחו לסוכן ונקלטו במערכת. ניצור איתך קשר בהקדם.</p>
        </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-100">
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">רוצים לראות את הנכס?</h2>
      <p className="text-center text-slate-500 mb-8">השאירו פרטים ונחזור אליכם לתיאום סיור בהקדם</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">שם מלא</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-150 placeholder-slate-400"
            placeholder="ישראל ישראלי"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (error) setError('');
            }}
            required
            disabled={isSubmitting}
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">טלפון</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-150 placeholder-slate-400"
            placeholder="050-123-4567"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (error) setError('');
            }}
            required
            disabled={isSubmitting}
            aria-required="true"
          />
        </div>

        {error && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center animate-shake">
                <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-gradient-to-r from-brand-accent to-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
        >
          {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : 'שליחה ותיאום סיור'}
        </button>
      </form>
    </div>
  );
};