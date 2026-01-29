
import { cache } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LandingPage } from '../../components/LandingPage';
import type { PropertyDetails } from '../../types';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// This is crucial: it tells Next.js not to cache this page statically
// ensuring that every time a social crawler (FB/WhatsApp) hits the link,
// it gets the absolute latest data from Firestore.
export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

const getPropertyDetails = async (slug: string): Promise<PropertyDetails | null> => {
  if (!slug) return null;
  
  try {
    const decodedSlug = decodeURIComponent(slug);
    // Extracting the 20-character Firestore ID from the end of the slug
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
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const details = await getPropertyDetails(params.slug);
  
  if (!details) {
    return { title: 'הנכס לא נמצא | Realty-Pages' };
  }

  const isSold = details.isSold === true;
  const baseTitle = details.generatedTitle || details.address;
  
  // Dynamic Title for Social Sharing
  const title = isSold ? `נמכר! 🏠 ${baseTitle}` : baseTitle;

  // Dynamic Description for Social Sharing
  const seoDescription = isSold 
    ? `סגירת עסקה מוצלחת! הנכס ב-${details.address} נמכר. מחפשים למכור את שלכם? צרו קשר עם ${details.agentName}.`
    : (details.enhancedDescription?.property 
        ? details.enhancedDescription.property.substring(0, 160) 
        : details.generatedTitle);

  const imageUrl = details.images?.[0] || '';

  return {
    title: title,
    description: seoDescription,
    openGraph: {
      title: title,
      description: seoDescription,
      url: `https://realty-pages.com/${params.slug}`,
      siteName: 'Realty-Pages | דפי נחיתה לנדל"ן',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'he_IL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
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
