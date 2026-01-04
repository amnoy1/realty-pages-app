
import React, { useState } from 'react';
import type { PropertyFormData } from '../types';

export const CreationForm: React.FC<{ onSubmit: (details: PropertyFormData) => void; isLoading: boolean; defaultAgentName?: string; defaultAgentEmail?: string; }> = ({ onSubmit, isLoading, defaultAgentName = '', defaultAgentEmail = '' }) => {
  const [formData, setFormData] = useState<Omit<PropertyFormData, 'images' | 'logo'>>({
    address: '', 
    description: '', 
    rawNotes: '',    
    useAsIs: false,  
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

  const mainInputClasses = "w-full px-8 py-6 bg-slate-800/50 border-2 border-slate-700 rounded-[2rem] text-white placeholder-slate-500 focus:ring-4 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all text-right text-2xl font-bold shadow-2xl";
  const subInputClasses = "w-full px-6 py-4 bg-slate-800/30 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent outline-none transition-all text-right";
  const labelClasses = "block text-sm font-black text-brand-accent mb-3 mr-2 uppercase tracking-widest text-right";

  return (
    <div className="min-h-screen bg-slate-900 py-16 px-4" dir="rtl">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
            הפוך נכס <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-orange-400">לסיפור הצלחה</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-xl mx-auto font-medium">הזן פרטים בסיסיים, המערכת תבנה עבורך דף נחיתה יוקרתי תוך שניות.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-8">
            <div className="group">
              <label className={labelClasses}>כותרת שיווקית לנכס</label>
              <input 
                name="description" 
                placeholder="למשל: פנטהאוז חלומי מול הים" 
                className={mainInputClasses} 
                onChange={handleChange} 
                value={formData.description} 
                required 
              />
            </div>

            <div className="group">
              <label className={labelClasses}>כתובת מדויקת</label>
              <input 
                name="address" 
                placeholder="רחוב, מספר ועיר" 
                className={mainInputClasses} 
                onChange={handleChange} 
                value={formData.address} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/20 p-8 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-sm">
            <div>
              <label className={labelClasses}>מחיר מבוקש (₪)</label>
              <input name="price" placeholder="למשל: 3,500,000" className={subInputClasses} onChange={handleChange} value={formData.price} />
            </div>
            <div>
              <label className={labelClasses}>שם הסוכן המטפל</label>
              <input name="agentName" className={subInputClasses} onChange={handleChange} value={formData.agentName} required />
            </div>
          </div>

          <div className="pt-4">
            <label className={labelClasses}>תמונות הנכס (גרירה או לחיצה)</label>
            <div className="relative border-2 border-dashed border-slate-700 rounded-[2rem] p-12 text-center hover:border-brand-accent hover:bg-brand-accent/5 transition-all cursor-pointer group">
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-brand-accent group-hover:scale-110 transition-all">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-slate-400 font-bold text-lg">{images.length > 0 ? `${images.length} תמונות נבחרו` : 'לחץ להעלאת תמונות הנכס'}</p>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-brand-accent hover:bg-orange-600 text-white font-black text-2xl py-7 rounded-[2rem] shadow-2xl shadow-brand-accent/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
          >
            {isLoading ? (
              <>
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>ה-AI יוצר קסם...</span>
              </>
            ) : 'צור דף נחיתה יוקרתי'}
          </button>
        </form>
      </div>
    </div>
  );
};
