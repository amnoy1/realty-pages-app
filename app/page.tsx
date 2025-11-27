'use client';

import React, { useState, useEffect } from 'react';
import { db, storage, isMockMode } from '../lib/firebase';
import { slugify } from '../lib/slugify';
import { useAppRouter } from '../components/RouterContext';

import type { PropertyDetails, PropertyFormData, PropertyFeatures } from '../types';
import { CreationForm } from '../components/CreationForm';
import { LandingPage } from '../components/LandingPage';

// --- Smart Fallback Logic (Client Side "AI") ---
// This runs if the real API fails or keys are missing, ensuring data accuracy based on user input.
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
    // Handles "2.5 rooms", "3 rooms", "3.5 rooms"
    const rooms = extractNumber(/(\d+(\.\d+)?)\s*חדר/i) || "";
    
    // Handles "Floor 3", "3rd floor", "Floor 3 out of 5"
    const floor = extractNumber(/קומה\s*(\d+)/) || extractNumber(/(\d+)\s*מתוך/) || "";
    
    // Handles "100 sqm", "100 meters"
    const apartmentArea = extractNumber(/(\d+)\s*מ"ר/) || extractNumber(/(\d+)\s*מטר/) || "";
    
    // Handles "12 sqm balcony", "balcony 12 meters"
    const balconyArea = extractNumber(/(\d+)\s*מ"ר\s*מרפסת/) || extractNumber(/מרפסת\s*(\d+)/) || "";
    
    // Parking extraction - explicitly looks for number or defaults to 1 if just mentioned
    let parking = extractNumber(/(\d+)\s*חני/);
    if (!parking) {
        // Check for Hebrew word "two"
        if (desc.includes("שתי חניות") || desc.includes("2 חניות")) parking = "2";
        else if (desc.includes("חניה") || desc.includes("חנייה")) parking = "1";
    }
    
    const elevator = hasKeyword(["מעלית"]) ? "יש" : "";
    const safeRoom = hasKeyword(['ממ"ד', 'ממד', 'מרחב מוגן']) ? 'ממ"ד' : "";
    const storage = hasKeyword(["מחסן"]) ? "יש" : "";
    
    // Air directions extraction
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

    // 2. Generate Contextual Text
    const title = `הזדמנות נדירה: ${rooms ? `דירת ${rooms} חדרים` : 'נכס ייחודי'} ב${address.split(',')[0]}`;
    
    const generatedDescription = {
        area: `הנכס ממוקם בכתובת המבוקשת ${address}. סביבה איכותית המשלבת נגישות מצוינת, קהילה טובה וקרבה לכל השירותים החיוניים.`,
        property: `דירה המציעה ${rooms ? `${rooms} חדרים מרווחים` : 'חללים מרווחים'} ${apartmentArea ? `בשטח של כ-${apartmentArea} מ"ר` : ''}. 
        ${balconyArea ? `כולל מרפסת מפנקת בגודל ${balconyArea} מ"ר.` : ''}
        ${floor ? `ממוקמת בקומה ${floor}.` : ''} 
        ${parking ? `כולל ${parking} חניות.` : ''}
        ${description.length > 50 ? `פרטים נוספים: ${description.substring(0, 100)}...` : description}`,
        cta: "נכס כזה לא נשאר הרבה זמן בשוק. השאירו פרטים עכשיו לתיאום סיור בנכס."
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
      let generatedData;
      
      try {
          console.log("Sending request to Gemini API...");
          // Attempt real API call
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
          // Use the Smart Fallback that actually parses the user's text
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