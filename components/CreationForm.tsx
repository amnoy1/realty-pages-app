import React, { useState } from 'react';
import type { PropertyFormData } from '../types';

export const CreationForm: React.FC<{ onSubmit: (details: PropertyFormData) => void; isLoading: boolean; defaultAgentName?: string; defaultAgentEmail?: string; }> = ({ onSubmit, isLoading, defaultAgentName = '', defaultAgentEmail = '' }) => {
  const [formData, setFormData] = useState<Omit<PropertyFormData, 'images' | 'logo'>>({
    address: '', 
    description: '', // Title of the property
    price: '', 
    agentName: defaultAgentName, 
    agentEmail: defaultAgentEmail, 
    agentWhatsApp: '',
  });
  const [images, setImages] = useState<string[]>([]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const filePromises = files.map((file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }));
      Promise.all(filePromises).then(base64Images => setImages(prev => [...prev, ...base64Images].slice(0, 10)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address || !formData.description) {
      alert('נא להזין כותרת וכתובת נכס.');
      return;
    }
    onSubmit({ ...formData, images });
  };

  const inputClasses = "w-full px-5 py-4 bg-slate-800/60 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent outline-none transition-all";
  const labelClasses = "block text-sm font-semibold text-slate-300 mb-2 mr-2";

  return (
    <div className="min-h-screen bg-slate-900 py-16 px-4 flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">מחולל דפי <span className="text-brand-accent">נחיתה</span></h1>
          <p className="text-slate-400 text-lg">פשוט, מהיר וחכם</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="p-4 bg-brand-accent/10 rounded-2xl border border-brand-accent/20 mb-6 text-center">
             <p className="text-brand-accent font-bold">הזינו כותרת וכתובת - ה-AI יבנה את השאר</p>
          </div>

          <div>
            <label className={labelClasses}>כותרת הנכס</label>
            <input 
              name="description" 
              placeholder="לדוגמה: פנטהאוז חלומי עם נוף לים" 
              className={inputClasses} 
              onChange={handleChange} 
              value={formData.description} 
              required 
            />
          </div>

          <div>
            <label className={labelClasses}>כתובת הנכס</label>
            <input 
              name="address" 
              placeholder="רחוב, מספר, עיר" 
              className={inputClasses} 
              onChange={handleChange} 
              value={formData.address} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className={labelClasses}>מחיר מבוקש (₪)</label>
                  <input name="price" placeholder="4,200,000" className={inputClasses} onChange={handleChange} value={formData.price} />
               </div>
               <div>
                  <label className={labelClasses}>שם הסוכן המטפל</label>
                  <input name="agentName" className={inputClasses} onChange={handleChange} value={formData.agentName} required />
               </div>
          </div>

          <div>
            <label className={labelClasses}>אימייל למשלוח לידים</label>
            <input type="email" name="agentEmail" placeholder="your@email.com" className={inputClasses} onChange={handleChange} value={formData.agentEmail} required />
          </div>

          <div>
            <label className={labelClasses}>תמונות הנכס</label>
            <div className="relative border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-brand-accent transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <p className="text-slate-400 text-sm">{images.length > 0 ? `${images.length} תמונות נבחרו` : 'לחץ או גרור תמונות כאן'}</p>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-brand-accent hover:bg-brand-accentHover text-white font-black text-xl py-5 rounded-2xl shadow-xl transition-all disabled:opacity-50">
            {isLoading ? 'ה-AI בונה את הדף...' : 'צור דף נחיתה עכשיו'}
          </button>
        </form>
      </div>
    </div>
  );
};