export interface PropertyFormData {
  address: string;
  description: string;
  price: string;
  agentName: string;
  agentEmail: string;
  agentWhatsApp: string;
  images: string[]; // array of base64 strings
  logo?: string; // base64 string
}

export interface PropertyFeatures {
  apartmentArea?: string;
  balconyArea?: string;
  rooms?: string;
  floor?: string;
  safeRoom?: string;
  parking?: string;
  storage?: string;
  airDirections?: string;
  elevator?: string;
}

export interface EnhancedDescription {
  area: string;
  property: string;
  cta: string;
}

export interface PropertyDetails extends PropertyFormData {
  id?: string; // Optional because it's added on save
  slug?: string; // Optional because it's added on save
  userId?: string; // The Google UID of the creator
  userEmail?: string; // The email of the creator (for admin view)
  createdAt?: number; // Timestamp
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
}
