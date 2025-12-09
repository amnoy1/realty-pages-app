'use client';

import React, { useState, useEffect } from 'react';
import { db, storage, isMockMode } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { slugify } from '../lib/slugify';
import { useAppRouter } from '../components/RouterContext';

import type { PropertyDetails, PropertyFormData, PropertyFeatures } from '../types';
import { CreationForm } from '../components/CreationForm';
import { LandingPage } from '../components/LandingPage';

// --- Smart Fallback Logic (Client Side "AI") ---
// This runs if the real API fails or keys are missing.
// UPDATED: Now generates more "Sales-y" copy based on user requirements.
const generateSmartFallback = (description: string, address: string) => {
    const desc = description.toLowerCase();
    
    // Helper regex extractors
    const extractNumber = (regex: RegExp): string => {
        const match = description.match(regex);
        return match ? match[1] : "";
    };

    const hasKeyword = (keywords: string[]): string => {
        return keywords.some(k => description.includes(k)) ? "יש" : "";
    };

    // 1. Extract Features strictly from text
    const rooms = extractNumber(/(\d+(\.\d+)?)\s*חדר/i) || "";
    const floor = extractNumber(/קומה\s*(\d+)/) || extractNumber(/(\d+)\s*מתוך/) || "";
    const apartmentArea = extractNumber(/(\d+)\s*מ"ר/) || extractNumber(/(\d+)\s*מטר/) || "";
    const balconyArea = extractNumber(/(\d+)\s*מ"ר\s*מרפסת/) || extractNumber(/מרפסת\s*(\d+)/) || "";
    
    let parking = extractNumber(/(\d+)\s*חני/);
    if (!parking) {
        if (desc.includes("שתי חניות") || desc.includes("2 חניות")) parking = "2";
        else if (desc.includes("חניה") || desc.includes("חנייה")) parking = "1";
    }
    
    const elevator = hasKeyword(["מעלית"]) ? "יש" : "";
    const safeRoom = hasKeyword(['ממ"ד', 'ממד', 'מרחב מוגן']) ? 'ממ"ד' : "";
    const storage = hasKeyword(["מחסן"]) ? "יש" : "";
    
    const directions = [];
    if (desc.includes("צפון")) directions.push("צפון");
    if (desc.includes("דרום")) directions.push("דרום");
    if (desc.includes("מזרח")) directions.push("מזרח");
    if (desc.includes("מערב")) directions.push("מערב");
    const airDirections = directions.join(", ");

    const features: PropertyFeatures = {
        rooms,
        floor,
        apartmentArea,
        balconyArea,
        parking,
        elevator,
        safeRoom,
        storage,
        airDirections
    };

    // 2. Generate Contextual "Copywriter" Text (Fallback)
    
    // Title logic: Try to find a unique feature or default to benefit
    let titlePrefix = "לחיות את החלום:";
    if (balconyArea) titlePrefix = "שקיעות ועוצמה:";
    else if (desc.includes("שקט")) titlePrefix = "השקט של הכפר, בלב העיר:";
    
    const title = `${titlePrefix} ${rooms ? `דירת ${rooms} חדרים` : 'נכס ייחודי'} ב${address.split(',')[0]}`;
    
    const generatedDescription = {
        area: `דמיינו את הקפה של הבוקר במיקום המנצח של ${address}. סביבה המעניקה תחושת קהילה, נגישות מקסימלית ושקט נדיר. זה המקום בו כל יום מתחיל עם חיוך.`,
        property: `גלו מרחב מחיה שתוכנן בקפידה. 
        ${rooms ? `תיהנו מ-${rooms} חדרים מרווחים ומוארים, אידיאליים למשפחה.` : ''} 
        ${balconyArea ? `צאו למרפסת שמש של ${balconyArea} מ"ר והרגישו את הבריזה.` : ''}
        ${parking ? `פתרון חניה מושלם: ${parking} חניות פרטיות ונוחות.` : ''}
        זהו לא עוד נכס, אלא הבית הבא שלכם.`,
        cta: "הזדמנות נדירה שלא תחזור – תיאומים השבוע בלבד!"
    };

    return {
        title,
        description: generatedDescription,
        features
    };
};


const HomePage: React.FC = () => {
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
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
      let generatedData;
      
      try {
          console.log("Sending request to Gemini API...");
          const response = await fetch('/api/generate-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ originalDescription: formData.description, address: formData.address }),
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`API Error: ${response.status} - ${errorText}`);
          }
          
          generatedData = await response.json();
          console.log("Gemini API Success:", generatedData);

      } catch (err) {
          console.warn("⚠️ API Failed, switching to Smart Fallback:", err);
          generatedData = generateSmartFallback(formData.description, formData.address);
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
    if (isMockMode) {
        return "https://placehold.co/800x600/1e293b/FFF?text=Property+Image";
    }
    const storageRef = ref(storage, path);
    const snapshot = await uploadString(storageRef, base64, 'data_url');
    return getDownloadURL(snapshot.ref);
  };
  
  const handleSaveAndPublish = async () => {
    if (!propertyDetails) return;
    
    if (isMockMode) {
        alert("⚠️ שים לב: המערכת פועלת במצב הדגמה (ללא מפתחות Firebase).\nהדף לא באמת יישמר, אך תוכל לראות את התהליך.");
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            const mockUrl = `${window.location.origin}/p/mock-address-12345`;
            navigator.clipboard.writeText(mockUrl);
            alert("הדף 'נשמר' בהצלחה (Mock Mode)!\nהקישור הועתק אוטומטית ללוח.");
        }, 1500);
        return;
    }

    setIsSaving(true);
    try {
      const docRef = doc(collection(db, "landingPages"));
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

      await setDoc(docRef, dataToSave);

      const finalUrlPath = `/p/${slug}-${newId}`;
      const fullUrl = `${window.location.origin}${finalUrlPath}`;

      // --- CRITICAL UX FIX: Auto-copy URL and notify user ---
      navigator.clipboard.writeText(fullUrl).then(() => {
        alert("הדף פורסם בהצלחה! הקישור הועתק אוטומטית.");
        router.push(finalUrlPath);
      }).catch(err => {
        console.error("Failed to copy URL:", err);
        alert("הדף פורסם! לא ניתן היה להעתיק את הקישור אוטומטית.");
        router.push(finalUrlPath);
      });


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
          מצב הדגמה (ללא חיבור Firebase פעיל) - הנתונים ישמרו מקומית בלבד
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