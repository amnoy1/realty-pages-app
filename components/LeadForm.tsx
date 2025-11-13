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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert('נא למלא את כל השדות.');
      return;
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

    // Open both links - mailto opens default client, whatsapp opens new tab
    window.open(mailtoUrl);
    window.open(whatsappUrl, '_blank');

    setSubmitted(true);
  };
  
  if (submitted) {
    return (
        <div className="text-center max-w-lg mx-auto p-8 bg-green-50 border-2 border-green-200 rounded-2xl">
            <h2 className="text-2xl font-bold text-green-800 mb-2">תודה רבה!</h2>
            <p className="text-green-700">הפרטים נשלחו לסוכן באמצעות דוא"ל ו-WhatsApp. ניצור איתך קשר בהקדם.</p>
        </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">רוצים לראות את הנכס?</h2>
      <p className="text-center text-slate-500 mb-8">השאירו פרטים ונחזור אליכם לתיאום סיור בהקדם</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">שם מלא</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 placeholder-slate-400"
            placeholder="ישראל ישראלי"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">טלפון</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 placeholder-slate-400"
            placeholder="050-123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            aria-required="true"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
        >
          שליחה ותיאום סיור
        </button>
      </form>
    </div>
  );
};