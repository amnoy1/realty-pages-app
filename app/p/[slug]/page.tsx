import { cache } from 'react';
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LandingPage } from '../../../components/LandingPage';
import type { PropertyDetails } from '../../../types';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';


interface PageProps {
  params: {
    slug: string;
  };
}

const getPropertyDetails = cache(async (slug: string): Promise<PropertyDetails | null> => {
    try {
      const idMatch = slug.match(/([a-zA-Z0-9]{20})$/);
  
      if (!idMatch || !idMatch[0]) {
        console.warn(`Could not extract ID from slug: ${slug}`);
        return null;
      }
      
      const id = idMatch[0];

      if (!db) {
        console.error("Firestore is not initialized.");
        return null;
      }

      const docRef = doc(db, 'landingPages', id);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        return docSnap.data() as PropertyDetails;
      } else {
        console.warn(`Document with ID ${id} does not exist.`);
        return null;
      }
    } catch (err) {
      console.error("Error fetching document:", err);
      return null;
    }
  });


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const details = await getPropertyDetails(params.slug);
  
  if (!details) {
    return { title: 'דף לא נמצא' };
  }

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
}


const PropertyPage = async ({ params }: PageProps) => {
  const details = await getPropertyDetails(params.slug);

  if (!details) {
    notFound();
  }

  return <LandingPage details={details} isPreview={false} />;
};

export default PropertyPage;