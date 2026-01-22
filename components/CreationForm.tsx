
import React, { useState, useRef } from 'react';
import type { PropertyFormData } from '../types';

const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const PriceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-10 10c0 1.88.52 3.64 1.45 5.15L2 22l5.26-1.38A9.95 9.95 0 0 0 12 22a10 10 0 1 0 0-20zm0 18.27c-1.48 0-2.92-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.25 8.25 0 0 1-1.26-4.38c0-4.54 3.68-8.22 8.22-8.22s8.22 3.68 8.22 8.22-3.68 8.22-8.22 8.22zm4.52-6.14c-.25-.12-1.47-.72-1.7-.82s-.39-.12-.56.12c-.17.25-.64.82-.79.98s-.29.17-.54.06c-.25-.12-1.06-.39-2.02-1.24s-1.45-1.95-1.61-2.29c-.17-.34-.02-.52.11-.64s.25-.29.37-.43c.12-.14.17-.25.25-.41s.12-.3-.06-.54c-.18-.25-.56-1.35-.77-1.84s-.41-.41-.56-.41h-.48c-.17 0-.43.06-.64.3s-.82.79-.82 1.95c0 1.15.84 2.27.96 2.43s1.64 2.51 4 3.5c.59.25 1.05.4 1.41.51.62.2 1.17.17 1.62.1.48-.06 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18s-.21-.17-.46-.29z"></path></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;

const AUDIENCE_OPTIONS = [
  "לא רלבנטי",
  "משפחות צעירות",
  "משקיעי נדל\"ן",
  "משפרי דיור",
  "מבוגרים (Downsizers)"
];

export const CreationForm: React.FC<{ onSubmit: (details: PropertyFormData) => void; isLoading: boolean; }> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Omit<PropertyFormData, 'images' | 'logo'>>({
    address: '', description: '', price: '', agentName: '', agentEmail: '', agentWhatsApp: '', targetAudience: [], propertyTitle: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const [logo, setLogo] = useState<string | undefined>();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAudienceToggle = (option: string) => {
    setFormData(prev => {
      const current = prev.targetAudience || [];
      if (option === "לא רלבנטי") return { ...prev, targetAudience: ["לא רלבנטי"] };
      const filtered = current.filter(o => o !== "לא רלבנטי");
      return filtered.includes(option) 
        ? { ...prev, targetAudience: filtered.filter(o => o !== option) }
        : { ...prev, targetAudience: [...filtered, option] };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const filePromises = files.map((file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }));
      Promise.all(filePromises).then(res => setImages(prev => [...prev, ...res].slice(0, 10)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('נא להעלות לפחות תמונה אחת.');
      return;
    }
    onSubmit({ ...formData, images, logo });
  };

  const cardClasses = "bg-slate-800/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8";
  const inputClasses = "w-full px-5 py-4 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-accent outline-none transition-all";

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-4 flex flex-col items-center justify-center relative overflow-hidden" dir="rtl">
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]"></div>
        </div>

      <div className="w-full max-w-5xl z-10 animate-fade-in">
        <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 font-sans">
                מחולל <span className="text-brand-accent">דפי נחיתה</span> SEO
            </h1>
            <p className="text-xl text-slate-400 font-sans">הזן כתובת וכותרת, ואנחנו נבנה עבורך דף מנצח בעזרת בינה מלאכותית.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={cardClasses}>
                    <h2 className="text-xl font-bold text-white mb-8 border-b border-slate-700 pb-4">פרטים בסיסיים</h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400">כותרת הנכס</label>
                            <input name="propertyTitle" placeholder="לדוגמה: פנטהאוז חלומי עם נוף לים" value={formData.propertyTitle} onChange={handleChange} required className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400">כתובת מלאה</label>
                            <input name="address" placeholder="רחוב, מספר, עיר" value={formData.address} onChange={handleChange} required className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400">מחיר שיווק</label>
                            <input name="price" placeholder="₪ 0,000,000" value={formData.price} onChange={handleChange} className={inputClasses} />
                        </div>
                    </div>
                </div>

                <div className={cardClasses}>
                    <h2 className="text-xl font-bold text-white mb-8 border-b border-slate-700 pb-4">מדיה וקהל יעד</h2>
                    <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400">קהל יעד</label>
                            <div className="flex flex-wrap gap-2">
                                {AUDIENCE_OPTIONS.map(opt => (
                                    <button key={opt} type="button" onClick={() => handleAudienceToggle(opt)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${formData.targetAudience?.includes(opt) ? 'bg-brand-accent border-brand-accent text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'}`}>{opt}</button>
                                ))}
                            </div>
                        </div>
                        <div className="relative border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center bg-slate-900/50 hover:border-brand-accent transition-all cursor-pointer">
                            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <UploadIcon />
                            <p className="mt-2 text-sm text-white font-bold">{images.length > 0 ? `${images.length} תמונות נבחרו` : 'לחץ להעלאת תמונות'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cardClasses}>
                <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">מידע נוסף לסוכן (אופציונלי)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input name="agentName" placeholder="שם הסוכן" value={formData.agentName} onChange={handleChange} required className={inputClasses} />
                    <input name="agentWhatsApp" placeholder="וואטסאפ (972...)" value={formData.agentWhatsApp} onChange={handleChange} required className={inputClasses} />
                </div>
                <textarea name="description" rows={4} placeholder="תיאור נוסף, דגשים מיוחדים או נתונים טכניים (חדרים, מ'ר וכו')" value={formData.description} onChange={handleChange} className={`${inputClasses} mt-6`} />
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-brand-accent hover:bg-brand-accentHover text-white py-5 rounded-2xl font-black text-2xl shadow-2xl transition-all disabled:opacity-50">
                {isLoading ? 'מנתח כתובת ומייצר SEO עמוק...' : 'צור דף נחיתה מנצח עכשיו'}
            </button>
        </form>
      </div>
    </div>
  );
};
