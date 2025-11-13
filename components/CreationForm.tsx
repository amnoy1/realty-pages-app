import React, { useState, useRef } from 'react';
import type { PropertyFormData } from '../types';

// Icons
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-8h1m-1 4h1m-1 4h1M5 21v-3a2 2 0 012-2h10a2 2 0 012 2v3" /></svg>;
const PriceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M16.5 14.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM9.5 14.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM2.5 14.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" /></svg>;

const FileUploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 mb-4 text-slate-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
);

const LogoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
          <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">מחולל דפי נחיתה לנדל"ן</h1>
              <p className="text-slate-500 text-lg">הזן את פרטי הנכס וצור דף נחיתה מקצועי וממיר ברגע</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-12">
            <fieldset className="space-y-6">
              <legend className="text-xl font-semibold text-slate-700 border-b border-slate-200 w-full pb-2 mb-4">שלב 1: פרטי הנכס</legend>
              <InputField icon={<BuildingIcon/>} name="address" label="כתובת הנכס המלאה" placeholder="לדוגמה: רוטשילד 16, תל אביב" value={formData.address} onChange={handleChange} required />
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">תיאור הנכס</label>
                <textarea id="description" name="description" rows={6} className="form-textarea w-full" placeholder="ספרו על הנכס, היתרונות שלו, והסביבה. תיאור זה ישודרג אוטומטית על ידי AI לכותרת ותיאור שיווקיים." value={formData.description} onChange={handleChange} required />
                <p className="text-xs text-slate-500 mt-1">התיאור הזה ישמש ליצירת כותרת ותיאור משופרים באמצעות בינה מלאכותית.</p>
              </div>
              <InputField icon={<PriceIcon/>} name="price" label="מחיר שיווק" placeholder="לדוגמה: 5,400,000 ₪" value={formData.price} onChange={handleChange} required />
            </fieldset>

            <fieldset className="space-y-6">
              <legend className="text-xl font-semibold text-slate-700 border-b border-slate-200 w-full pb-2 mb-4">שלב 2: פרטי הסוכן</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField icon={<UserIcon/>} name="agentName" label="סוכן מטפל" placeholder="שם מלא" value={formData.agentName} onChange={handleChange} required />
                <InputField icon={<EmailIcon/>} name="agentEmail" label="דוא'ל לקבלת פניות" placeholder="your-email@example.com" value={formData.agentEmail} onChange={handleChange} required type="email" />
              </div>
              <InputField icon={<WhatsAppIcon/>} name="agentWhatsApp" label="מספר ווצאפ של הסוכן" placeholder="בפורמט בינלאומי, לדוגמה: 972501234567" value={formData.agentWhatsApp} onChange={handleChange} required />
            </fieldset>

            <fieldset className="space-y-6">
                <legend className="text-xl font-semibold text-slate-700 border-b border-slate-200 w-full pb-2 mb-4">שלב 3: מדיה</legend>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">תמונות הנכס (עד 10)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <FileUploadIcon/>
                                <div className="flex text-sm text-slate-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        <span>העלה קבצים</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} />
                                    </label>
                                    <p className="pr-1">או גרור ושחרר</p>
                                </div>
                                <p className="text-xs text-slate-500">מומלץ להעלות את התמונה הראשית כתמונה ראשונה</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">לוגו המשרד (אופציונלי)</label>
                        <div className="mt-1 flex items-center gap-4">
                            <div className="h-24 w-24 bg-slate-100 rounded-md flex items-center justify-center">
                                {logo ? <img src={logo} alt="logo preview" className="h-full w-full object-contain rounded-md p-1" /> : <LogoIcon />}
                            </div>
                            <label htmlFor="logo-upload" className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <span>{logo ? 'החלף לוגו' : 'בחר לוגו'}</span>
                                <input id="logo-upload" name="logo-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleLogoChange} />
                            </label>
                        </div>
                    </div>
                </div>
              
                {images.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-slate-700 mb-2">גרור כדי לסדר מחדש:</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {images.map((img, index) => (
                                <div key={index} className="relative group cursor-grab active:cursor-grabbing aspect-w-1 aspect-h-1" draggable onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDrop} onDragOver={(e) => e.preventDefault()}>
                                    <img src={img} alt={`preview ${index}`} className="w-full h-full object-cover rounded-lg shadow-md pointer-events-none" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg"></div>
                                    <button type="button" onClick={() => handleDeleteImage(index)} className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 leading-none opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100" aria-label={`מחק תמונה ${index + 1}`}>
                                        <DeleteIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </fieldset>

            <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 transition-all duration-300 transform hover:scale-105">
              {isLoading ? (<><Spinner />מעבד ויוצר קסם...</>) : 'צור דף נחיתה'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{ icon: React.ReactNode; name: string; label: string; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; type?: string; }> = ({ icon, name, label, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">{icon}</div>
            <input id={name} name={name} {...props} className="form-input w-full pr-10" />
        </div>
    </div>
);

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
