'use client';
import { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase';
import { LandingPage } from '../../../components/LandingPage';
import type { PropertyDetails } from '../../../types';

interface PageProps {
  params: {
    slug: string;
  };
}

const PropertyPage = ({ params }: PageProps) => {
  const [details, setDetails] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const fullSlug = params.slug;
        const idMatch = fullSlug.match(/([a-zA-Z0-9]{20})$/);

        if (!idMatch || !idMatch[0]) {
          setError("מזהה הנכס בכתובת ה-URL אינו תקין.");
          setLoading(false);
          return;
        }
        
        const id = idMatch[0];
        const docRef = db.collection('landingPages').doc(id);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          setDetails(docSnap.data() as PropertyDetails);
        } else {
          setError('דף הנחיתה המבוקש לא נמצא.');
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError('אירעה שגיאה בטעינת הדף.');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
        fetchProperty();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-lg">טוען את פרטי הנכס...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-center p-4">
        <div>
          <h1 className="text-2xl font-bold text-red-600">שגיאה</h1>
          <p className="text-gray-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (details) {
    return <LandingPage details={details} isPreview={false} />;
  }

  return null;
};

export default PropertyPage;
