'use client';

import React, { useRef, useState, useEffect } from 'react';
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

const AreaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const BedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10" rx="2"></rect></svg>
);
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);

const FeatureItem: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-2 text-brand-accent">{icon}</div>
      <p className="font-bold text-lg text-slate-900 leading-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">{label}</p>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ details, isPreview = false, onReset, onSave, isSaving }) => {
  const leadFormRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const formattedPrice = details.price ? details.price.replace(/[^\d,]/g, '') : '';

  return (
    <div className="bg-[#fcfcfd] min-h-screen text-slate-900 font-sans selection:bg-brand-accent/30" dir="rtl">
      {/* Sticky Header for Actions */}
      <div className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'py-6'}`}>
          <div className="container mx-auto px-6 flex justify-between items-center">
              <div className="flex gap-3">
                  {isPreview ? (
                      <>
                        <button onClick={onReset} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">חזרה לעריכה</button>
                        <button onClick={onSave} disabled={isSaving} className="bg-brand-accent text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-brand-accent/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                            {isSaving ? 'מפרסם...' : 'פרסם נכס'}
                        </button>
                      </>
                  ) : (
                      <button onClick={copyLink} className="bg-white border border-slate-200 p-2.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors text-slate-600">
                          {copyStatus === 'copied' ? <span className="text-xs font-bold px-2">הועתק!</span> : <CopyIcon />}
                      </button>
                  )}
              </div>
              {details.logo && <img src={details.logo} alt="Logo" className={`${scrolled ? 'h-8' : 'h-12'} w-auto object-contain transition-all`} />}
          </div>
      </div>

      <header className="relative h-[90vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <ImageGallery images={details.images} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-end pb-20 px-6 z-20">
            <div className="container mx-auto max-w-6xl">
                <div className="inline-block bg-brand-accent text-white text-[10px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest animate-fade-in">נכס בבלעדיות</div>
                <h1 className="text-5xl md:text-8xl font-black text-white mb-6 leading-[1.1] drop-shadow-xl max-w-4xl animate-slide-up">
                    {details.generatedTitle}
                </h1>
                <div className="flex flex-col md:flex-row md:items-center gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <p className="text-xl md:text-2xl font-medium text-white/90 flex items-center gap-2 drop-shadow-lg">
                        <AreaIcon /> {details.address}
                    </p>
                    <div className="h-px md:h-8 w-12 md:w-px bg-white/30"></div>
                    <button onClick={handleCtaClick} className="group relative py-4 px-12 rounded-full bg-white text-slate-900 font-black text-xl shadow-2xl overflow-hidden transition-all hover:pr-16">
                        <span className="relative z-10">תיאום סיור בנכס</span>
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">←</span>
                    </button>
                </div>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-6 -mt-10 relative z-30 pb-24 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-8 space-y-8">
                <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-1 bg-brand-accent rounded-full"></div>
                        <h2 className="text-3xl font-black text-slate-900">הסיפור של הנכס</h2>
                    </div>
                    <div className="prose prose-slate prose-xl max-w-none text-slate-600 leading-[1.8]">
                        <p className="bg-slate-50 p-8 rounded-3xl border-r-8 border-brand-accent text-slate-900 font-medium italic mb-10">
                            {details.enhancedDescription.area}
                        </p>
                        <div className="whitespace-pre-line">
                            {details.enhancedDescription.property}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Cards */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl sticky top-28">
                    <div className="text-center mb-8">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">מחיר מבוקש</span>
                        <div className="text-5xl font-black text-brand-accent mt-2">{formattedPrice} ₪</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <FeatureItem icon={<BedIcon />} label="חדרים" value={details.features.rooms} />
                        <FeatureItem icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z"></path><path d="M3 9h18"></path><path d="M9 3v18"></path></svg>} label="מ\"ר" value={details.features.apartmentArea} />
                        <FeatureItem icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H7M17 19H7"></path></svg>} label="קומה" value={details.features.floor} />
                        <FeatureItem icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M4 12v8h16v-8M4 4h16v8H4z"></path></svg>} label="מרפסת" value={details.features.balconyArea} />
                    </div>

                    <div className="border-t border-white/10 pt-8 text-center">
                        <div className="flex items-center justify-center gap-4 mb-6">
                             {details.agentName && (
                                 <div className="text-right">
                                     <p className="text-[10px] text-slate-500 font-bold uppercase">סוכן נדל"ן מורשה</p>
                                     <p className="text-lg font-bold text-white">{details.agentName}</p>
                                 </div>
                             )}
                        </div>
                        <a href={`mailto:${details.agentEmail}`} className="block w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold transition-all border border-white/10">צרו קשר במייל</a>
                    </div>
                </div>
            </div>
        </div>

        <section ref={leadFormRef} className="mt-20">
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

      <footer className="bg-white border-t border-slate-100 py-12 text-center">
          <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} מחולל דפי נחיתה לנדל"ן | כל הזכויות שמורות</p>
      </footer>
    </div>
  );
};