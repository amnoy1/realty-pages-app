
export interface PropertyFormData {
  address: string;
  description: string;
  price: string;
  agentName: string;
  agentEmail: string;
  agentWhatsApp: string;
  images: string[];
  logo?: string;
  targetAudience?: string[];
  propertyTitle?: string; // הכותרת השיווקית שהמשתמש מזין
}

export interface PropertyFeatures {
  apartmentArea?: string;
  lotArea?: string;
  balconyArea?: string;
  rooms?: string;
  floor?: string;
  safeRoom?: string;
  parking?: string;
  storage?: string;
  airDirections?: string;
  elevator?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface EnhancedDescription {
  area: string;
  property: string;
  cta: string;
  longSeoContent?: string; // התוכן העמוק (900 מילים)
  faq?: FAQItem[]; // שאלות נפוצות ל-Snippets
  metaTitle?: string;
  metaDescription?: string;
  seoSlug?: string;
}

export interface PropertyDetails extends PropertyFormData {
  id?: string;
  slug?: string;
  userId?: string;
  userEmail?: string;
  createdAt?: number;
  generatedTitle: string;
  enhancedDescription: EnhancedDescription;
  features: PropertyFeatures;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  lastLogin: number;
  createdAt?: number;
}

export interface Lead {
  id?: string;
  propertyId: string;
  propertyTitle: string;
  ownerId: string;
  fullName: string;
  phone: string;
  createdAt: number;
}
