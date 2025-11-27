'use client';

import React, { useState, useEffect } from 'react';
import { db, storage, isMockMode } from '../lib/firebase';
import { slugify } from '../lib/slugify';
import { useAppRouter } from '../components/RouterContext';

import type { PropertyDetails, PropertyFormData } from '../types';
import { CreationForm } from '../components/CreationForm';
import { LandingPage } from '../components/LandingPage';

const HomePage: React.FC = () => {
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Use our safe router wrapper
  const router = useAppRouter();

  useEffect(() => {
    setIsClient(true);
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Application started');
    }
  }, []);

  const handleFormSubmit = async (formData: PropertyFormData) => {
    if (formData.images.length === 0) {
      alert('אנא העלה לפחות תמונה אחת.');
      return;
    }

    setIsLoading(true);
    try {
      // In Mock Mode or if API fails, we simulate a response if the fetch fails
      let generatedData;
      
      try {
          const response = await fetch('/api/generate-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ originalDescription: formData.description, address: formData.address }),
          });

          if (!response.ok) throw new Error('API Error');
          generatedData = await response.json();
      } catch (err) {
          console.warn("API call failed (expected in preview without keys), using fallback data.");
          // Fallback data for preview/mock mode
          generatedData = {
              title: "דירת חלומות יוקרתית במיקום מנצח",
              description: {
                  area: `הנכס ממוקם בלב ${formData.address}, אזור מבוקש המשלב חיי קהילה תוססים עם שקט ופרטיות.`,
                  property: "דירה מרווחת ומוארת, מעוצבת אדריכלית ברמה הגבוהה ביותר. המטבח המודרני נפתח לסלון רחב ידיים, והמרפסת משקיפה לנוף עוצר נשימה.",
                  cta: "הזדמנות נדירה לגור בבית שתמיד חלמתם עליו. צרו קשר עוד היום לתיאום סיור."
              },
              features: {
                  rooms: "4",
                  apartmentArea: "110",
                  balconyArea: "12",
                  floor: "3",
                  elevator: "יש",
                  parking: "2",
                  safeRoom: 'ממ"ד',
                  airDirections: "דרום, מערב"
              }
          };
      }

      const newDetails: PropertyDetails = {
        ...formData,
        generatedTitle: generatedData.title,
        enhancedDescription: generatedData.description,
        features: generatedData.features,
      };
      setPropertyDetails(newDetails);
    } catch (error) {
      console.error("Critical error in form submission:", error);
      alert("אירעה שגיאה. אנא נסה שנית.");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (base64: string, path: string): Promise<string> => {
    // If in mock mode, return a dummy URL immediately
    if (isMockMode) {
        return "https://placehold.co/800x600/1e293b/FFF?text=Property+Image";
    }
    const storageRef = storage.ref(path);
    const snapshot = await storageRef.putString(base64, 'data_url');
    return snapshot.ref.getDownloadURL();
  };
  
  const handleSaveAndPublish = async () => {
    if (!propertyDetails) return;
    
    if (isMockMode) {
        alert("⚠️ שים לב: המערכת פועלת במצב הדגמה (ללא מפתחות Firebase).\nהדף לא באמת יישמר, אך תוכל לראות את התהליך.");
        // Simulate delay
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert("הדף 'נשמר' בהצלחה (Mock Mode)!");
        }, 1500);
        return;
    }

    setIsSaving(true);
    try {
      const docRef = db.collection("landingPages").doc();
      const newId = docRef.id;
      const slug = slugify(propertyDetails.address);

      const imageUrls = await Promise.all(
        propertyDetails.images.map((img, index) => 
            uploadFile(img, `properties/${newId}/image_${index}.jpg`)
        )
      );
      
      let logoUrl = '';
      if (propertyDetails.logo) {
        logoUrl = await uploadFile(propertyDetails.logo, `properties/${newId}/logo.png`);
      }

      const dataToSave: PropertyDetails = {
        ...propertyDetails,
        id: newId,
        slug: slug,
        images: imageUrls,
        logo: logoUrl,
      };

      await docRef.set(dataToSave);
      const finalUrl = `/p/${slug}-${newId}`;
      router.push(finalUrl);

    } catch (error) {
        console.error("Error saving document: ", error);
        alert("אירעה שגיאה בשמירת דף הנחיתה.");
        setIsSaving(false);
    }
  };
  
  const resetApp = () => {
    setPropertyDetails(null);
  };

  if (!isClient) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-900">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-accent"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-slate-900">
      {isMockMode && (
        <div className="fixed top-0 inset-x-0 bg-orange-600 text-white text-xs font-bold px-2 py-1 z-[100] text-center shadow-md">
          מצב הדגמה (ללא חיבור Firebase פעיל)
        </div>
      )}
      
      {propertyDetails ? (
        <LandingPage 
            details={propertyDetails} 
            isPreview={true}
            onReset={resetApp} 
            onSave={handleSaveAndPublish}
            isSaving={isSaving}
        />
      ) : (
        <CreationForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      )}
    </div>
  );
};

export default HomePage;
