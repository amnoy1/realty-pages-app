import React, { useState, useRef } from 'react';
import type { PropertyFormData } from '../types';

interface PropertyFormProps {
  onSubmit: (details: PropertyFormData) => void;
  isLoading: boolean;
}

const FileUploadIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 mb-4 text-slate-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
);

const LogoIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);


export const PropertyForm: React.FC<PropertyFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Omit<PropertyFormData, 'images' | 'logo'>>({
    address: '',
    description: '',
    price: '',
    agentName: '',
    agentEmail: '',
    agentWhatsApp: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [logo, setLogo] = useState<string | undefined>();
  
  // Refs for drag and drop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const filePromises = files.map((file: File) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises)
        .then(base64Images => {
          setImages(prev => [...prev, ...base64Images].slice(0, 10)); // Limit to 10 images
        })
        .catch(error => console.error("Error converting files to base64", error));
    }
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, images, logo });
  };
  
  const handleDeleteImage = (indexToDelete: number) => {
    setImages(currentImages => currentImages.filter((_, index) => index !== indexToDelete));
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const newImages = [...images];
    const dragItemContent = newImages.splice(dragItem.current, 1)[0];
    newImages.splice(dragOverItem.current, 0, dragItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    
    setImages(newImages);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
        <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">מחולל דפי נחיתה לנדל"ן</h1>
            <p className="text-slate-500">הזן את פרטי הנכס וצור דף נחיתה ממיר ברגע</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-6">
            <InputField name="address" label="כתובת הנכס" placeholder="לדוגמה: רוטשילד 16, תל אביב" value={formData.address} onChange={handleChange} required />
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">תיאור הנכס (ישמש ליצירת כותרת ותיאור ע"י AI)</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 placeholder-slate-400"
                placeholder="ספר על הנכס, היתרונות שלו, והסביבה. תיאור זה ישודרג על ידי AI."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField name="price" label="מחיר שיווק" placeholder="לדוגמה: 5,400,000 ₪" value={formData.price} onChange={handleChange} required />
              <InputField name="agentName" label="סוכן מטפל" placeholder="שם מלא" value={formData.agentName} onChange={handleChange} required />
            </div>
            <InputField name="agentEmail" label="דוא'ל לקבלת פניות" placeholder="your-email@example.com" value={formData.agentEmail} onChange={handleChange} required type="email" />
            <InputField name="agentWhatsApp" label="מספר ווצאפ של הסוכן" placeholder="בפורמט בינלאומי, לדוגמה: 972501234567" value={formData.agentWhatsApp} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
                      <p className="text-xs text-slate-500">PNG, JPG, GIF עד 10MB</p>
                  </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">לוגו המשרד (אופציונלי)</label>
              <div className="mt-1 flex items-center">
                  {logo ? (
                      <img src={logo} alt="logo preview" className="h-20 w-20 object-contain rounded-md bg-slate-100 p-1 mr-4" />
                  ) : (
                      <div className="h-20 w-20 bg-slate-100 rounded-md flex items-center justify-center mr-4">
                          <LogoIcon />
                      </div>
                  )}
                  <label htmlFor="logo-upload" className="relative cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <span>החלף לוגו</span>
                      <input id="logo-upload" name="logo-upload" type="file" className="sr-only" accept="image/*" onChange={handleLogoChange} />
                  </label>
              </div>
            </div>
          </div>
          
            {images.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2">גרור כדי לסדר מחדש:</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className="relative group cursor-grab active:cursor-grabbing aspect-w-1 aspect-h-1"
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <img src={img} alt={`preview ${index}`} className="w-full h-full object-cover rounded-lg shadow-md pointer-events-none" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all"></div>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteImage(index)}
                                    className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 leading-none opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                    aria-label={`מחק תמונה ${index + 1}`}
                                >
                                <DeleteIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <Spinner />
                יוצר קסם...
              </>
            ) : 'צור דף נחיתה'}
          </button>
        </form>
      </div>
    </div>
  );
};

interface InputFieldProps {
    name: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ name, label, placeholder, value, onChange, required = false, type = 'text' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 placeholder-slate-400"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
        />
    </div>
);

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
