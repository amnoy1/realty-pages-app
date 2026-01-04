import React, { useState } from 'react';
import type { PropertyFormData } from '../types';

export const CreationForm: React.FC<{ onSubmit: (details: PropertyFormData) => void; isLoading: boolean; defaultAgentName?: string; defaultAgentEmail?: string; }> = ({ onSubmit, isLoading, defaultAgentName = '', defaultAgentEmail = '' }) => {
  const [formData, setFormData] = useState<Omit<PropertyFormData, 'images' | 'logo'>>({
    address: '', 
    description: '', // Title
    rawNotes: '',    // Free text notes
    useAsIs: false,  // Default to AI upgrade
    price: '', 
    agentName: defaultAgentName, 
    agentEmail: defaultAgentEmail, 
    agentWhatsApp: '',
  });
  const [images, setImages] = useState<string[]>([]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
      Promise.all(filePromises).then(base64Images => setImages(prev => [...prev, ...base64Images].slice(0, 10)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address || !formData.description) {
      alert('נא להזין לפחות כותרת וכתובת נכס.');
      return;
    }
    onSubmit({ ...formData, images });
  };

  const inputClasses = "w-full px-5 py-4 bg-slate-800/60 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-accent outline-none transition-all text-right";
  const labelClasses = "block text-sm font-semibold text-slate-300 mb-2 mr-2 text-right";

  return (
    <div className="min-h-screen bg-slate-900 py-16 px-4 flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">מחולל דפי <span className="text-brand-accent">נחיתה</span></h1>
          <p className="text-slate-400 text-lg">בואו ניצור דף נחיתה מנצח לנכס שלכם</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="p-4 bg-brand-accent/10 rounded-2xl border border-brand-accent/20 mb-6 text-center">
             <p className="text-brand-accent font-bold">הזינו את פרטי הנכס - ה-AI יבנה לכם דף מקצועי</p>
          </div>

          <div>
            <label className={labelClasses}>כותרת הנכס (למשל: דופלקס מרהיב בשכונת רמז)</label>
            <input 
              name="description" 
              placeholder="כותרת קליטה שתופיע בראש הדף" 
              className={inputClasses} 
              onChange={handleChange} 
              value={formData.description} 
              required 
            />
          </div>

          <div>
            <label className={labelClasses}>כתובת הנכס</label>
            <input 
              name="address" 
              placeholder="רחוב, מספר, עיר" 
              className={inputClasses} 
              onChange={handleChange} 
              value={formData.address} 
              required 
            />
          </div>

          <div className="space-y-4">
            <label className={labelClasses}>פרטי הנכס וטקסט חופשי (הערות לסריקת AI)</label>
            <textarea 
              name="rawNotes" 
              rows={5}
              placeholder="כאן תוכלו להוסיף כל מה שחשוב: מספר חדרים, כיווני אוויר, נוף, מה שופץ, קרבה למוסדות חינוך וכו'..." 
              className={`${inputClasses} resize-none`} 
              onChange={handleChange} 
              value={formData.rawNotes} 
            />
            
            <div className="flex items-center gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                <input 
                  type="checkbox" 
                  id="useAsIs" 
                  name="useAsIs" 
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-brand-accent focus:ring-brand-accent cursor-pointer"
                  checked={formData.useAsIs}
                  onChange={handleChange}
                />
                <label htmlFor="useAsIs" className="text-slate-300 text-sm font-medium cursor-pointer select-none">
                   השתמש בטקסט שלי כפי שהוא (ללא שדרוג AI)
                </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className={labelClasses}>מחיר מבוקש (₪)</label>
                  <input name="price" placeholder="למשל: 3,500,000" className={inputClasses} onChange={handleChange} value={formData.price} />
               </div>
               <div>
                  <label className={labelClasses}>שם הסוכן</label>
                  <input name="agentName" className={inputClasses} onChange={handleChange} value={formData.agentName} required />
               </div>
          </div>

          <div>
            <label className={labelClasses}>אימייל למשלוח לידים</label>
            <input type="email" name="agentEmail" placeholder="your@email.com" className={inputClasses} onChange={handleChange} value={formData.agentEmail} required />
          </div>

          <div>
            <label className={labelClasses}>תמונות הנכס (עד 10)</label>
            <div className="relative border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-brand-accent transition-colors cursor-pointer">
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <p className="text-slate-400 text-sm">{images.length > 0 ? `${images.length} תמונות נבחרו` : 'לחצו לבחירת תמונות או גררו לכאן'}</p>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-brand-accent hover:bg-brand-accentHover text-white font-black text-xl py-5 rounded-2xl shadow-xl transition-all disabled:opacity-50">
            {isLoading ? 'ה-AI מעבד את הנתונים...' : 'צור דף נחיתה מנצח'}
          </button>
        </form>
      </div>
    </div>
  );
};