
export interface PropertyFormData {
  address: string;
  description: string; // This will act as the Main Title
  gitRequirement?: string; // New field for Git/Development context
  rawNotes?: string;   
  useAsIs?: boolean;   
  price: string;
  agentName: string;
  agentEmail: string;
  agentWhatsApp: string;
  images: string[]; 
  logo?: string; 
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
  id?: string;
  slug?: string;
  userId?: string;
  userEmail?: string;
  createdAt?: number;
  generatedTitle: string;
  enhancedDescription: EnhancedDescription;
  features: PropertyFeatures;
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

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  lastLogin: number;
}
