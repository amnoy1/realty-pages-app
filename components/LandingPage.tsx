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

// --- Feature Icons ---
const iconClasses = "w-7 h-7 text-blue-600";
const AreaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/></svg>;
const BedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M2 4v16h20V4H2z"/><path d="M2 10h20"/><path d="M12 4v6"/></svg>;
const FloorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M12 3v18"/><path d="M16 17l-4-4-4 4"/><path d="M16 7l-4 4-4-4"/></svg>;
const ParkingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M14 16.94V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h1.3L8 5.86A2 2 0 0 1 9.62 5h4.76A2 2 0 0 1 16 6.86L18.7 12H20a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2.06Z"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>;
const BalconyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M2 12h20"/><path d="M4 12v8h16v-8"/><path d="M4 4h16v8H4z"/></svg>;
const SafeRoomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const StorageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const WindIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>;
const ElevatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4V3zm10 0h-4v18h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM15 9l-3-3-3 3M15 15l-3 3-3-3"/></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.536 1.907 6.344l-1.495 5.454 5.57-1.451zm.5-7.527c.08-.135.143-.225.246-.354.103-.13.21-.211.353-.267.143-.057.3-.086.48-.086.195 0 .358.03.49.09.13.06.23.145.302.26.07.115.105.245.105.39.0.15-.03.28-.09.4-.06.12-.135.225-.225.315-.09.09-.195.17-.315.235-.12.065-.255.115-.405.15-.15.035-.315.06-.495.06-.205 0-.39-.03-.56-.09-.17-.06-.315-.145-.445-.255-.13-.11-.235-.24-.315-.375s-.13-.285-.15-.45c-.02-.165-.03-.32-.03-.465.0-.15.015-.285.045-.405zm1.996 2.95c.12-.06.225-.135.315-.225.09-.09.165-.195.225-.315s.105-.255.135-.405.045-.315.045-.495c0-.21-.03-.4-.09-.56-.06-.16-.14-.295-.24-.41-.1-.115-.21-.2-.33-.255s-.25-.085-.39-.085c-.15 0-.285.03-.405.085s-.225.13-.315.225c-.09.09-.165.195-.225.315s-.105.255-.135.405-.045.315-.045.495c0 .21.03.4.09.56s.14.295.24.41c.1.115.21.2.33.255s.25.085.39.085c.15 0 .285-.03.405-.085zm2.12-1.935c.15-.045.285-.105.405-.18s.225-.165.315-.27c.09-.105.165-.225.225-.36.06-.135.09-.285.09-.45 0-.18-.03-.345-.09-.5-.06-.155-.14-.29-.24-.405-.1-.115-.21-.2-.33-.255s-.25-.085-.39-.085c-.165 0-.315.03-.45.085s-.255.135-.36.255c-.105.12-.195.27-.27.45s-.12.375-.15.585c-.03.21-.045.42-.045.615.0.21.015.405.045.585s.075.345.135.495.135.285.225.405.195.225.315.315c.12.09.255.165.405.225.15.06.315.09.495.09.195 0 .375-.03.54-.09s.31-.14.435-.25c.125-.11.225-.24.3-.39s.125-.315.15-.495c.025-.18.038-.36.038-.525.0-.195-.03-.375-.09-.54s-.135-.315-.225-.45c-.09-.135-.195-.255-.315-.36-.12-.105-.255-.18-.405-.225s-.315-.06-.495-.06c-.195 0-.375.03-.54.09s-.31.14-.435.25c-.125.11-.225.24-.3.39s-.125.315-.15-.495c-.025-.18-.038-.36-.038-.525z"/></svg>;


const FeatureItem: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center justify-center text-center p-2 bg-slate-50 rounded-xl">
      <div className="mb-2">{icon}</div>
      <p className="font-bold text-lg text-slate-800">{value}</p>
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
};

const KeyFeatureItem: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2 text-white">
            <div className="bg-white/10 p-2 rounded-full">{icon}</div>
            <div>
                <p className="font-bold">{value}</p>
                <p className="text-sm opacity-80">{label}</p>
            </div>
        </div>
    );
};

const FeaturesSection: React.FC<{ features: PropertyFeatures }> = ({ features }) => {
  const hasFeatures = Object.values(features).some(val => val);
  if (!hasFeatures) return null;

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">מאפייני הנכס</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 justify-items-stretch">
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
    <div className="bg-slate-50">
        {!isPreview && (
            <a href={`https://wa.me/${details.agentWhatsApp}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg z-50 hover:bg-green-600 transition-colors" aria-label="צור קשר ב-WhatsApp">
                <WhatsAppIcon/>
            </a>
        )}
      <header className="relative h-screen min-h-[600px] text-white">
        <div className="absolute inset-0">
          <ImageGallery images={details.images} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
        
        {details.logo && (
          <Image 
            src={details.logo} 
            alt="לוגו המשרד" 
            width={200}
            height={96}
            className="absolute top-6 right-6 h-20 md:h-24 w-auto max-w-[200px] object-contain bg-white/20 backdrop-blur-sm p-2 rounded-lg" />
        )}

        <div className="absolute bottom-0 right-0 p-6 md:p-12 w-full">
            <div className="container mx-auto">
                <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg leading-tight">{details.generatedTitle}</h1>
                <p className="mt-2 text-xl md:text-2xl drop-shadow-md">{details.address}</p>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-4">
                    {keyFeatures.slice(0, 4).map((feature, i) => (
                        <KeyFeatureItem key={i} {...feature} />
                    ))}
                </div>

                <button
                    onClick={handleCtaClick}
                    className="mt-8 py-3 px-8 border border-transparent rounded-full shadow-lg text-lg font-bold text-slate-900 bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white transition-all duration-300 transform hover:scale-105"
                >
                    אני רוצה לקבוע סיור בנכס
                </button>
            </div>
        </div>
        
        <div className="absolute top-6 left-6 flex flex-col items-start gap-2">
           {isPreview && onReset && (
                <button 
                    onClick={onReset} 
                    className="bg-black/50 text-white py-2 px-4 rounded-full hover:bg-black/75 transition-colors text-sm backdrop-blur-sm"
                >
                    צור דף חדש
                </button>
            )}
             {isPreview && onSave && (
                <button 
                    onClick={onSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white py-2 px-5 rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-300 font-bold"
                >
                    {isSaving ? 'שומר...' : 'שמור ופרסם'}
                </button>
            )}
             {!isPreview && (
                <button 
                  onClick={copyLink} 
                  className="bg-green-600 text-white py-2 px-4 rounded-full hover:bg-green-700 transition-colors text-sm"
                >
                  העתק קישור לשיתוף
                </button>
            )}
        </div>
      </header>

      <main className="container mx-auto p-6 md:p-12 max-w-7xl">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-slate-800 mb-6 border-r-4 border-blue-600 pr-4">כל מה שצריך לדעת על הנכס</h2>
                
                <div className="space-y-6 text-lg text-slate-700 leading-relaxed prose prose-lg max-w-none">
                    <p className="whitespace-pre-wrap">{details.enhancedDescription.area}</p>
                    <p className="whitespace-pre-wrap">{details.enhancedDescription.property}</p>
                    <p className="font-semibold whitespace-pre-wrap">{details.enhancedDescription.cta}</p>
                </div>
            </div>
            <aside className="space-y-8">
               <div className="lg:sticky lg:top-10 space-y-8">
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
                        <p className="text-xl text-slate-500 mb-2">מחיר שיווק</p>
                        <div className="flex items-baseline justify-center gap-x-1 text-slate-800">
                            <span className="text-4xl font-extrabold">{formattedPrice}</span>
                            <span className="text-3xl font-bold">{shekelSign}</span>
                        </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center">
                        <p className="text-lg text-slate-600">לפרטים נוספים ותיאום סיור:</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{details.agentName}</p>
                        <a href={`https://wa.me/${details.agentWhatsApp}`} target="_blank" rel="noopener noreferrer" className="inline-block text-2xl text-blue-600 mt-2 font-semibold hover:underline">
                            {formatPhoneNumber(details.agentWhatsApp)}
                        </a>
                    </div>
                    
                    <FeaturesSection features={details.features} />
               </div>
            </aside>
        </section>

        <section ref={leadFormRef} id="lead-form" className="mt-20 py-20 bg-slate-100 rounded-3xl">
             <LeadForm agentWhatsApp={details.agentWhatsApp} agentEmail={details.agentEmail} propertyTitle={details.generatedTitle} agentName={details.agentName} />
        </section>
      </main>
      
      <footer className="bg-slate-800 text-slate-300 text-center p-4 mt-12">
        <p>דף נחיתה זה נוצר באמצעות מחולל דפי הנחיתה</p>
      </footer>
    </div>
  );
};