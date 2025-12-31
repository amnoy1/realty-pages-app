import React, { useState } from 'react';
import type { PropertyFormData } from '../types';

const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

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
      Promise.all(filePromises).then(base64Images => setImages(prev => [...prev, ...base64Images].slice(0, 10)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address) {
      alert('נא להזין כתובת נכס.');
      return;
    }
    onSubmit({ ...formData, images, logo });
  };

  const inputClasses = "w-full px-5 py-4 bg-slate-800/60 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent outline-none transition-all";
  const labelClasses = "block text-sm font-semibold text-slate-300 mb-2 mr-2";

  return (
    <div className="min-h-screen bg-slate-900 py-16 px-4 flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">יצירת דף <span className="text-brand-accent">נחיתה</span></h1>
          <p className="text-slate-400 text-lg">הזינו את פרטי הנכס וה-AI ייצור את השאר</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl">
          <div>
            <label className={labelClasses}>כותרת שיווקית חופשית</label>
            <input name="description" placeholder="לדוגמה: דירת 4 חדרים משופצת מהיסוד..." className={inputClasses} onChange={handleChange} value={formData.description} required />
          </div>

          <div>
            <label className={labelClasses}>כתובת הנכס</label>
            <input name="address" placeholder="רחוב ומספר, עיר" className={inputClasses} onChange={handleChange} value={formData.address} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className={labelClasses}>מחיר</label>
                  <input name="price" placeholder="4,200,000 ₪" className={inputClasses} onChange={handleChange} value={formData.price} required />
               </div>
               <div>
                  <label className={labelClasses}>שם הסוכן</label>
                  <input name="agentName" className={inputClasses} onChange={handleChange} value={formData.agentName} required />
               </div>
          </div>

          <div>
            <label className={labelClasses}>אימייל לקבלת לידים</label>
            <input type="email" name="agentEmail" placeholder="your@email.com" className={inputClasses} onChange={handleChange} value={formData.agentEmail} required />
          </div>

          <div>
            <label className={labelClasses}>תמונות הנכס (עד 10)</label>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600" />
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-brand-accent hover:bg-brand-accentHover text-white font-black text-xl py-5 rounded-2xl shadow-xl transition-all disabled:opacity-50">
            {isLoading ? 'ה-AI בונה את הדף...' : 'צור דף נחיתה'}
          </button>
        </form>
      </div>
    </div>
  );
};