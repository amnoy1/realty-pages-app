import { redirect } from 'next/navigation';

export default function LegacyPropertyRedirect({ params }: { params: { slug: string } }) {
  // Redirect legacy /p/address-id to /address-id
  redirect(`/${params.slug}`);
  return null;
}
