
import React, { useState, useRef } from 'react';
import type { PropertyFormData } from '../types';

const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const PriceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const AUDIENCE_OPTIONS = ["משפחות", "משקיעים", "משפרי דיור", "זוגות צעירים", "גיל שלישי"];

export const CreationForm: React.FC<{ onSubmit: (details: PropertyFormData) => void; isLoading: boolean; }> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Omit<PropertyFormData, 'images' | 'logo'>>({
    title: '', address: '', description: '', price: '', agentName: '', agentEmail: '', agentWhatsApp: '', targetAudience: []
  });
  const [images, setImages] = useState<string[]>([]);
  const [logo, setLogo] = useState<string | undefined>();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAudienceToggle = (option: string) => {
    setFormData(prev => {
      const current = prev.targetAudience || [];
      const updated = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
      return { ...prev, targetAudience: updated };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setImages(prev => [...prev, reader.result as string].slice(0, 10));
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return alert('נא להעלות תמונה.');
    onSubmit({ ...formData, images, logo });
  };

  const inputClasses = "w-full pr-12 pl-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-brand-accent";

  return (
    <div className="max-w-4xl mx-auto py-12 px-4" dir="rtl">
      <h1 className="text-4xl font-bold text-center mb-10 text-white">יצירת דף נחיתה</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="space-y-2">
            <label className="text-brand-accent text-sm font-bold">כותרת הנכס</label>
            <div className="relative">
               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"><BuildingIcon/></span>
               <input name="title" className={inputClasses} placeholder="למשל: דירת 4 חדרים מעוצבת" value={formData.title} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-brand-accent text-sm font-bold">כתובת</label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"><MapPinIcon/></span>
                <input name="address" className={inputClasses} placeholder="רחוב, עיר" value={formData.address} onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-brand-accent text-sm font-bold">מחיר</label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"><PriceIcon/></span>
                <input name="price" className={inputClasses} placeholder="₪" value={formData.price} onChange={handleChange} required />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-brand-accent text-sm font-bold">קהל יעד</label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_OPTIONS.map(opt => (
                <button key={opt} type="button" onClick={() => handleAudienceToggle(opt)} className={`px-4 py-2 rounded-lg text-sm transition-all ${formData.targetAudience?.includes(opt) ? 'bg-brand-accent text-white' : 'bg-slate-700 text-slate-300'}`}>{opt}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-brand-accent text-sm font-bold">תיאור חופשי</label>
            <textarea name="description" rows={5} className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white" placeholder="ספר על הנכס..." value={formData.description} onChange={handleChange} required />
          </div>
        </div>

        <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/10">
          <h3 className="text-white font-bold mb-4">תמונות</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center text-slate-500 hover:border-brand-accent hover:text-brand-accent">
              <UploadIcon/>
              <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleFileChange} />
            </button>
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={img} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <input name="agentName" className={inputClasses} placeholder="שם הסוכן" value={formData.agentName} onChange={handleChange} required />
          <input name="agentEmail" type="email" className={inputClasses} placeholder="אימייל" value={formData.agentEmail} onChange={handleChange} required />
          <input name="agentWhatsApp" className={inputClasses} placeholder="וואטסאפ (972...)" value={formData.agentWhatsApp} onChange={handleChange} required />
        </div>

        <button type="submit" disabled={isLoading} className="w-full py-5 bg-brand-accent text-white font-bold rounded-xl text-xl hover:bg-brand-accentHover transition-all disabled:opacity-50">
          {isLoading ? 'מייצר דף נחיתה...' : 'בנה לי דף נחיתה'}
        </button>
      </form>
    </div>
  );
};
