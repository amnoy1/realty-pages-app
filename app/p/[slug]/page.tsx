'use client';
import { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase';
import { LandingPage } from '../../../components/LandingPage';
import type { PropertyDetails } from '../../../types';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';


interface PageProps {
  params: {
    slug: string;
  };
}

// NOTE: This server-side function depends on the client-side Firebase SDK (`db`) being able to run
// in the server environment of Next.js for read operations. This is assumed to work for this implementation.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const fullSlug = params.slug;
    const idMatch = fullSlug.match(/([a-zA-Z0-9]{20})$/);

    if (!idMatch || !idMatch[0]) {
      return { title: 'דף לא נמצא' };
    }
    
    const id = idMatch[0];
    const docRef = db.collection('landingPages').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists()) {
      return { title: 'דף לא נמצא' };
    }

    const details = docSnap.data() as PropertyDetails;
    const description = (details.enhancedDescription.property || details.generatedTitle).substring(0, 160);


    return {
      title: details.generatedTitle,
      description: description,
      openGraph: {
        title: details.generatedTitle,
        description: description,
        url: `/p/${params.slug}`,
        siteName: 'מחולל דפי נחיתה לנדל"ן',
        images: [
          {
            url: details.images[0], // Use the first image for OG
            width: 1200,
            height: 630,
            alt: details.generatedTitle,
          },
        ],
        locale: 'he_IL',
        type: 'website',
      },
       twitter: {
        card: 'summary_large_image',
        title: details.generatedTitle,
        description: description,
        images: [details.images[0]],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: 'מחולל דפי נחיתה לנדל"ן',
      description: 'יצירת דפי נחיתה מקצועיים וממירים עבור נכסי נדל"н.',
    };
  }
}


const PropertyPage = ({ params }: PageProps) => {
  const [details, setDetails] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const fullSlug = params.slug;
        const idMatch = fullSlug.match(/([a-zA-Z0-9]{20})$/);

        if (!idMatch || !idMatch[0]) {
          notFound();
          return;
        }
        
        const id = idMatch[0];
        const docRef = db.collection('landingPages').doc(id);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          setDetails(docSnap.data() as PropertyDetails);
        } else {
          notFound();
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        notFound();
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
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        <p className="mt-4 text-lg text-white">טוען את פרטי הנכס...</p>
      </div>
    );
  }

  if (details) {
    return <LandingPage details={details} isPreview={false} />;
  }

  return null;
};

export default PropertyPage;
