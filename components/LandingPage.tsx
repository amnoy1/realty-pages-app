
/**
 * © 2025 Realty-Pages.com. All rights reserved.
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import type { PropertyDetails, PropertyFeatures, FAQItem } from '../types';
import { ImageGallery } from './ImageGallery';
import { LeadForm } from './LeadForm';

interface LandingPageProps {
  details: PropertyDetails;
  isPreview?: boolean;
  onReset?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const formatPriceWithCommas = (priceStr: string) => {
  const cleaned = priceStr.replace(/[^\d]/g, '');
  if (!cleaned) return priceStr;
  return new Intl.NumberFormat('he-IL').format(parseInt(cleaned));
};

const BedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-accent"><path d="M2 4v16h20V4H2z"/><path d="M2 10h20"/><path d="M12 4v6"/></svg>;
const AreaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-accent"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.536 1.907 6.344l-1.495 5.454 5.57-1.451zm.5-7.527c.08-.135.143-.225.246-.354.103-.13.21-.211.353-.267.143-.057.3-.086.48-.086.195 0 .358.03.49.09.13.06.23.145.302.26.07.115.105.245.105.39.0.15-.03.28-.09.4-.06.12-.135.225-.225.315-.09.09-.195.17-.315.235-.12.065-.255.115-.405.15-.15.035-.315.06-.495.06-.205 0-.39-.03-.56-.09-.17-.06-.315-.145-.445-.255-.13-.11-.235-.24-.315-.375s-.13-.285-.15-.45c-.02-.165-.03-.32-.03-.465.0-.15.015-.285.045-.405zm1.996 2.95c.12-.06.225-.135.315-.225.09-.09.165-.195.225-.315s.105-.255.135-.405.045-.315.045.495c0-.21-.03-.4-.09-.56-.06-.16-.14-.295-.24-.41-.1-.115-.21-.2-.33-.255s-.25-.085-.39-.085c-.165 0-.315.03-.45.085s-.255.135-.36.255c-.105.12-.195.27-.27.45s-.12.375-.15.585c-.03.21-.045.42-.045.615.0.21.015.405.045.615.0.21.015.405.045.585s.075.345.135.495.135.285.225.405.195.225.315.315c.12.09.255.165.405.225.15.06.315.09.495.09.195 0 .375-.03.54-.09s.31-.14.435-.25c.125-.11.225-.24.3-.39s.125-.315.15-.495c.025-.18.038-.36.038-.525.0-.195-.03-.375-.09-.54s-.135-.315-.225-.45c-.09-.135-.195-.255-.315-.36-.12-.105-.255-.18-.405-.225s-.315-.06-.495-.06c-.195 0-.375.03-.54.09s-.31.14-.435.25c-.125-.11-.225-.24-.3.39s-.125-.315-.15-.495c-.025-.18-.038-.36-.038-.525z"/></svg>;

const FAQSection: React.FC<{ faq: FAQItem[] }> = ({ faq }) => {
    if (!faq || faq.length === 0) return null;
    return (
        <section className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl mt-12">
            <h2 className="text-3xl font-black text-slate-900 mb-10 text-center font-sans underline decoration-brand-accent decoration-4">שאלות נפוצות</h2>
            <div className="space-y-8">
                {faq.map((item, i) => (
                    <div key={i} className="border-b border-slate-100 pb-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 font-sans">{item.question}</h3>
                        <p className="text-slate-600 leading-relaxed font-sans">{item.answer}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export const LandingPage: React.FC<LandingPageProps> = ({ details, isPreview = false, onReset, onSave, isSaving }) => {
  const leadFormRef = useRef<HTMLDivElement>(null);
  const handleCtaClick = () => leadFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  const formattedPrice = formatPriceWithCommas(details.price);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans flex flex-col" dir="rtl">
        {!isPreview && (
            <a href={`https://wa.me/${details.agentWhatsApp}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl z-50 hover:scale-110 transition-transform duration-300 border-4 border-white"><WhatsAppIcon/></a>
        )}
      <header className="relative h-[90vh] min-h-[650px] text-white overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-slate-900"><ImageGallery images={details.images} /></div>
        <div className="absolute bottom-10 right-6 md:right-16 z-20 max-w-5xl animate-slide-up">
            <div className="bg-black/30 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">{details.propertyTitle || details.generatedTitle}</h1>
                <p className="text-2xl md:text-3xl font-bold text-brand-accent mb-8">{details.address}</p>
                <div className="flex flex-wrap gap-6 mb-10">
                    {details.features.rooms && <div className="flex items-center gap-2"><BedIcon /> <span className="font-bold text-xl">{details.features.rooms} חדרים</span></div>}
                    {details.features.apartmentArea && <div className="flex items-center gap-2"><AreaIcon /> <span className="font-bold text-xl">{details.features.apartmentArea} מ"ר</span></div>}
                </div>
                <button onClick={handleCtaClick} className="py-5 px-12 rounded-full shadow-2xl text-2xl font-black text-white bg-gradient-to-r from-brand-accent to-orange-600 hover:scale-105 transition-all">תיאום סיור בנכס</button>
            </div>
        </div>
        
        <div className="absolute top-6 left-6 flex flex-col gap-4 z-50">
           {isPreview && (
               <>
                <button onClick={onReset} className="bg-slate-900/80 text-white py-2 px-6 rounded-full hover:bg-black transition-all text-sm backdrop-blur-md border border-white/10 font-bold">חזרה לעריכה</button>
                <button onClick={onSave} disabled={isSaving} className="bg-brand-accent text-white py-3 px-8 rounded-full hover:bg-brand-accentHover transition-all font-black shadow-2xl border border-white/20">{isSaving ? 'שומר...' : 'פרסם דף SEO'}</button>
               </>
           )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 max-w-6xl flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
                <article className="bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-slate-100 prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-loose">
                    <div className="mb-12">
                        <h2 className="text-4xl font-black text-slate-900 mb-6">{details.generatedTitle}</h2>
                        <div className="w-24 h-2 bg-brand-accent rounded-full"></div>
                    </div>
                    
                    <div className="text-xl font-medium text-slate-700 mb-10 p-6 bg-slate-50 rounded-2xl border-r-8 border-brand-accent">{details.enhancedDescription.area}</div>
                    
                    <div className="seo-content" dangerouslySetInnerHTML={{ __html: details.enhancedDescription.longSeoContent || details.enhancedDescription.property }} />
                </article>

                <FAQSection faq={details.enhancedDescription.faq || []} />
            </div>

            <aside className="lg:col-span-4 space-y-8">
                <div className="sticky top-10">
                    <div className="bg-slate-900 text-white p-10 rounded-3xl shadow-2xl text-center border-t-8 border-brand-accent mb-8">
                        <p className="text-slate-400 mb-2 font-bold uppercase tracking-widest text-xs">מחיר מבוקש</p>
                        <div className="text-5xl font-black text-white">₪{formattedPrice}</div>
                    </div>

                    <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-lg text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center text-slate-300 border-4 border-white shadow-md">
                            {details.logo ? <img src={details.logo} className="w-full h-full object-contain p-2" /> : <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                        </div>
                        <p className="text-slate-500 font-bold mb-1">הסוכן המטפל</p>
                        <h3 className="text-2xl font-black text-slate-900 mb-6">{details.agentName}</h3>
                        <a href={`https://wa.me/${details.agentWhatsApp}`} className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 px-6 rounded-2xl font-black hover:scale-105 transition-all shadow-lg"><WhatsAppIcon/> וואטסאפ</a>
                    </div>
                </div>
            </aside>
        </div>

        <section ref={leadFormRef} className="mt-32">
             <LeadForm 
                agentWhatsApp={details.agentWhatsApp} 
                agentEmail={details.agentEmail} 
                propertyTitle={details.generatedTitle} 
                agentName={details.agentName} 
             />
        </section>
      </main>

      <section className="mt-20 py-12 px-4 bg-slate-900 border-t border-white/5 text-center shrink-0">
          <p className="text-lg md:text-xl font-medium text-slate-400 mb-4 font-sans leading-tight">דף זה נוצר באמצעות מערכת ייצור דפי הנחיתה החזקה בעולם</p>
          <a href="/" className="text-brand-accent hover:text-white text-xl font-black font-sans transition-all duration-300 inline-block border-b-2 border-brand-accent hover:border-white pb-1">realty-pages.com</a>
      </section>

      <footer className="bg-slate-950 text-slate-500 text-center py-10 border-t border-white/5 shrink-0">
        <p className="text-xs font-bold uppercase tracking-widest opacity-40">© {new Date().getFullYear()} - REALTY PAGES SEO GENERATOR</p>
      </footer>
    </div>
  );
};
