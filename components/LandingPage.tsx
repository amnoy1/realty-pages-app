import React, { useRef } from 'react';
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
          return `0${localNum.substring(0, 2)}-${localNum.substring(2)}`;
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


const FeatureItem: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center justify-center text-center p-2">
      <div className="mb-2">{icon}</div>
      <p className="font-bold text-lg text-slate-800">{value}</p>
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
};

const FeaturesSection: React.FC<{ features: PropertyFeatures }> = ({ features }) => {
  const hasFeatures = Object.values(features).some(val => val);
  if (!hasFeatures) return null;

  return (
    <div className="bg-slate-100 p-4 rounded-2xl">
        <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">מאפייני הנכס</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 justify-items-center">
            <FeatureItem icon={<AreaIcon />} label={'מ"ר בנוי'} value={features.apartmentArea} />
            <FeatureItem icon={<BalconyIcon />} label={'מ"ר מרפסת'} value={features.balconyArea} />
            <FeatureItem icon={<BedIcon />} label="חדרים" value={features.rooms} />
            <FeatureItem icon={<FloorIcon />} label="קומה" value={features.floor} />
            {/* FIX: Changed label="ממ\"ד" to label={'ממ"ד'} to avoid TSX parsing error. */}
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

  return (
    <div className="bg-white">
      <header className="relative">
        <div className="w-full h-[60vh] max-h-[700px] bg-slate-800">
          <ImageGallery images={details.images} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        {details.logo && (
          <img src={details.logo} alt="לוגו המשרד" className="absolute top-4 right-4 h-20 md:h-24 w-auto max-w-[200px] object-contain bg-white/20 backdrop-blur-sm p-2 rounded-lg" />
        )}

        <div className="absolute bottom-0 right-0 p-6 md:p-12 text-white w-full">
            <div className="container mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">{details.generatedTitle}</h1>
                <p className="mt-2 text-xl md:text-2xl drop-shadow-md">{details.address}</p>
            </div>
        </div>
        
        <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
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
                <h2 className="text-3xl font-bold text-slate-800 mb-6 border-r-4 border-blue-600 pr-4">תיאור הנכס</h2>
                
                <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
                    <p className="whitespace-pre-wrap">{details.enhancedDescription.area}</p>
                    <p className="whitespace-pre-wrap">{details.enhancedDescription.property}</p>
                    <p className="font-semibold whitespace-pre-wrap">{details.enhancedDescription.cta}</p>
                </div>

                 <div className="mt-10">
                    <button
                        onClick={handleCtaClick}
                        className="w-full md:w-auto py-4 px-8 border border-transparent rounded-xl shadow-lg text-xl font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
                    >
                        אני רוצה לקבוע סיור בנכס
                    </button>
                </div>
            </div>
            <aside className="space-y-8 lg:sticky lg:top-10">
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
                    <p className="text-xl text-slate-500 mb-2">מחיר שיווק</p>
                    <div className="flex items-baseline justify-center gap-x-1 text-slate-800">
                        <span className="text-4xl font-extrabold">{formattedPrice}</span>
                        <span className="text-3xl font-bold">{shekelSign}</span>
                    </div>
                </div>

                <FeaturesSection features={details.features} />

                 <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center">
                    <p className="text-lg text-slate-600">לפרטים נוספים ותיאום סיור:</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{details.agentName}</p>
                    <a href={`https://wa.me/${details.agentWhatsApp}`} target="_blank" rel="noopener noreferrer" className="inline-block text-2xl text-blue-600 mt-2 font-semibold hover:underline">
                        {formatPhoneNumber(details.agentWhatsApp)}
                    </a>
                </div>
            </aside>
        </section>

        <section ref={leadFormRef} className="mt-20 pt-10 border-t border-slate-200">
             <LeadForm agentWhatsApp={details.agentWhatsApp} agentEmail={details.agentEmail} propertyTitle={details.generatedTitle} agentName={details.agentName} />
        </section>
      </main>
      
      <footer className="bg-slate-800 text-slate-300 text-center p-4 mt-12">
        <p>דף נחיתה זה נוצר באמצעות מחולל דפי הנחיתה</p>
      </footer>
    </div>
  );
};