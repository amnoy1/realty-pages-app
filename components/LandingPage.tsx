
'use client';

import React, { useRef } from 'react';
// import Image from 'next/image'; // Replaced with standard <img> for preview compatibility
import type { PropertyDetails, PropertyFeatures } from '../types';
import { ImageGallery } from './ImageGallery';
import { LeadForm } from './LeadForm';

interface LandingPageProps {
  details: PropertyDetails;
  isPreview?: boolean;
  onReset?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('972')) {
      const localNum = cleaned.substring(3);
      if (localNum.length === 9) {
          return `0${localNum.substring(0, 2)}-${localNum.substring(2, 9)}`;
      }
    }
    if (cleaned.length === 10 && cleaned.startsWith('05')) {
        return `${cleaned.substring(0,3)}-${cleaned.substring(3)}`;
    }
    return phone;
  };

// --- Feature Icons with Explicit Sizes & Fallbacks ---
// Added explicit width/height attributes to SVG to ensure they render even if CSS fails
const iconClasses = "w-6 h-6 text-brand-accent";
const AreaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/></svg>;
const BedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M2 4v16h20V4H2z"/><path d="M2 10h20"/><path d="M12 4v6"/></svg>;
const FloorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M12 3v18"/><path d="M16 17l-4-4-4 4"/><path d="M16 7l-4 4-4-4"/></svg>;
const ParkingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M14 16.94V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h1.3L8 5.86A2 2 0 0 1 9.62 5h4.76A2 2 0 0 1 16 6.86L18.7 12H20a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2.06Z"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>;
const BalconyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M2 12h20"/><path d="M4 12v8h16v-8"/><path d="M4 4h16v8H4z"/></svg>;
const SafeRoomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const StorageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const WindIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>;
const ElevatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4V3zm10 0h-4v18h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM15 9l-3-3-3 3M15 15l-3 3-3-3"/></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.536 1.907 6.344l-1.495 5.454 5.57-1.451zm.5-7.527c.08-.135.143-.225.246-.354.103-.13.21-.211.353-.267.143-.057.3-.086.48-.086.195 0 .358.03.49.09.13.06.23.145.302.26.07.115.105.245.105.39.0.15-.03.28-.09.4-.06.12-.135.225-.225.315-.09.09-.195.17-.315.235-.12.065-.255.115-.405.15-.15.035-.315.06-.495.06-.205 0-.39-.03-.56-.09-.17-.06-.315-.145-.445-.255-.13-.11-.235-.24-.315-.375s-.13-.285-.15-.45c-.02-.165-.03-.32-.03-.465.0-.15.015-.285.045-.405zm1.996 2.95c.12-.06.225-.135.315-.225.09-.09.165-.195.225-.315s.105-.255.135-.405.045-.315.045.495c0-.21-.03-.4-.09-.56-.06-.16-.14-.295-.24-.41-.1-.115-.21-.2-.33-.255s-.25-.085-.39-.085c-.15 0-.285.03-.405.085s-.225.13-.315.225c-.09.09-.165.195-.225.315s-.105.255-.135.405-.045.315-.045.495c0 .21.03.4.09.56s.14.295.24.41c.1.115.21.2.33.255s.25.085.39.085c.15 0 .285-.03.405-.085zm2.12-1.935c.15-.045.285-.105.405-.18s.225-.165.315-.27c.09-.105.165-.225.225-.36.06-.135.09-.285.09-.45 0-.18-.03-.345-.09-.5-.06-.155-.14-.29-.24-.405-.1-.115-.21-.2-.33-.255s-.25-.085-.39-.085c-.165 0-.315.03-.45.085s-.255.135-.36.255c-.105.12-.195.27-.27.45s-.12.375-.15.585c-.03.21-.045.42-.045.615.0.21.015.405.045.585s.075.345.135.495.135.285.225.405.195.225.315.315c.12.09.255.165.405.225.15.06.315.09.495.09.195 0 .375-.03.54-.09s.31-.14.435-.25c.125-.11.225-.24.3-.39s.125-.315.15-.495c.025-.18.038-.36.038-.525.0-.195-.03-.375-.09-.54s-.135-.315-.225-.45c-.09-.135-.195-.255-.315-.36-.12-.105-.255-.18-.405-.225s-.315-.06-.495-.06c-.195 0-.375.03-.54.09s-.31.14-.435.25c-.125.11-.225.24-.3.39s-.125.315-.15-.495c-.025-.18-.038-.36-.038-.525z"/></svg>;


const FeatureItem: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
      <div className="mb-4 p-3 bg-slate-50 rounded-full text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
        {icon}
      </div>
      <p className="font-bold text-xl text-slate-800">{value}</p>
      {label && <p className="text-sm text-slate-500 font-medium">{label}</p>}
    </div>
  );
};

// Features in the hero section - now without background box, using heavy text shadow
const KeyFeatureItem: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all">
            <div className="text-brand-accent">{icon}</div>
            <div>
                <p className="font-bold text-lg leading-none mb-1">{value}</p>
                <p className="text-xs text-slate-100 font-medium opacity-90">{label}</p>
            </div>
        </div>
    );
};

const FeaturesSection: React.FC<{ features: PropertyFeatures }> = ({ features }) => {
  const hasFeatures = Object.values(features).some(val => val);
  if (!hasFeatures) return null;

  return (
    <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent opacity-50"></div>
        <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center relative z-10">מאפייני הנכס</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
            <FeatureItem icon={<AreaIcon />} label={'מ"ר בנוי'} value={features.apartmentArea} />
            <FeatureItem icon={<BalconyIcon />} label={'מ"ר מרפסת'} value={features.balconyArea} />
            <FeatureItem icon={<BedIcon />} label="חדרים" value={features.rooms} />
            <FeatureItem icon={<FloorIcon />} label="קומה" value={features.floor} />
            <FeatureItem icon={<SafeRoomIcon />} label={'ממ"ד'} value={features.safeRoom} />
            <FeatureItem icon={<ParkingIcon />} label="חניות" value={features.parking} />
            <FeatureItem icon={<StorageIcon />} label="מחסן" value={features.storage} />
            <FeatureItem icon={<WindIcon />} label="כיווני אוויר" value={features.airDirections} />
            <FeatureItem icon={<ElevatorIcon />} label="מעלית" value={features.elevator} />
        </div>
    </div>
  );
};


export const LandingPage: React.FC<LandingPageProps> = ({ details, isPreview = false, onReset, onSave, isSaving }) => {
  const leadFormRef = useRef<HTMLDivElement>(null);

  const handleCtaClick = () => {
    leadFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('הקישור הועתק!'))
      .catch(err => console.error('Failed to copy: ', err));
  };

  const formattedPrice = details.price.replace(/₪/g, '').trim();
  const keyFeatures = [
      {icon: <BedIcon />, label: "חדרים", value: details.features.rooms },
      {icon: <AreaIcon />, label: 'מ"ר בנוי', value: details.features.apartmentArea },
      {icon: <BalconyIcon />, label: 'מ"ר מרפסת', value: details.features.balconyArea },
      {icon: <FloorIcon />, label: "קומה", value: details.features.floor },
  ].filter(f => f.value);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
        {!isPreview && (
            <a href={`https://wa.me/${details.agentWhatsApp}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl z-50 hover:scale-110 transition-transform duration-300 border-4 border-white" aria-label="צור קשר ב-WhatsApp">
                <WhatsAppIcon/>
            </a>
        )}
      <header className="relative h-[90vh] min-h-[650px] text-white overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <ImageGallery images={details.images} />
        </div>
        
        {/* Logo */}
        {details.logo && (
          <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg animate-fade-in z-30">
             {/* Replaced Next Image with standard img for Preview compatibility */}
             <img 
                src={details.logo} 
                alt="לוגו המשרד" 
                width={160}
                height={80}
                className="h-14 md:h-20 w-auto object-contain" 
             />
          </div>
        )}

        {/* Text Container - Minimal, No Background, Heavy Shadow */}
        <div className="absolute bottom-0 right-0 w-full p-6 md:p-16 pb-20 z-20 pointer-events-none">
            <div className="container mx-auto max-w-7xl">
                {/* 
                   Removed: bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl 
                   Added: heavy drop-shadows to individual elements
                */}
                <div className="max-w-5xl animate-slide-up pointer-events-auto">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1] mb-6 text-white tracking-tight drop-shadow-[0_5px_5px_rgba(0,0,0,0.9)]">
                        {details.generatedTitle}
                    </h1>
                    <p className="text-2xl md:text-3xl font-light text-slate-100 mb-10 flex items-center gap-3 w-fit drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)]">
                        <span className="inline-block w-1.5 h-8 bg-brand-accent rounded-full shadow-[0_0_15px_rgba(217,119,6,0.8)]"></span>
                        <span className="font-medium">{details.address}</span>
                    </p>

                    <div className="flex flex-wrap gap-6 mb-12">
                        {keyFeatures.slice(0, 4).map((feature, i) => (
                            <KeyFeatureItem key={i} {...feature} />
                        ))}
                    </div>

                    <button
                        onClick={handleCtaClick}
                        className="py-4 px-10 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.5)] text-xl font-bold text-white bg-gradient-to-r from-brand-accent to-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:-translate-y-1 border border-white/20 pointer-events-auto"
                    >
                        תיאום סיור בנכס
                    </button>
                </div>
            </div>
        </div>
        
        {/* Editor Controls */}
        <div className="absolute top-6 left-6 flex flex-col items-start gap-3 z-50">
           {isPreview && onReset && (
                <button 
                    onClick={onReset} 
                    className="bg-black/60 text-white py-2.5 px-6 rounded-full hover:bg-black/80 transition-all text-sm backdrop-blur-md border border-white/20 font-medium flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/></svg>
                    חזרה לעריכה
                </button>
            )}
             {isPreview && onSave && (
                <button 
                    onClick={onSave}
                    disabled={isSaving}
                    className="bg-brand-accent text-white py-2.5 px-8 rounded-full hover:bg-brand-accentHover transition-all disabled:opacity-70 shadow-lg font-bold border border-transparent flex items-center gap-2"
                >
                     {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>מפרסם...</span>
                        </>
                     ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                          <span>שמור ופרסם דף</span>
                        </>
                     )}
                </button>
            )}
             {!isPreview && (
                <button 
                  onClick={copyLink} 
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white py-2 px-6 rounded-full hover:bg-white/20 transition-colors text-sm font-medium"
                >
                  העתק קישור
                </button>
            )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24 max-w-7xl -mt-10 relative z-10">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-7 space-y-10">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-10 relative inline-block">
                        סיפור הנכס
                        <span className="absolute bottom-[-8px] right-0 w-1/2 h-1.5 bg-brand-accent rounded-full"></span>
                    </h2>
                    
                    <div className="space-y-8 text-lg md:text-xl text-slate-600 leading-loose">
                        <div className="p-6 bg-slate-50 rounded-2xl border-r-4 border-brand-accent/30">
                           <p>{details.enhancedDescription.area}</p>
                        </div>
                        <div>
                           <p>{details.enhancedDescription.property}</p>
                        </div>
                        <div className="bg-brand-accent/5 p-6 rounded-2xl border border-brand-accent/10">
                            <p className="font-bold text-slate-900 text-xl">{details.enhancedDescription.cta}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-5 space-y-8">
                {/* Price Card */}
                <div className="bg-slate-900 text-white p-10 rounded-3xl shadow-2xl text-center relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                     <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-accent via-orange-400 to-brand-accent"></div>
                     {/* Decorative circle */}
                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                     
                    <p className="text-slate-400 mb-3 text-sm uppercase tracking-widest font-bold">מחיר מבוקש</p>
                    <div className="flex items-start justify-center gap-1 text-white direction-ltr">
                        <span className="text-5xl md:text-6xl font-extrabold tracking-tight">{formattedPrice}</span>
                        {/* Always show the Shekel sign */}
                        <span className="text-3xl font-light mt-2 text-brand-accent">₪</span>
                    </div>
                </div>

                <FeaturesSection features={details.features} />
                
                {/* Agent Card */}
                <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-lg text-center relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-slate-100"></div>
                    <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center text-slate-300 border-4 border-white shadow-md">
                        <UserIcon />
                    </div>
                    <p className="text-slate-500 mb-2 font-medium">הנכס מיוצג ע"י</p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{details.agentName}</h3>
                    
                    <div className="flex justify-center gap-3">
                         <a 
                            href={`https://wa.me/${details.agentWhatsApp}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebc57] text-white py-3 px-6 rounded-xl transition-colors font-bold"
                        >
                            <WhatsAppIcon/>
                            <span>וואטסאפ</span>
                        </a>
                        <a 
                             href={`tel:${details.agentWhatsApp.replace(/\D/g, '')}`}
                             className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 px-6 rounded-xl transition-colors font-bold"
                        >
                             <span>חייג</span>
                        </a>
                    </div>
                </div>
            </aside>
        </section>

        <section ref={leadFormRef} className="mt-24 max-w-4xl mx-auto relative">
             <div className="absolute -inset-4 bg-gradient-to-r from-brand-accent to-orange-600 rounded-[2.5rem] opacity-20 blur-xl"></div>
             <div className="relative">
                <LeadForm agentWhatsApp={details.agentWhatsApp} agentEmail={details.agentEmail} propertyTitle={details.generatedTitle} agentName={details.agentName} />
             </div>
        </section>
      </main>
      
      <footer className="bg-slate-900 text-slate-400 text-center py-10 mt-20 border-t border-slate-800">
        <div className="container mx-auto">
            <p className="text-sm opacity-70">© כל הזכויות שמורות - נוצר באמצעות מחולל דפי נחיתה לנדל"ן</p>
        </div>
      </footer>
    </div>
  );
};

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
