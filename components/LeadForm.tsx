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
  const [showEmailFallback, setShowEmailFallback] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      setError('נא למלא את כל שדות החובה.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    setShowEmailFallback(false);

    try {
      // 1. שמירה לדאטה-בייס (Firestore)
      // אנחנו משייכים את הליד לנכס הספציפי (propertyId) ולסוכן (ownerId)
      if (db && propertyId && ownerId) {
        try {
          await addDoc(collection(db, 'leads'), {
            propertyId,
            propertyTitle,
            ownerId,
            fullName,
            phone,
            createdAt: Date.now()
          });
          console.log("Lead saved successfully to database.");
        } catch (dbErr: any) {
          console.error("Database error, proceeding to direct contact:", dbErr);
          // אם השמירה נכשלה, נפעיל את גיבוי המייל בסוף
          setShowEmailFallback(true);
        }
      } else {
        console.warn("Missing IDs or DB connection, skipping database save.");
        setShowEmailFallback(true);
      }

      // 2. הכנת הודעות וואטסאפ ומייל
      const message = `היי ${agentName}, אני מעוניין/ת לקבל פרטים נוספים על הנכס: "${propertyTitle}".\nשם: ${fullName}\nטלפון: ${phone}`;
      const encodedMessage = encodeURIComponent(message);
      const cleanPhone = agentWhatsApp.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
      
      const emailSubject = `ליד חדש עבור הנכס: ${propertyTitle}`;
      const emailBody = `שלום ${agentName},\n\nהתקבלה פנייה חדשה עבור הנכס: ${propertyTitle}\n\nפרטי המתעניין:\nשם מלא: ${fullName}\nטלפון: ${phone}\n\nהודעה זו נשלחה אוטומטית ממערכת דפי הנחיתה.`;
      const mailtoUrl = `mailto:${agentEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // 3. פתיחת ערוצי קשר
      // נסיון פתיחת וואטסאפ בחלון חדש
      const whatsappWindow = window.open(whatsappUrl, '_blank');
      
      // אם הדפדפן חסם את הפופ-אפ או שיש בעיה, נפתח את המייל כגיבוי או נציע כפתור
      if (!whatsappWindow || showEmailFallback) {
          window.location.href = mailtoUrl;
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error("Critical error in form submission:", err);
      setError("חלה שגיאה בשליחת הנתונים. אל דאגה, ניתן ליצור קשר ישירות עם הסוכן.");
      setShowEmailFallback(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
        <div className="text-center max-w-lg mx-auto p-10 bg-white border border-slate-200 rounded-3xl shadow-2xl animate-fade-in" dir="rtl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">הפרטים התקבלו!</h2>
            <p className="text-slate-600 text-lg mb-8 font-medium">הפרטים נשמרו במערכת והודעה נשלחה לסוכן {agentName}.</p>
            
            <div className="space-y-4">
                <a 
                    href={`https://wa.me/${agentWhatsApp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#1ebc57] text-white py-4 px-6 rounded-2xl transition-all font-bold shadow-lg transform hover:-translate-y-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.536 1.907 6.344l-1.495 5.454 5.57-1.451zm.5-7.527c.08-.135.143-.225.246-.354.103-.13.21-.211.353-.267.143-.057.3-.086.48-.086.195 0 .358.03.49.09.13.06.23.145.302.26.07.115.105.245.105.39.0.15-.03.28-.09.4-.06.12-.135.225-.225.315-.09.09-.195.17-.315.235-.12.065-.255.115-.405.15-.15.035-.315.06-.495.06-.205 0-.39-.03-.56-.09-.17-.06-.315-.145-.445-.255-.13-.11-.235-.24-.315-.375s-.13-.285-.15-.45c-.02-.165-.03-.32-.03-.465.0-.15.015-.285.045-.405zm1.996 2.95c.12-.06.225-.135.315-.225.09-.09.165-.195.225-.315s.105-.255.135-.405.045-.315.045.495c0-.21-.03-.4-.09-.56-.06-.16-.14-.295-.24-.41-.1-.115-.21-.2-.33-.255s-.25-.085-.39-.085c-.15 0-.285.03-.405.085s-.225.13-.315.225c-.09.09-.165.195-.225.315s-.105.255-.135-.405-.045.315-.045.495c0 .21.03.4.09.56s.14.295.24.41c.1.115.21.2.33.255s.25.085.39.085c.15 0 .285-.03.405-.085zm2.12-1.935c.15-.045.285-.105.405-.18s.225-.165.315-.27c.09-.105.165-.225.225-.36.06-.135.09-.285.09-.45 0-.18-.03-.345-.09-.5-.06-.155-.14-.29-.24-.405-.1-.115-.21-.2-.33-.255s-.25-.085-.39-.085c-.165 0-.315.03-.45.085s-.255.135-.36.255c-.105.12-.195.27-.27.45s-.12.375-.15.585c-.03.21-.045.42-.045.615.0.21.015.405.045.585s.075.345.135.495.135.285.225.405.195.225.315.315c.12.09.255.165.405.225.15.06.315.09.495.09.195 0 .375-.03.54-.09s.31-.14.435-.25c.125-.11.225-.24.3-.39s.125-.315.15-.495c.025-.18.038-.36.038-.525.0-.195-.03-.375-.09-.54s-.135-.315-.225-.45c-.09-.135-.195-.255-.315-.36-.12-.105-.255-.18-.405-.225s-.315-.06-.495-.06c-.195 0-.375.03-.54.09s-.31.14-.435.25c-.125-.11-.225-.24-.3.39s-.125-.315-.15-.495c-.025-.18-.038-.36-.038-.525z"/></svg>
                    <span>שליחה נוספת בוואטסאפ</span>
                </a>
                
                <a 
                    href={`mailto:${agentEmail}`}
                    className="flex items-center justify-center gap-3 w-full bg-slate-800 hover:bg-slate-700 text-white py-4 px-6 rounded-2xl transition-all font-bold"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span>שלח אימייל לסוכן</span>
                </a>
            </div>
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
                <span>מעבד פנייה...</span>
              </div>
          ) : 'תיאום סיור עכשיו'}
        </button>
        
        <p className="text-[11px] text-center text-slate-400 mt-4 leading-tight font-medium">
            בלחיצה על הכפתור פרטייך יישמרו במערכת ויועברו לסוכן {agentName} לתיאום ב-WhatsApp ובמייל.
        </p>
      </form>
    </div>
  );
};