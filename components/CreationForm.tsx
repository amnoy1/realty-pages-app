
import React, { useState, useRef } from 'react';
import type { PropertyFormData } from '../types';

// App Logo component reflecting the "RE" inside a house icon
const AppLogo = () => (
    <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#0F172A"/>
        <path d="M50 20L20 45V80H80V45L50 20Z" fill="white" fillOpacity="0.1"/>
        <path d="M50 25L25 46V75H75V46L50 25Z" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="44" y="40" width="12" height="12" stroke="white" strokeWidth="2"/>
        <path d="M50 40V52M44 46H56" stroke="white" strokeWidth="2"/>
        <text x="50" y="70" textAnchor="middle" fill="#22D3EE" style={{fontSize: '20px', fontWeight: '900', fontFamily: 'sans-serif'}}>RE</text>
    </svg>
);

const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

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
  const [logo, setLogo] = useState<string | undefined>(undefined);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAudienceToggle = (option: string) => {
    setFormData(prev => {
        const current = prev.targetAudience || [];
        if (option === "לא רלבנטי") return { ...prev, targetAudience: ["לא רלבנטי"] };
        const filtered = current.filter(o => o !== "לא רלבנטי");
        if (filtered.includes(option)) {
            return { ...prev, targetAudience: filtered.filter(o => o !== option) };
        } else {
            return { ...prev, targetAudience: [...filtered, option] };
        }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'logo') => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Explicitly type 'file' as File to ensure it's compatible with Blob-based APIs like reader.readAsDataURL
      const promises = files.map((file: File) => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }));

      Promise.all(promises).then(results => {
        if (type === 'images') setImages(prev => [...prev, ...results]);
        else setLogo(results[0]);
      });
    }
  };

  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
        alert("נא להוסיף לפחות תמונה אחת של הנכס.");
        return;
    }
    onSubmit({ ...formData, images, logo });
  };

  const inputClasses = "w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent outline-none transition-all font-sans";
  const labelClasses = "block text-sm font-bold text-slate-400 mb-2 mr-1 font-sans";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in" dir="rtl">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
            <AppLogo />
        </div>
        <h1 className="text-4xl font-black text-white mb-3 font-sans">מחולל דפי נחיתה לנדל"ן</h1>
        <p className="text-slate-400 font-medium font-sans">צור דף נחיתה מקצועי, ממיר ומותאם SEO תוך דקות</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Core Info - Property Title & Address */}
        <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50 shadow-2xl backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-sans">
                <BuildingIcon /> פרטי הנכס הבסיסיים
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className={labelClasses}>כותרת הנכס (שיווקית)</label>
                    <input 
                      type="text" 
                      name="propertyTitle"
                      value={formData.propertyTitle}
                      onChange={handleChange}
                      placeholder="למשל: פנטהאוז חלומי עם נוף לים"
                      className={inputClasses}
                      required
                    />
                </div>
                <div className="md:col-span-2">
                    <label className={labelClasses}>כתובת מלאה (רחוב, מספר, עיר)</label>
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="למשל: הרצל 10, תל אביב"
                      className={inputClasses}
                      required
                    />
                </div>
                <div>
                    <label className={labelClasses}>מחיר מבוקש (₪)</label>
                    <input 
                      type="text" 
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="למשל: 3,500,000"
                      className={inputClasses}
                      required
                    />
                </div>
            </div>
        </div>

        {/* Media Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Property Images */}
            <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50">
                <label className={labelClasses}>תמונות הנכס (לפחות אחת)</label>
                <div className="relative group cursor-pointer border-2 border-dashed border-slate-600 rounded-3xl p-8 hover:border-brand-accent transition-all text-center">
                    <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'images')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center">
                        <UploadIcon />
                        <p className="mt-3 text-sm text-slate-400 font-sans">גרור תמונות או לחץ להעלאה</p>
                    </div>
                </div>
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-slate-600">
                            <img src={img} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 left-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700">
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Logo Upload */}
            <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50">
                <label className={labelClasses}>לוגו המשרד (אופציונלי)</label>
                <div className="relative group cursor-pointer border-2 border-dashed border-slate-600 rounded-3xl p-8 hover:border-brand-accent transition-all text-center">
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {logo ? (
                        <div className="flex flex-col items-center">
                            <img src={logo} className="h-16 object-contain mb-2" />
                            <p className="text-xs text-brand-accent underline">החלף לוגו</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="mt-3 text-sm text-slate-400 font-sans">העלאת לוגו משרד</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Additional Details */}
        <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50">
            <label className={labelClasses}>תיאור חופשי של הנכס (AI ישדרג אותו)</label>
            <textarea 
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="ספר לנו על הבית, מה מיוחד בו? מה היתרונות של האזור?"
                className={inputClasses}
            />

            <div className="mt-8">
                <label className={labelClasses}>קהל יעד רצוי</label>
                <div className="flex flex-wrap gap-2 mt-3">
                    {AUDIENCE_OPTIONS.map(option => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => handleAudienceToggle(option)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all font-sans border ${
                                formData.targetAudience?.includes(option)
                                ? 'bg-brand-accent border-brand-accent text-white shadow-lg'
                                : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-400'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Agent Info */}
        <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6 font-sans">פרטי התקשרות (יופיעו בדף)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className={labelClasses}>שם הסוכן</label>
                    <input type="text" name="agentName" value={formData.agentName} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label className={labelClasses}>וואטסאפ (ללא מקפים)</label>
                    <input type="text" name="agentWhatsApp" value={formData.agentWhatsApp} onChange={handleChange} placeholder="0500000000" className={inputClasses} required />
                </div>
                <div>
                    <label className={labelClasses}>אימייל לקבלת לידים</label>
                    <input type="email" name="agentEmail" value={formData.agentEmail} onChange={handleChange} className={inputClasses} required />
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-brand-accent to-orange-600 text-white text-2xl font-black shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 font-sans"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>מייצר דף נחיתה מושלם...</span>
            </div>
          ) : 'ייצר דף נחיתה עכשיו'}
        </button>
      </form>
    </div>
  );
};
