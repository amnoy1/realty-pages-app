import React, { useState, useRef } from 'react';
import type { PropertyFormData } from '../types';

// Icons
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
const PriceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line strokeLinecap="round" strokeLinejoin="round" x1="12" y1="1" x2="12" y2="23"></line><path strokeLinecap="round" strokeLinejoin="round" d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" fill="currentColor"><path d="M12 2a10 10 0 0 0-10 10c0 1.88.52 3.64 1.45 5.15L2 22l5.26-1.38A9.95 9.95 0 0 0 12 22a10 10 0 1 0 0-20zm0 18.27c-1.48 0-2.92-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.25 8.25 0 0 1-1.26-4.38c0-4.54 3.68-8.22 8.22-8.22s8.22 3.68 8.22 8.22-3.68 8.22-8.22 8.22zm4.52-6.14c-.25-.12-1.47-.72-1.7-.82s-.39-.12-.56.12c-.17.25-.64.82-.79.98s-.29.17-.54.06c-.25-.12-1.06-.39-2.02-1.24s-1.45-1.95-1.61-2.29c-.17-.34-.02-.52.11-.64s.25-.29.37-.43c.12-.14.17-.25.25-.41s.12-.3-.06-.54c-.18-.25-.56-1.35-.77-1.84s-.41-.41-.56-.41h-.48c-.17 0-.43.06-.64.3s-.82.79-.82 1.95c0 1.15.84 2.27.96 2.43s1.64 2.51 4 3.5c.59.25 1.05.4 1.41.51.62.2 1.17.17 1.62.1.48-.06 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18s-.21-.17-.46-.29z"></path></svg>;

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
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="container mx-auto max-w-6xl w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-10">
          <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">מחולל דפי נחיתה לנדל"ן</h1>
              <p className="text-slate-300 text-lg">הזן את פרטי הנכס וצור דף נחיתה מקצועי וממיר ברגע</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-12 gap-y-10">

              {/* Form Fields Column */}
              <div className="lg:col-span-3 space-y-10">
                <section>
                  <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-3 mb-6">פרטי הנכס</h2>
                  <div className="space-y-6">
                    <InputField icon={<BuildingIcon/>} name="address" label="כתובת הנכס המלאה" placeholder="לדוגמה: רוטשילד 16, תל אביב" value={formData.address} onChange={handleChange} required />
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-slate-200 mb-2">תיאור הנכס</label>
                      <textarea id="description" name="description" rows={6} className="form-textarea w-full bg-slate-700 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="ספרו על הנכס, היתרונות שלו, והסביבה. תיאור זה ישודרג אוטומטית על ידי AI לכותרת ותיאור שיווקיים." value={formData.description} onChange={handleChange} required />
                      <p className="text-xs text-slate-400 mt-2">התיאור הזה ישמש ליצירת כותרת ותיאור משופרים באמצעות בינה מלאכותית.</p>
                    </div>
                    <InputField icon={<PriceIcon/>} name="price" label="מחיר שיווק" placeholder="לדוגמה: 5,400,000 ₪" value={formData.price} onChange={handleChange} required />
                  </div>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-3 mb-6">פרטי הסוכן</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField icon={<UserIcon/>} name="agentName" label="סוכן מטפל" placeholder="שם מלא" value={formData.agentName} onChange={handleChange} required />
                      <InputField icon={<EmailIcon/>} name="agentEmail" label="דוא'ל לקבלת פניות" placeholder="your-email@example.com" value={formData.agentEmail} onChange={handleChange} required type="email" />
                    </div>
                    <InputField icon={<WhatsAppIcon/>} name="agentWhatsApp" label="מספר ווצאפ של הסוכן" placeholder="בפורמט בינלאומי, לדוגמה: 972501234567" value={formData.agentWhatsApp} onChange={handleChange} required />
                  </div>
                </section>
              </div>

              {/* Media Column */}
              <div className="lg:col-span-2">
                <section>
                  <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-3 mb-6">מדיה</h2>
                  <div className="space-y-8">
                      <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">תמונות הנכס (עד 10)</label>
                          <div className="mt-1 flex justify-center p-6 border-2 border-slate-600 border-dashed rounded-lg bg-slate-800 hover:border-slate-500 transition">
                              <div className="space-y-1 text-center">
                                  <FileUploadIcon/>
                                  <div className="flex text-sm text-slate-300">
                                      <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-blue-500">
                                          <span>העלה קבצים</span>
                                          <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} />
                                      </label>
                                      <p className="pr-1">או גרור ושחרר</p>
                                  </div>
                                  <p className="text-xs text-slate-400">התמונה הראשונה שתעלה תהיה תמונת הנושא</p>
                              </div>
                          </div>
                      </div>
                      
                      {images.length > 0 && (
                          <div>
                              <h3 className="text-sm font-medium text-slate-200 mb-2">גרור כדי לסדר מחדש:</h3>
                              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                                  {images.map((img, index) => (
                                      <div key={index} className="relative group cursor-grab active:cursor-grabbing aspect-w-1 aspect-h-1" draggable onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDrop} onDragOver={(e) => e.preventDefault()}>
                                          <img src={img} alt={`preview ${index}`} className="w-full h-full object-cover rounded-lg shadow-md pointer-events-none" />
                                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg"></div>
                                          <button type="button" onClick={() => handleDeleteImage(index)} className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 leading-none opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100" aria-label={`מחק תמונה ${index + 1}`}>
                                              <DeleteIcon />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">לוגו המשרד (אופציונלי)</label>
                          <div className="mt-1 flex items-center gap-4">
                              <div className="h-20 w-20 bg-slate-700/50 border border-slate-700 rounded-md flex items-center justify-center">
                                  {logo ? <img src={logo} alt="logo preview" className="h-full w-full object-contain rounded-md p-1" /> : <LogoIcon />}
                              </div>
                              <label htmlFor="logo-upload" className="cursor-pointer bg-slate-700 py-2 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-200 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 transition">
                                  <span>{logo ? 'החלף לוגו' : 'בחר לוגו'}</span>
                                  <input id="logo-upload" name="logo-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleLogoChange} />
                              </label>
                          </div>
                      </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-700">
              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105">
                {isLoading ? (<><Spinner />מעבד ויוצר קסם...</>) : 'צור דף נחיתה'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{ icon: React.ReactNode; name: string; label: string; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; type?: string; }> = ({ icon, name, label, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-200 mb-2">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">{icon}</div>
            <input id={name} name={name} {...props} className="form-input w-full pr-10 bg-slate-700 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 transition" />
        </div>
    </div>
);

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);