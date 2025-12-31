import React, { useState, useRef } from 'react';
import type { PropertyFormData } from '../types';

// --- Icons ---
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-10 10c0 1.88.52 3.64 1.45 5.15L2 22l5.26-1.38A9.95 9.95 0 0 0 12 22a10 10 0 1 0 0-20zm0 18.27c-1.48 0-2.92-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.25 8.25 0 0 1-1.26-4.38c0-4.54 3.68-8.22 8.22-8.22s8.22 3.68 8.22 8.22-3.68 8.22-8.22 8.22zm4.52-6.14c-.25-.12-1.47-.72-1.7-.82s-.39-.12-.56.12c-.17.25-.64.82-.79.98s-.29.17-.54.06c-.25-.12-1.06-.39-2.02-1.24s-1.45-1.95-1.61-2.29c-.17-.34-.02-.52.11-.64s.25-.29.37-.43c.12-.14.17-.25.25-.41s.12-.3-.06-.54c-.18-.25-.56-1.35-.77-1.84s-.41-.41-.56-.41h-.48c-.17 0-.43.06-.64.3s-.82.79-.82 1.95c0 1.15.84 2.27.96 2.43s1.64 2.51 4 3.5c.59.25 1.05.4 1.41.51.62.2 1.17.17 1.62.1.48-.06 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18s-.21-.17-.46-.29z"></path></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export const CreationForm: React.FC<{ onSubmit: (details: PropertyFormData) => void; isLoading: boolean; }> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Omit<PropertyFormData, 'images' | 'logo'>>({
    address: '', description: '', price: '', agentName: '', agentEmail: '', agentWhatsApp: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [logo, setLogo] = useState<string | undefined>();
  
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
      Promise.all(filePromises)
        .then(base64Images => setImages(prev => [...prev, ...base64Images].slice(0, 10)))
        .catch(error => console.error("Error converting files to base64", error));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address) {
      alert('נא להזין כתובת נכס.');
      return;
    }
    // Set fallback agent info if missing to allow quick generation
    const finalData = {
      ...formData,
      agentName: formData.agentName || "סוכן נדל\"ן",
      agentEmail: formData.agentEmail || "info@example.com",
      agentWhatsApp: formData.agentWhatsApp || "972500000000",
      description: formData.description || `נכס בכתובת ${formData.address}`,
      price: formData.price || "מחיר בתיאום"
    };
    onSubmit({ ...finalData, images, logo });
  };

  const inputClasses = "w-full px-5 py-4 bg-slate-800/60 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all hover:bg-slate-800/80";
  const labelClasses = "block text-sm font-semibold text-slate-300 mb-2 mr-2";

  return (
    <div className="min-h-screen bg-slate-900 py-16 px-4 flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            יצירת דף <span className="text-brand-accent">נחיתה מהיר</span>
          </h1>
          <p className="text-slate-400 text-lg">פשוט הזינו את פרטי הנכס וה-AI יעשה את השאר</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-slate-800/30 p-8 md:p-12 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="space-y-6">
            {/* Essential Fields as requested */}
            <div>
              <label className={labelClasses}>כותרת שיווקית (אופציונלי)</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                  <BuildingIcon />
                </div>
                <input 
                  name="description" 
                  placeholder="לדוגמה: דירת 4 חדרים יוקרתית עם נוף לים" 
                  className={`${inputClasses} pr-12`} 
                  onChange={handleChange} 
                  value={formData.description}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>כתובת הנכס</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                  <MapPinIcon />
                </div>
                <input 
                  name="address" 
                  placeholder="לדוגמה: ז'בוטינסקי 12, רמת גן" 
                  className={`${inputClasses} pr-12`} 
                  onChange={handleChange} 
                  value={formData.address}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className={labelClasses}>מחיר מבוקש</label>
                  <input name="price" placeholder="4,200,000 ₪" className={inputClasses} onChange={handleChange} value={formData.price} />
               </div>
               <div>
                  <label className={labelClasses}>שם הסוכן</label>
                  <input name="agentName" placeholder="ישראל ישראלי" className={inputClasses} onChange={handleChange} value={formData.agentName} />
               </div>
            </div>

            <div className="pt-4">
              <label className={labelClasses}>תמונות הנכס (מומלץ)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent hover:bg-brand-accent/5 transition-all group">
                  <UploadIcon />
                  <span className="text-[10px] mt-2 text-slate-500 group-hover:text-brand-accent">הוסף תמונות</span>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button 
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-brand-accent to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-xl py-5 rounded-2xl shadow-xl shadow-orange-900/20 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>ה-AI בונה את הדף...</span>
              </div>
            ) : 'צור דף נחיתה עכשיו'}
          </button>
        </form>
      </div>
    </div>
  );
};