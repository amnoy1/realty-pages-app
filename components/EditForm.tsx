
import React, { useState, useRef } from 'react';
import type { PropertyDetails } from '../types';

interface EditFormProps {
  property: PropertyDetails;
  onSave: (updated: PropertyDetails) => void | Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>;

export const EditForm: React.FC<EditFormProps> = ({ property, onSave, onCancel, isSaving }) => {
  const [data, setData] = useState<PropertyDetails>({ ...property });
  const [isSoldSuccess, setIsSoldSuccess] = useState(false);
  
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

  const handleMarkAsSold = async () => {
    if (window.confirm('האם לסמן את הנכס כנמכר? המערכת תעדכן את הדף ותשמור את הסטטוס החדש.')) {
        const soldTitle = data.generatedTitle.includes('נמכר') 
            ? data.generatedTitle 
            : `${data.generatedTitle} - נמכר!`;
        
        const updatedData: PropertyDetails = {
            ...data,
            generatedTitle: soldTitle,
            isSold: true
        };
        
        try {
            await onSave(updatedData);
            setIsSoldSuccess(true);
        } catch (err) {
            console.error("Failed to mark as sold", err);
        }
    }
  };

  const shareOnFacebook = (target: 'feed' | 'page' = 'feed') => {
    const url = `${window.location.origin}/${data.slug}-${data.id}`;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}${target === 'page' ? '&share_channel=page_pinnable' : ''}`;
    window.open(shareUrl, 'facebook-share-dialog', 'width=626,height=436');
  };

  const shareOnWhatsApp = () => {
    const url = `${window.location.origin}/${data.slug}-${data.id}`;
    const text = `🏠 עוד נכס נמכר בהצלחה בבלעדיות!\n📍 ${data.address}\n\nשמח לבשר שהעסקה נחתמה והנכס עבר לבעליו החדשים. מחפשים למכור/לקנות? דברו איתי!\n\nלצפייה בנכס שנמכר:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const inputClasses = "w-full px-5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent outline-none transition-all";
  const labelClasses = "block text-sm font-medium text-slate-400 mb-2 mt-4";

  if (isSoldSuccess) {
    return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in" dir="rtl">
            <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-bounce-slow">
                <CheckIcon />
            </div>
            <h1 className="text-4xl font-black text-white mb-4 font-sans tracking-tight">מזל טוב על המכירה! 🥂</h1>
            <p className="text-xl text-slate-400 mb-10 font-sans">הנכס בכתובת <span className="text-white font-bold">{data.address}</span> עודכן כנמכר בהצלחה.</p>
            
            <div className="bg-slate-800/50 p-8 rounded-[2rem] border border-slate-700 mb-8">
                <p className="text-sm font-bold text-brand-accent uppercase tracking-widest mb-6">פרסם את ההצלחה שלך</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => shareOnFacebook('feed')}
                        className="flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] text-white py-4 rounded-2xl font-bold transition-all shadow-lg font-sans"
                    >
                        <FacebookIcon />
                        פרופיל אישי
                    </button>
                    <button 
                        onClick={() => shareOnFacebook('page')}
                        className="flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold transition-all border border-white/10 font-sans"
                    >
                        📢 דף עסקי
                    </button>
                    <button 
                        onClick={shareOnWhatsApp}
                        className="md:col-span-2 flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebc57] text-white py-4 rounded-2xl font-bold transition-all shadow-lg font-sans"
                    >
                        <WhatsAppIcon />
                        שתף בוואטסאפ
                    </button>
                </div>
            </div>
            
            <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors font-bold font-sans underline underline-offset-8">חזרה ללוח הבקרה</button>
        </div>
    );
  }

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

            {/* Right Column: Media & Actions */}
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

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
                
                <div className="space-y-4">
                    <button 
                        onClick={() => onSave(data)} 
                        disabled={isSaving}
                        className="w-full bg-brand-accent hover:bg-brand-accentHover text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'שמור ופרסם שינויים'}
                    </button>

                    <button 
                        onClick={handleMarkAsSold} 
                        disabled={isSaving}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-green-900/20 transition-all flex items-center justify-center gap-2 border border-green-500/30"
                    >
                        <CheckIcon />
                        <span>הנכס נמכר</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
