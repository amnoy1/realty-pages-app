
import React, { useState } from 'react';

interface LeadFormProps {
  agentWhatsApp: string;
  agentEmail: string;
  propertyTitle: string;
  agentName: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({ agentWhatsApp, propertyTitle, agentName }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
        setSubmitted(true);
        setIsSubmitting(false);
    }, 1500);
  };

  if (submitted) {
    return (
        <div className="text-center max-w-lg mx-auto p-12 bg-white rounded-3xl shadow-2xl animate-fade-in border border-slate-100">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-black">✓</div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">תודה {fullName}!</h2>
            <p className="text-slate-600 text-lg">פרטיך הועברו לסוכן {agentName}. נחזור אליך בהקדם.</p>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-3 bg-brand-accent"></div>
      <h2 className="text-4xl font-black text-center text-slate-900 mb-4">רוצים לתאם סיור בנכס?</h2>
      <p className="text-center text-slate-500 mb-12 text-xl font-medium">השאירו פרטים ונציג יחזור אליכם לתיאום פגישה</p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-400 mr-2">שם מלא</label>
          <input type="text" className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-brand-accent/20 outline-none" placeholder="הזינו שם מלא" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-400 mr-2">טלפון נייד</label>
          <input type="tel" className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-brand-accent/20 outline-none text-left" placeholder="050-0000000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full py-6 px-12 rounded-full shadow-2xl text-2xl font-black text-white bg-gradient-to-r from-brand-accent to-orange-600 hover:scale-[1.02] transition-all disabled:opacity-50">
          {isSubmitting ? 'שולח פרטים...' : 'תיאום סיור בנכס'}
        </button>
      </form>
    </div>
  );
};
