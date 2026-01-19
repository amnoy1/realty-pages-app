
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

const getPropertyDetails = cache(async (slug: string): Promise<PropertyDetails | null> => {
  if (!slug) return null;
  
  try {
    const decodedSlug = decodeURIComponent(slug);
    const idMatch = decodedSlug.match(/([a-zA-Z0-9]{20})$/);
    const id = idMatch ? idMatch[0] : null;

    if (!id || !db) return null;

    const docRef = doc(db, 'landingPages', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as PropertyDetails;
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

  const imageUrl = details.images?.[0] || '';

  return {
    title: details.generatedTitle,
    description: seoDescription,
    openGraph: {
      title: details.generatedTitle,
      description: seoDescription,
      url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL || 'your-domain.com'}/${params.slug}`,
      siteName: 'מחולל דפי נחיתה לנדל"ן',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: details.address,
        },
      ],
      locale: 'he_IL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: details.generatedTitle,
      description: seoDescription,
      images: [imageUrl],
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
