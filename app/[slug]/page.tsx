
import { cache } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LandingPage } from '../../components/LandingPage';
import type { PropertyDetails } from '../../types';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string;
  };
}

// Optimized fetcher with better error handling for build time
const getPropertyDetails = cache(async (slug: string): Promise<PropertyDetails | null> => {
  if (!slug) return null;
  
  try {
    // Decoding the slug in case it's URL-encoded (common with Hebrew characters)
    const decodedSlug = decodeURIComponent(slug);
    
    // Extract the unique 20-character Firestore ID from the end of the slug
    // Firestore IDs are exactly 20 characters of [a-zA-Z0-9]
    const idMatch = decodedSlug.match(/([a-zA-Z0-9]{20})$/);
    const id = idMatch ? idMatch[0] : null;

    if (!id || !db) {
      console.warn(`[PropertyPage] Missing ID or DB connection for slug: ${decodedSlug}`);
      return null;
    }

    const docRef = doc(db, 'landingPages', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // FIX: Casting docSnap.data() to object before spreading to satisfy TS spread rules
      return { ...(docSnap.data() as object), id: docSnap.id } as PropertyDetails;
    }
    return null;
  } catch (err) {
    console.error("[PropertyPage] Fetch error:", err);
    return null;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const details = await getPropertyDetails(params.slug);
  
  if (!details) {
    return { title: 'הנכס לא נמצא | מחולל דפי נחיתה' };
  }

  const seoDescription = details.enhancedDescription?.property 
    ? details.enhancedDescription.property.substring(0, 160) 
    : details.generatedTitle;

  return {
    title: details.generatedTitle,
    description: seoDescription,
    openGraph: {
      title: details.generatedTitle,
      description: seoDescription,
      url: `/${params.slug}`,
      siteName: 'מחולל דפי נחיתה לנדל"ן',
      images: details.images?.[0] ? [{ url: details.images[0] }] : [],
      locale: 'he_IL',
      type: 'website',
    },
  };
}

export default async function PropertyPage({ params }: PageProps) {
  const details = await getPropertyDetails(params.slug);

  if (!details) {
    notFound();
  }

  return <LandingPage details={details} isPreview={false} />;
}
