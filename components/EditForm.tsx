import React, { useState, useRef } from 'react';
import type { PropertyDetails } from '../types';

interface EditFormProps {
  property: PropertyDetails;
  onSave: (updated: PropertyDetails) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;

export const EditForm: React.FC<EditFormProps> = ({ property, onSave, onCancel, isSaving }) => {
  const [data, setData] = useState<PropertyDetails>({ ...property });
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setData(prev => ({
            ...prev,
            [parent]: {
                ...(prev as any)[parent],
                [child]: value
            }
        }));
    } else {
        setData(prev => ({ ...prev, [name]: value }));
    }
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
        .then(base64Images => {
            setData(prev => ({
                ...prev,
                images: [...prev.images, ...base64Images]
            }));
        })
        .catch(error => console.error("Error converting files", error));
    }
  };

  const handleDeleteImage = (index: number) => {
    setData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const inputClasses = "w-full px-5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent outline-none transition-all";
  const labelClasses = "block text-sm font-medium text-slate-400 mb-2 mt-4";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in" dir="rtl">
        <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                עריכת נכס
            </h1>
            <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">ביטול וחזרה</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Content */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-2">תוכן שיווקי</h3>
                    
                    <label className={labelClasses}>כותרת דף הנחיתה</label>
                    <input name="generatedTitle" value={data.generatedTitle} onChange={handleTextChange} className={inputClasses} />

                    <label className={labelClasses}>תיאור האזור</label>
                    <textarea name="enhancedDescription.area" rows={4} value={data.enhancedDescription.area} onChange={handleTextChange} className={inputClasses} />

                    <label className={labelClasses}>תיאור הנכס</label>
                    <textarea name="enhancedDescription.property" rows={5} value={data.enhancedDescription.property} onChange={handleTextChange} className={inputClasses} />

                    <label className={labelClasses}>קריאה לפעולה</label>
                    <input name="enhancedDescription.cta" value={data.enhancedDescription.cta} onChange={handleTextChange} className={inputClasses} />
                </div>

                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-2">פרטים טכניים</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>מחיר מבוקש</label>
                            <input name="price" value={data.price} onChange={handleTextChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>שם הסוכן</label>
                            <input name="agentName" value={data.agentName} onChange={handleTextChange} className={inputClasses} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Media */}
            <div className="space-y-6">
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-2">תמונות הנכס</h3>
                    
                    <div className="relative mb-6">
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-brand-accent transition-colors flex flex-col items-center">
                            <UploadIcon />
                            <p className="mt-2 text-sm text-slate-400">הוסף תמונות</p>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {data.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 group">
                                <img src={img} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        type="button"
                                        onClick={() => handleDeleteImage(idx)} 
                                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                                {idx === 0 && <div className="absolute top-0 right-0 bg-brand-accent text-white text-[10px] px-2 py-0.5 font-bold rounded-bl">תמונה ראשית</div>}
                            </div>
                        ))}
                    </div>
                </div>
                
                <button 
                    onClick={() => onSave(data)} 
                    disabled={isSaving}
                    className="w-full bg-brand-accent hover:bg-brand-accentHover text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'שמור ופרסם שינויים'}
                </button>
            </div>
        </div>
    </div>
  );
};