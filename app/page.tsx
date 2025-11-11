'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '../lib/firebase';
import { slugify } from '../lib/slugify';

import type { PropertyDetails, PropertyFormData } from '../types';
import { PropertyForm } from '../components/PropertyForm';
import { LandingPage } from '../components/LandingPage';

const HomePage: React.FC = () => {
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFormSubmit = async (formData: PropertyFormData) => {
    if (formData.images.length === 0) {
      alert('אנא העלה לפחות תמונה אחת.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          originalDescription: formData.description,
          address: formData.address 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const generatedData = await response.json();

      const newDetails: PropertyDetails = {
        ...formData,
        generatedTitle: generatedData.title,
        enhancedDescription: generatedData.description,
        features: generatedData.features,
      };
      setPropertyDetails(newDetails);
    } catch (error) {
      console.error("Error generating content via API route:", error);
      setPropertyDetails({
        ...formData,
        generatedTitle: "הזדמנות נדל\"ן שאסור לפספס",
        enhancedDescription: {
          area: `ניתוח הסביבה עבור ${formData.address} נכשל.`,
          property: formData.description,
          cta: "אל תפספסו את ההזדמנות, צרו קשר עוד היום!",
        },
        features: {},
      });
      alert(`שגיאה ביצירת התוכן: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}. נעשה שימוש בתוכן חלופי.`);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (base64: string, path: string): Promise<string> => {
    const storageRef = storage.ref(path);
    const snapshot = await storageRef.putString(base64, 'data_url');
    return snapshot.ref.getDownloadURL();
  };
  
  const handleSaveAndPublish = async () => {
    if (!propertyDetails) return;
    
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
        alert("אירעה שגיאה בשמירת דף הנחיתה. אנא נסה שוב.");
        setIsSaving(false);
    }
  };
  
  const resetApp = () => {
    setPropertyDetails(null);
  };

  if (!isClient) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen">
      {propertyDetails ? (
        <LandingPage 
            details={propertyDetails} 
            isPreview={true}
            onReset={resetApp} 
            onSave={handleSaveAndPublish}
            isSaving={isSaving}
        />
      ) : (
        <PropertyForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      )}
    </div>
  );
};

export default HomePage;
