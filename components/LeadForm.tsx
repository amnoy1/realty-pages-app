import React, { useState } from 'react';

interface LeadFormProps {
  agentWhatsApp: string;
  agentEmail: string;
  propertyTitle: string;
  agentName: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({ agentWhatsApp, agentEmail, propertyTitle, agentName }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      setError('נא למלא את כל שדות החובה.');
      return;
    }
    setError('');

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

    // Open both links - mailto opens default client, whatsapp opens new tab
    window.open(mailtoUrl);
    window.open(whatsappUrl, '_blank');

    setSubmitted(true);
  };
  
  if (submitted) {
    return (
        <div className="text-center max-w-lg mx-auto p-8 bg-green-900/30 border-2 border-green-800 rounded-2xl backdrop-blur-md">
            <h2 className="text-2xl font-bold text-green-400 mb-2">תודה רבה!</h2>
            <p className="text-green-200">הפרטים נשלחו לסוכן באמצעות דוא"ל ו-WhatsApp. ניצור איתך קשר בהקדם.</p>
        </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-800 p-8 sm:p-12 rounded-[2rem] shadow-2xl backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-center text-white mb-2">רוצים לראות את הנכס?</h2>
      <p className="text-center text-slate-400 mb-8">השאירו פרטים ונחזור אליכם לתיאום סיור בהקדם</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">שם מלא</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-accent focus:border-transparent transition duration-200 placeholder-slate-500 text-white"
            placeholder="ישראל ישראלי"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (error) setError('');
            }}
            required
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">טלפון</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-accent focus:border-transparent transition duration-200 placeholder-slate-500 text-white"
            placeholder="050-123-4567"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (error) setError('');
            }}
            required
            aria-required="true"
          />
        </div>

        {error && (
            <div className="bg-red-900/20 p-3 rounded-lg border border-red-800/50 text-center">
                <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
        )}

        <button
          type="submit"
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-accent/20 text-lg font-bold text-white bg-gradient-to-r from-brand-accent to-brand-accentHover hover:shadow-brand-accent/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-300 transform hover:-translate-y-1"
        >
          שליחה ותיאום סיור
        </button>
      </form>
    </div>
  );
};