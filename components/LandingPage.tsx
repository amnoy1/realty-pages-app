'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
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

// --- Feature Icons (Robust definitions with explicit size attributes) ---
const iconClasses = "text-brand-accent"; 
const AreaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/></svg>;
const BedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M2 4v16h20V4H2z"/><path d="M2 10h20"/><path d="M12 4v6"/></svg>;
const FloorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M12 3v18"/><path d="M16 17l-4-4-4 4"/><path d="M16 7l-4 4-4-4"/></svg>;
const ParkingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M14 16.94V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h1.3L8 5.86A2 2 0 0 1 9.62 5h4.76A2 2 0 0 1 16 6.86L18.7 12H20a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2.06Z"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>;
const BalconyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M2 12h20"/><path d="M4 12v8h16v-8"/><path d="M4 4h16v8H4z"/></svg>;
const SafeRoomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const StorageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const WindIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>;
const ElevatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4V3zm10 0h-4v18h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM15 9l-3-3-3 3M15 15l-3 3-3-3"/></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.536 1.907 6.344l-1.495 5.454 5.57-1.451zm.5-7.527c.08-.135.143-.225.246-.354.103-.13.21-.211.353-.267.143-.057.3-.086.48-.086.195 0 .358.03.49.09.13.06.23.145.302.26.07.115.105.245.105.39.0.15-.03.28-.09.4-.06.12-.135.225-.225.315-.09.09-.195.17-.315.235-.12.065-.255.115-.405.15-.15.035-.315.06-.495.06-.205 0-.39-.03-.56-.09-.17-.06-.315-.145-.445-.255-.13-.11-.235-.24-.315-.375s-.13-.285-.15-.45c-.02-.165-.03-.32-.03-.465.0-.15.015-.285.045-.405zm1.996 2.95c.12-.06.225-.135.315-.225.09-.09.165-.195.225-.315s.105-.255.135-.405.045-.315.045-.495c0-.21-.03-.4-.09-.56-.06-.16-.14-.295-.24-.41-.1-.115-.21-.2-.33-.255s-.25-.085-.39-.085c-.15 0-.285.03-.405.085s-.225.13-.315.225c-.09.09-.165.195-.225.315s-.105.255-.135.405-.045.315-.045.495c0 .21.03.4.09.56s.14.295.24.41c.1.115.21.2.33.255s.25.085.39.085c.15 0 .285-.03.405-.085zm2.12-1.935c.15-.045.285-.105.405-.18s.225-.165.315-.27c.09-.105.165-.225.225-.36.06-.135.09-.285.09-.45 0-.18-.03-.345-.09-.5-.06-.155-.14-.29-.24-.405-.1-.115-.21-.2-.33-.255s-.25-.085-.39-.085c-.165 0-.315.03-.45.085s-.255.135-.36.255c-.105.12-.195.27-.27.45s-.12.375-.15.585c-.03.21-.045.42-.045.615.0.21.015.405.045.585s.075.345.135.495.135.285.225.405.195.225.315.315c.12.09.255.165.405.225.15.06.315.09.495.09.195 0 .375-.03.54-.09s.31-.14.435-.25c.125-.11.225-.24.3-.39s.125-.315.15-.495c.025-.18.038-.36.038-.525.0-.195-.03-.375-.09-.54s-.135-.315-.225-.45c-.09-.135-.195-.255-.315-.36-.12-.105-.255-.18-.405-.225s-.315-.06-.495-.06c-.195 0-.375.03-.54.09s-.31.14-.435.25c-.125.11-.225.24-.3.39s-.125.315-.15-.495c-.025-.18-.038-.36-.038-.525z"/></svg>;

const FeatureItem: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-800/60 backdrop-blur-sm hover:bg-slate-800 border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group h-full text-white">
      <div className="mb-4 p-4 bg-slate-900 rounded-full text-brand-accent shadow-md group-hover:scale-110 transition-transform border border-slate-700 ring-1 ring-brand-accent/10">
        {icon}
      </div>
      <p className="font-extrabold text-xl text-slate-100 mb-1">{value}</p>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
    </div>
  );
};

const KeyFeatureItem: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-4 text-white bg-slate-900/60 backdrop-blur-md p-4 px-6 rounded-2xl border border-white/10 shadow-lg hover:bg-slate-900/80 transition-colors">
            <div className="text-brand-accent p-2 bg-white/5 rounded-full border border-white/5">{icon}</div>
            <div>
                <p className="font-bold text-2xl leading-none mb-1 text-white">{value}</p>
                <p className="text-xs text-slate-300 font-medium opacity-90">{label}</p>
            </div>
        </div>
    );
};

const FeaturesSection: React.FC<{ features: PropertyFeatures }> = ({ features }) => {
  const hasFeatures = Object.values(features).some(val => val);
  if (!hasFeatures) return null;

  return (
    <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-800 p-8 rounded-[2rem] shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-accent/0 via-brand-accent to-brand-accent/0 opacity-50"></div>
        <div className="flex items-center justify-between mb-8">
             <h3 className="text-2xl font-bold text-slate-100">מאפייני הנכס</h3>
             <div className="h-1 w-16 bg-brand-accent rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
  const shekelSign = details.price.includes('₪') ? '₪' : '';
  const keyFeatures = [
      {icon: <BedIcon />, label: "חדרים", value: details.features.rooms },
      {icon: <AreaIcon />, label: 'מ"ר בנוי', value: details.features.apartmentArea },
      {icon: <BalconyIcon />, label: 'מ"ר מרפסת', value: details.features.balconyArea },
      {icon: <FloorIcon />, label: "קומה", value: details.features.floor },
  ].filter(f => f.value);

  return (
    <div className="bg-slate-950 min-h-screen text-white font-sans selection:bg-brand-accent selection:text-white">
        {!isPreview && (
            <a href={`https://wa.me/${details.agentWhatsApp}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl z-50 hover:scale-110 transition-transform border-4 border-slate-900" aria-label="צור קשר ב-WhatsApp">
                <WhatsAppIcon/>
            </a>
        )}
      <header className="relative h-[90vh] min-h-[600px] text-white overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <ImageGallery images={details.images} />
        </div>
        {/* Gradient Overlay - Enhanced for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30 opacity-100"></div>
        
        {details.logo && (
          <div className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur p-4 rounded-2xl shadow-xl animate-fade-in border border-white/10">
             <Image 
                src={details.logo} 
                alt="לוגו המשרד" 
                width={140}
                height={60}
                className="h-12 md:h-16 w-auto object-contain invert brightness-0 filter" 
             />
          </div>
        )}

        <div className="absolute bottom-0 right-0 w-full p-6 md:p-16 pb-16 md:pb-24">
            <div className="container mx-auto max-w-7xl">
                <div className="max-w-5xl animate-slide-up">
                    <div className="inline-block bg-brand-accent text-white px-4 py-1 rounded-full text-sm font-bold mb-6 tracking-wide shadow-lg border border-white/10">
                        הזדמנות חדשה
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6 drop-shadow-2xl text-white tracking-tight">
                        {details.generatedTitle}
                    </h1>
                    <p className="text-2xl md:text-3xl font-light text-slate-200 mb-10 flex items-center gap-2 opacity-90">
                         <svg className="w-6 h-6 text-brand-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                        {details.address}
                    </p>

                    <div className="flex flex-wrap gap-4 mb-12">
                        {keyFeatures.slice(0, 4).map((feature, i) => (
                            <KeyFeatureItem key={i} {...feature} />
                        ))}
                    </div>

                    <button
                        onClick={handleCtaClick}
                        className="py-5 px-10 rounded-full shadow-xl shadow-brand-accent/20 text-xl font-bold text-white bg-gradient-to-r from-brand-accent to-brand-accentHover hover:shadow-brand-accent/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 border border-white/10"
                    >
                        <span>לתיאום סיור בנכס</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </button>
                </div>
            </div>
        </div>
        
        {/* Editor Controls */}
        <div className="absolute top-6 left-6 flex flex-col items-start gap-3 z-50">
           {isPreview && onReset && (
                <button 
                    onClick={onReset} 
                    className="bg-black/60 text-white py-3 px-6 rounded-full hover:bg-black/80 transition-colors text-sm backdrop-blur-md border border-white/10 font-medium flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path></svg>
                    חזרה לעריכה
                </button>
            )}
             {isPreview && onSave && (
                <button 
                    onClick={onSave}
                    disabled={isSaving}
                    className="bg-brand-accent text-white py-3 px-8 rounded-full hover:bg-brand-accentHover transition-colors disabled:opacity-70 shadow-xl font-bold border border-transparent flex items-center gap-2"
                >
                    {isSaving ? 'מפרסם...' : 'שמור ופרסם דף'}
                    {!isSaving && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                </button>
            )}
             {!isPreview && (
                <button 
                  onClick={copyLink} 
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white py-2 px-5 rounded-full hover:bg-white/20 transition-colors text-sm"
                >
                  העתק קישור
                </button>
            )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24 max-w-7xl -mt-10 relative z-10">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-7 space-y-12">
                <div className="bg-slate-900/80 backdrop-blur-sm p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-accent via-brand-gold to-brand-accent"></div>
                    <h2 className="text-4xl font-extrabold text-white mb-10">
                        אודות הנכס
                    </h2>
                    
                    <div className="space-y-8 text-lg text-slate-300 leading-loose font-light">
                        <p className="first-letter:text-6xl first-letter:font-black first-letter:text-brand-accent first-letter:float-right first-letter:ml-4 first-letter:mt-[-10px]">
                            {details.enhancedDescription.area}
                        </p>
                        <p>{details.enhancedDescription.property}</p>
                        <div className="bg-slate-800 p-8 rounded-3xl border border-brand-accent/20 relative">
                             <div className="absolute -top-3 -right-3 bg-slate-700 p-2 rounded-full shadow-md text-brand-accent border border-slate-600">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                             </div>
                            <p className="font-bold text-white text-xl italic">"{details.enhancedDescription.cta}"</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-5 space-y-8">
                {/* Price Card */}
                <div className="bg-slate-900 text-white p-10 rounded-[2rem] shadow-2xl text-center relative overflow-hidden group border border-slate-800">
                     <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
                     <div className="absolute -top-20 -right-20 w-56 h-56 bg-brand-accent/10 rounded-full blur-[80px] group-hover:bg-brand-accent/20 transition-colors duration-700"></div>
                    
                    <div className="relative z-10">
                        <p className="text-brand-accent font-bold mb-4 text-sm uppercase tracking-[0.2em]">מחיר מבוקש</p>
                        <div className="flex items-start justify-center gap-2 text-white">
                            <span className="text-7xl font-black tracking-tighter">{formattedPrice}</span>
                            <span className="text-3xl font-light mt-2 text-slate-400">{shekelSign}</span>
                        </div>
                    </div>
                </div>

                <FeaturesSection features={details.features} />
                
                {/* Agent Card */}
                <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-10 rounded-[2rem] shadow-xl text-center relative overflow-hidden">
                    <div className="w-28 h-28 bg-slate-800 rounded-full mx-auto mb-6 flex items-center justify-center text-slate-500 shadow-inner border-[6px] border-slate-700 ring-1 ring-slate-800">
                        <UserIcon />
                    </div>
                    <p className="text-slate-400 mb-1 font-medium">לפרטים נוספים ותיאום</p>
                    <h3 className="text-3xl font-black text-white mb-6">{details.agentName}</h3>
                    <a 
                        href={`https://wa.me/${details.agentWhatsApp}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center gap-3 text-white bg-[#25D366] hover:bg-[#1ebc57] py-4 px-8 rounded-2xl font-bold shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-1 w-full group"
                    >
                         <WhatsAppIcon />
                        <span>שלח הודעה ב-WhatsApp</span>
                    </a>
                </div>
            </aside>
        </section>

        <section ref={leadFormRef} className="mt-32 max-w-4xl mx-auto relative z-20">
             <LeadForm agentWhatsApp={details.agentWhatsApp} agentEmail={details.agentEmail} propertyTitle={details.generatedTitle} agentName={details.agentName} />
        </section>
      </main>
      
      <footer className="bg-slate-950 text-slate-400 text-center py-12 mt-20 border-t border-slate-900">
        <div className="container mx-auto px-4">
            <p className="text-sm opacity-60">© כל הזכויות שמורות - נוצר באמצעות מחולל דפי נחיתה לנדל"ן AI (Gemini 3 Pro)</p>
        </div>
      </footer>
    </div>
  );
};

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;