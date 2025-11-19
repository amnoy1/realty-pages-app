import React, { useState, useRef } from 'react';
import type { PropertyFormData } from '../types';

// --- Icons (Fixed sizes via attributes for robustness) ---
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const PriceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-10 10c0 1.88.52 3.64 1.45 5.15L2 22l5.26-1.38A9.95 9.95 0 0 0 12 22a10 10 0 1 0 0-20zm0 18.27c-1.48 0-2.92-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.25 8.25 0 0 1-1.26-4.38c0-4.54 3.68-8.22 8.22-8.22s8.22 3.68 8.22 8.22-3.68 8.22-8.22 8.22zm4.52-6.14c-.25-.12-1.47-.72-1.7-.82s-.39-.12-.56.12c-.17.25-.64.82-.79.98s-.29.17-.54.06c-.25-.12-1.06-.39-2.02-1.24s-1.45-1.95-1.61-2.29c-.17-.34-.02-.52.11-.64s.25-.29.37-.43c.12-.14.17-.25.25-.41s.12-.3-.06-.54c-.18-.25-.56-1.35-.77-1.84s-.41-.41-.56-.41h-.48c-.17 0-.43.06-.64.3s-.82.79-.82 1.95c0 1.15.84 2.27.96 2.43s1.64 2.51 4 3.5c.59.25 1.05.4 1.41.51.62.2 1.17.17 1.62.1.48-.06 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18s-.21-.17-.46-.29z"></path></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
const DescriptionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>;

export const CreationForm: React.FC<{ onSubmit: (details: PropertyFormData) => void; isLoading: boolean; }> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Omit<PropertyFormData, 'images' | 'logo'>>({
    address: '', description: '', price: '', agentName: '', agentEmail: '', agentWhatsApp: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [logo, setLogo] = useState<string | undefined>();
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
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
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('חובה להעלות לפחות תמונה אחת כדי שהדף ייראה מקצועי.');
      return;
    }
    onSubmit({ ...formData, images, logo });
  };
  
  const handleDeleteImage = (indexToDelete: number) => setImages(current => current.filter((_, i) => i !== indexToDelete));
  
  // Drag and Drop Logic
  const handleDragStart = (position: number) => dragItem.current = position;
  const handleDragEnter = (position: number) => dragOverItem.current = position;
  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) return;
    const newImages = [...images];
    const dragItemContent = newImages.splice(dragItem.current, 1)[0];
    newImages.splice(dragOverItem.current, 0, dragItemContent);
    setImages(newImages);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
        {/* Background Ambiance */}
        <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
        <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-accent/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-6xl z-10 relative">
        <header className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-white/5 rounded-full border border-white/10 mb-6 backdrop-blur-sm shadow-lg">
                <SparklesIcon />
                <span className="mr-2 text-brand-accent font-bold tracking-wider text-sm uppercase">Gemini 3 Pro Powered</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">
                מחולל נדל"ן <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-brand-accent">AI</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
                הכנס את פרטי הנכס, והבינה המלאכותית תבנה לך דף נחיתה יוקרתי, תכתוב את התוכן השיווקי ותעצב הכל אוטומטית.
            </p>
        </header>
        
        <form onSubmit={handleSubmit} className="animate-fade-in space-y-8">
            
            {/* Section 1: Property & Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Col: Inputs */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="card-glass p-8 border-t-4 border-t-brand-accent">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent border border-brand-accent/20">
                                <BuildingIcon />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">פרטי הנכס</h2>
                                <p className="text-sm text-slate-400">המידע הזה ישמש את ה-AI לכתיבת התוכן</p>
                            </div>
                        </div>
                        
                        <div className="space-y-5">
                            <InputField 
                                icon={<BuildingIcon/>} 
                                name="address" 
                                label="כתובת הנכס" 
                                placeholder="לדוגמה: דיזינגוף 100, תל אביב" 
                                value={formData.address} 
                                onChange={handleChange} 
                                required 
                            />
                            <InputField 
                                icon={<PriceIcon/>} 
                                name="price" 
                                label="מחיר מבוקש" 
                                placeholder="לדוגמה: 4,500,000 ₪" 
                                value={formData.price} 
                                onChange={handleChange} 
                                required 
                            />
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                    <DescriptionIcon /> תיאור חופשי (טקסט גולמי)
                                </label>
                                <div className="relative">
                                    <textarea 
                                        name="description" 
                                        rows={5} 
                                        className="input-glass resize-none text-lg leading-relaxed" 
                                        placeholder="רשום כאן את כל הפרטים שיש לך: קומה, חדרים, משופץ, כיווני אוויר... ה-AI יעשה מזה קסמים." 
                                        value={formData.description} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-glass p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                <UserIcon />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">פרטי התקשרות</h2>
                                <p className="text-sm text-slate-400">יופיעו בטופס הלידים ובכפתורי ה-WhatsApp</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField icon={<UserIcon/>} name="agentName" label="שם המתווך" placeholder="שם מלא" value={formData.agentName} onChange={handleChange} required />
                            <InputField icon={<WhatsAppIcon/>} name="agentWhatsApp" label="WhatsApp (מספר מלא)" placeholder="97250..." value={formData.agentWhatsApp} onChange={handleChange} required />
                            <div className="md:col-span-2">
                                <InputField icon={<EmailIcon/>} name="agentEmail" label="אימייל ללידים" placeholder="email@example.com" value={formData.agentEmail} onChange={handleChange} required type="email" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Media */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="card-glass p-8 h-full flex flex-col">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                                <ImageIcon />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">גלריה ולוגו</h2>
                                <p className="text-sm text-slate-400">תמונות איכותיות מוכרות נכסים</p>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col gap-6">
                            {/* Upload Area */}
                            <label className="relative group cursor-pointer">
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                />
                                <div className="border-2 border-dashed border-slate-600 group-hover:border-brand-accent rounded-3xl p-12 text-center bg-slate-900/50 transition-all duration-300 hover:bg-slate-800/80">
                                    <div className="mx-auto w-16 h-16 mb-4 text-slate-400 group-hover:text-brand-accent transition-colors bg-slate-800 rounded-full flex items-center justify-center shadow-xl border border-slate-700">
                                        <UploadIcon />
                                    </div>
                                    <p className="text-lg font-medium text-white mb-1">העלאת תמונות</p>
                                    <p className="text-sm text-slate-500">לחץ או גרור לכאן</p>
                                </div>
                            </label>

                            {/* Preview Grid */}
                            {images.length > 0 && (
                                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50">
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <span className="text-xs text-slate-400">נבחרו {images.length} תמונות (גרירה לסידור)</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                        {images.map((img, index) => (
                                            <div 
                                                key={index} 
                                                className="relative aspect-w-1 aspect-h-1 group rounded-lg overflow-hidden cursor-move shadow-sm ring-1 ring-white/10"
                                                draggable 
                                                onDragStart={() => handleDragStart(index)} 
                                                onDragEnter={() => handleDragEnter(index)} 
                                                onDragEnd={handleDrop} 
                                                onDragOver={(e) => e.preventDefault()}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDeleteImage(index)} 
                                                    className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                >
                                                    <TrashIcon />
                                                </button>
                                                {index === 0 && (
                                                    <div className="absolute bottom-0 inset-x-0 bg-brand-accent/90 text-white text-[10px] text-center py-0.5 font-bold">ראשית</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Logo */}
                            <div className="mt-auto pt-6 border-t border-white/5">
                                <span className="block text-sm font-medium text-slate-400 mb-3">לוגו המשרד (אופציונלי)</span>
                                <label className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 cursor-pointer hover:border-brand-accent/50 transition-colors group">
                                    <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden">
                                        {logo ? (
                                            <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                                        ) : (
                                            <span className="text-slate-300 text-[10px] text-center">אין לוגו</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm text-white font-medium group-hover:text-brand-accent transition-colors">לחץ להעלאת לוגו</span>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="sticky bottom-6 z-50 max-w-md mx-auto">
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full btn-gold text-xl py-4 flex items-center justify-center gap-3 shadow-2xl shadow-black/50 border border-white/20"
                >
                    {isLoading ? (
                        <>
                            <Spinner />
                            <span>מעבד נתונים...</span>
                        </>
                    ) : (
                        <>
                            <span>צור דף נחיתה</span>
                            <SparklesIcon />
                        </>
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

const InputField: React.FC<{ icon: React.ReactNode; name: string; label: string; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; type?: string; }> = ({ icon, name, label, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <div className="relative group">
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 group-focus-within:text-brand-accent transition-colors pointer-events-none">
                {icon}
            </div>
            <input 
                id={name} 
                name={name} 
                {...props} 
                className="input-glass pr-12" 
            />
        </div>
    </div>
);

const Spinner: React.FC = () => (
    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
