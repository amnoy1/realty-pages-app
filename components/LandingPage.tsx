'use client';

import React, { useRef, useState } from 'react';
import type { PropertyDetails } from '../types';
import { ImageGallery } from './ImageGallery';
import { LeadForm } from './LeadForm';

interface LandingPageProps {
  details: PropertyDetails;
  isPreview?: boolean;
  onReset?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const iconClasses = "w-6 h-6 text-brand-accent";
const AreaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}>
    <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
  </svg>
);
const BedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}>
    <path d="M2 4v16h20V4H2z" />
    <path d="M2 10h20" />
    <path d="M12 4v6" />
  </svg>
);
const FloorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}>
    <path d="M12 3v18" />
    <path d="M16 17l-4-4-4 4" />
    <path d="M16 7l-4 4-4-4" />
  </svg>
);
const BalconyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}>
    <path d="M2 12h20" />
    <path d="M4 12v8h16v-8" />
    <path d="M4 4h16v8H4z" />
  </svg>
);
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const FeatureItem: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="mb-2 text-brand-accent">{icon}</div>
      <p className="font-bold text-lg text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ details, isPreview = false, onReset, onSave, isSaving }) => {
  const leadFormRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleCtaClick = () => {
    leadFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const copyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href).then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  // Safely handle price formatting
  const formattedPrice = details.price ? details.price.replace(/[^\d,]/g, '') : '';

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans" dir="rtl">
      <header className="relative h-[80vh] min-h-[500px] text-white overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <ImageGallery images={details.images} />
        </div>
        
        {details.logo && (
          <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg z-30">
             <img src={details.logo} alt="לוגו" className="h-12 md:h-16 w-auto object-contain" />
          </div>
        )}

        <div className="absolute bottom-0 right-0 w-full p-6 md:p-12 z-20">
            <div className="container mx-auto">
                <h1 className="text-4xl md:text-6xl font-black mb-4 text-white drop-shadow-2xl">{details.generatedTitle}</h1>
                <p className="text-xl md:text-2xl font-bold text-white mb-8 drop-shadow-lg">{details.address}</p>
                <button onClick={handleCtaClick} className="py-4 px-10 rounded-full bg-brand-accent text-white font-bold text-xl shadow-2xl hover:bg-brand-accentHover transition-all">תיאום סיור</button>
            </div>
        </div>
        
        <div className="absolute top-6 left-6 flex flex-col gap-3 z-50">
           {isPreview && onReset && (
                <button onClick={onReset} className="bg-black/60 text-white py-2 px-6 rounded-full backdrop-blur-md border border-white/20 text-sm">חזרה לעריכה</button>
            )}
             {isPreview && onSave && (
                <button onClick={onSave} disabled={isSaving} className="bg-brand-accent text-white py-2 px-8 rounded-full font-bold shadow-lg disabled:opacity-50">
                    {isSaving ? 'מפרסם...' : 'שמור ופרסם'}
                </button>
            )}
             {!isPreview && (
                <button onClick={copyLink} className="bg-slate-900/80 text-white p-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                    {copyStatus === 'copied' ? 'הועתק!' : <CopyIcon />}
                </button>
            )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">על הנכס והאזור</h2>
                    <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                        <p className="p-4 bg-slate-50 rounded-xl border-r-4 border-brand-accent">{details.enhancedDescription.area}</p>
                        <p>{details.enhancedDescription.property}</p>
                    </div>
                </div>
            </div>

            <aside className="space-y-6">
                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl text-center">
                    <p className="text-slate-400 text-sm mb-1">מחיר מבוקש</p>
                    <p className="text-4xl font-black text-brand-accent">{formattedPrice} ₪</p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-lg">
                    <h3 className="text-lg font-bold mb-4 text-center">מאפיינים</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <FeatureItem icon={<BedIcon />} label="חדרים" value={details.features.rooms} />
                        <FeatureItem icon={<AreaIcon />} label="מ&quot;ר" value={details.features.apartmentArea} />
                        <FeatureItem icon={<FloorIcon />} label="קומה" value={details.features.floor} />
                        <FeatureItem icon={<BalconyIcon />} label="מרפסת" value={details.features.balconyArea} />
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-lg text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <p className="text-slate-500 text-sm">הסוכן המטפל</p>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{details.agentName}</h3>
                    <a href={`mailto:${details.agentEmail}`} className="block w-full bg-slate-800 text-white py-3 rounded-xl font-bold">שלח מייל לסוכן</a>
                </div>
            </aside>
        </div>

        <section ref={leadFormRef} className="mt-16">
            <LeadForm 
                agentWhatsApp={details.agentWhatsApp}
                agentEmail={details.agentEmail} 
                propertyTitle={details.generatedTitle} 
                agentName={details.agentName} 
                propertyId={details.id}
                ownerId={details.userId}
            />
        </section>
      </main>
    </div>
  );
};