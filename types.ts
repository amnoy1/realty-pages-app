
export interface PropertyFormData {
  title: string;
  address: string;
  description: string;
  price: string;
  agentName: string;
  agentEmail: string;
  agentWhatsApp: string;
  images: string[]; // array of base64 strings
  logo?: string; // base64 string
  targetAudience?: string[];
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

export interface EnhancedDescription {
  area: string;
  property: string;
  cta: string;
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
