'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '../lib/firebase';
// FIX: Removed v9 modular imports, as we are now using the v8-compatible API.
import { slugify } from '../lib/slugify';

import type { PropertyDetails, PropertyFormData } from '../types';
import { PropertyForm } from '../components/PropertyForm';
import { LandingPage } from '../components/LandingPage';
import { generatePropertyContent } from '../services/geminiService';

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
      const { title, description, features } = await generatePropertyContent(formData.description, formData.address);
      const newDetails: PropertyDetails = {
        ...formData,
        generatedTitle: title,
        enhancedDescription: description,
        features: features,
      };
      setPropertyDetails(newDetails);
    } catch (error) {
      console.error("Error generating content:", error);
      // Fallback: use original description and a generic title
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
      alert("שגיאה ביצירת התוכן. נעשה שימוש בתוכן חלופי.");
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: Updated to use Firebase v8 Storage API.
  const uploadFile = async (base64: string, path: string): Promise<string> => {
    const storageRef = storage.ref(path);
    const snapshot = await storageRef.putString(base64, 'data_url');
    return snapshot.ref.getDownloadURL();
  };
  
  const handleSaveAndPublish = async () => {
    if (!propertyDetails) return;
    
    setIsSaving(true);
    try {
      // 1. Generate a new document reference to get a unique ID *before* saving
      // FIX: Updated to use Firebase v8 Firestore API.
      const docRef = db.collection("landingPages").doc();
      const newId = docRef.id;

      // 2. Generate slug from address
      const slug = slugify(propertyDetails.address);

      // 3. Upload images and logo using the new ID for the path
      const imageUrls = await Promise.all(
        propertyDetails.images.map((img, index) => 
            uploadFile(img, `properties/${newId}/image_${index}.jpg`)
        )
      );
      
      let logoUrl = '';
      if (propertyDetails.logo) {
        logoUrl = await uploadFile(propertyDetails.logo, `properties/${newId}/logo.png`);
      }

      // 4. Prepare data for Firestore, including the slug and id
      const dataToSave = {
        ...propertyDetails,
        id: newId,
        slug: slug,
        images: imageUrls,
        logo: logoUrl,
      };

      // 5. Save the data to the document reference we created earlier
      // FIX: Updated to use Firebase v8 Firestore API.
      await docRef.set(dataToSave);
      
      // 6. Create the final user-friendly URL
      const finalUrl = `/p/${slug}-${newId}`;
      
      // 7. Redirect to the new page
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
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
