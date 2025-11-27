import React, { useState, useRef } from 'react';
import type { PropertyFormData } from '../types';

// --- Icons (Fixed Sizes & Styling) ---
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const PriceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-10 10c0 1.88.52 3.64 1.45 5.15L2 22l5.26-1.38A9.95 9.95 0 0 0 12 22a10 10 0 1 0 0-20zm0 18.27c-1.48 0-2.92-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.25 8.25 0 0 1-1.26-4.38c0-4.54 3.68-8.22 8.22-8.22s8.22 3.68 8.22 8.22-3.68 8.22-8.22 8.22zm4.52-6.14c-.25-.12-1.47-.72-1.7-.82s-.39-.12-.56.12c-.17.25-.64.82-.79.98s-.29.17-.54.06c-.25-.12-1.06-.39-2.02-1.24s-1.45-1.95-1.61-2.29c-.17-.34-.02-.52.11-.64s.25-.29.37-.43c.12-.14.17-.25.25-.41s.12-.3-.06-.54c-.18-.25-.56-1.35-.77-1.84s-.41-.41-.56-.41h-.48c-.17 0-.43.06-.64.3s-.82.79-.82 1.95c0 1.15.84 2.27.96 2.43s1.64 2.51 4 3.5c.59.25 1.05.4 1.41.51.62.2 1.17.17 1.62.1.48-.06 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18s-.21-.17-.46-.29z"></path></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;


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
      alert('נא להעלות לפחות תמונה אחת של הנכס.');
      return;
    }
    onSubmit({ ...formData, images, logo });
  };
  
  const handleDeleteImage = (indexToDelete: number) => setImages(current => current.filter((_, i) => i !== indexToDelete));
  
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

  // Inline styling classes to guarantee rendering
  const cardClasses = "bg-slate-800/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl";
  const inputClasses = "w-full px-5 py-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all duration-200 backdrop-blur-sm hover:bg-slate-800/70";
  const btnClasses = "py-4 px-8 bg-gradient-to-r from-brand-accent to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-900/30 transform transition-all duration-200 hover:-translate-y-1 hover:shadow-orange-500/40 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none";

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
        {/* Decorative Background Elements - Enhanced */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        </div>

      <div className="w-full max-w-6xl z-10 animate-fade-in">
        <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
                מחולל <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-yellow-400">דפי נחיתה</span> לנדל"ן
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
                הפכו נתונים יבשים לדפי נחיתה יוקרתיים שמוכרים נכסים.
                <br/>
                <span className="text-brand-accent font-medium">מופעל על ידי Gemini 2.0 AI</span>
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Main Details - 8 Columns */}
                <div className="lg:col-span-7 space-y-8">
                    <div className={`${cardClasses} p-8 border-t-4 border-brand-accent`}>
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 pb-4 border-b border-slate-700/50">
                            <span className="bg-brand-accent p-2 rounded-lg text-white shadow-lg shadow-orange-500/20"><BuildingIcon /></span>
                            פרטי הנכס
                        </h2>
                        <div className="space-y-6">
                            <InputField 
                                icon={<BuildingIcon/>} 
                                name="address" 
                                label="כתובת הנכס" 
                                placeholder="לדוגמה: שדרות רוטשילד 10, תל אביב" 
                                value={formData.address} 
                                onChange={handleChange} 
                                required 
                                className={inputClasses}
                            />
                            <InputField 
                                icon={<PriceIcon/>} 
                                name="price" 
                                label="מחיר שיווק" 
                                placeholder="לדוגמה: 4,500,000 ₪" 
                                value={formData.price} 
                                onChange={handleChange} 
                                required 
                                className={inputClasses}
                            />
                            <div>
                                <label className="block text-sm font-medium text-brand-accent mb-2">תיאור הנכס (טקסט חופשי)</label>
                                <textarea 
                                    name="description" 
                                    rows={6} 
                                    className={`${inputClasses} resize-none leading-relaxed`} 
                                    placeholder="ספרו לנו על הנכס בחופשיות... כמה חדרים? איזה קומה? יש מרפסת? חניה? כיווני אוויר? ה-AI שלנו ייקח את המידע הזה ויבנה ממנו סיפור מכירה מנצח." 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`${cardClasses} p-8`}>
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 pb-4 border-b border-slate-700/50">
                            <span className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20"><UserIcon /></span>
                            פרטי קשר להצגה באתר
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField icon={<UserIcon/>} name="agentName" label="שם הסוכן" placeholder="ישראל ישראלי" value={formData.agentName} onChange={handleChange} required className={inputClasses} />
                            <InputField icon={<WhatsAppIcon/>} name="agentWhatsApp" label="וואטסאפ (מספר מלא)" placeholder="972501234567" value={formData.agentWhatsApp} onChange={handleChange} required className={inputClasses} />
                            <div className="md:col-span-2">
                                <InputField icon={<EmailIcon/>} name="agentEmail" label="אימייל לקבלת לידים" placeholder="agent@agency.com" value={formData.agentEmail} onChange={handleChange} required type="email" className={inputClasses} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Media Sidebar - 4 Columns */}
                <div className="lg:col-span-5 space-y-8">
                    <div className={`${cardClasses} p-8 h-full flex flex-col`}>
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 pb-4 border-b border-slate-700/50">
                             <span className="bg-purple-600 p-2 rounded-lg text-white shadow-lg shadow-purple-500/20"><ImageIcon /></span>
                            מדיה ולוגו
                        </h2>
                        
                        <div className="flex-1 flex flex-col gap-8">
                            {/* Image Upload Area */}
                            <div className="relative group flex-1 min-h-[250px]">
                                <input 
                                    type="file" 
                                    id="file-upload" 
                                    multiple 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                                />
                                <div className="absolute inset-0 border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center bg-slate-800/30 group-hover:border-brand-accent group-hover:bg-slate-800/50 transition-all duration-300 flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-brand-accent/20 group-hover:text-brand-accent text-slate-400">
                                        <UploadIcon />
                                    </div>
                                    <p className="text-lg font-medium text-white">לחץ כאן או גרור תמונות</p>
                                    <p className="text-sm text-slate-400 mt-2">JPG, PNG עד 10 תמונות</p>
                                </div>
                            </div>

                            {/* Image Grid */}
                            {images.length > 0 && (
                                <div className="bg-slate-900/50 rounded-xl p-4">
                                    <p className="text-sm text-slate-400 mb-3 flex justify-between">
                                        <span>תמונות שנבחרו ({images.length})</span>
                                        <span className="text-brand-accent text-xs">ניתן לגרור לשינוי סדר</span>
                                    </p>
                                    <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[240px] pr-2 custom-scrollbar">
                                        {images.map((img, index) => (
                                            <div 
                                                key={index} 
                                                className="relative aspect-w-1 aspect-h-1 group rounded-lg overflow-hidden cursor-move ring-1 ring-white/10 hover:ring-brand-accent"
                                                draggable 
                                                onDragStart={() => handleDragStart(index)} 
                                                onDragEnter={() => handleDragEnter(index)} 
                                                onDragEnd={handleDrop} 
                                                onDragOver={(e) => e.preventDefault()}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDeleteImage(index)} 
                                                        className="text-white hover:text-red-400 p-2"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                                {index === 0 && <div className="absolute top-0 right-0 bg-brand-accent text-white text-[10px] px-1.5 py-0.5 font-bold rounded-bl">ראשי</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Logo Upload */}
                            <div className="pt-6 border-t border-slate-700/50">
                                <label className="block text-sm font-medium text-brand-accent mb-3">לוגו המשרד (אופציונלי)</label>
                                <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                    <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                                        {logo ? (
                                            <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                                        ) : (
                                            <span className="text-slate-300 text-xs text-center px-1">אין לוגו</span>
                                        )}
                                    </div>
                                    <label className="flex-1 cursor-pointer group">
                                        <div className="bg-slate-700 group-hover:bg-slate-600 text-white py-2.5 px-4 rounded-lg text-sm text-center transition-colors font-medium border border-white/5">
                                            בחר קובץ לוגו
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 pb-12">
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className={`${btnClasses} w-full text-xl py-5 flex items-center justify-center gap-4 group`}
                >
                    {isLoading ? (
                        <>
                            <Spinner />
                            <span className="animate-pulse">ה-AI מנתח את הנכס ובונה את הדף...</span>
                        </>
                    ) : (
                        <>
                            <span>צור דף נחיתה עכשיו</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </>
                    )}
                </button>
                <p className="text-center text-slate-500 mt-4 text-sm">לחיצה על הכפתור תיצור דף נחיתה ציבורי שניתן לשיתוף</p>
            </div>
        </form>
      </div>
    </div>
  );
};

const InputField: React.FC<{ icon: React.ReactNode; name: string; label: string; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; type?: string; className: string }> = ({ icon, name, label, className, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 group-focus-within:text-brand-accent transition-colors">
                {icon}
            </div>
            <input 
                id={name} 
                name={name} 
                {...props} 
                className={`${className} pr-12`} 
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