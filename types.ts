
export interface PropertyFormData {
  address: string;
  description: string;
  price: string;
  agentName: string;
  agentEmail: string;
  agentWhatsApp: string;
  images: string[]; // array of base64 strings
  logo?: string; // base64 string
  targetAudience?: string[]; // קהלי יעד נבחרים
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
  userId?: string; // ה-UID של הסוכן שיצר את הדף
  userEmail?: string;
  createdAt?: number;
  generatedTitle: string;
  propertyType: string; // סוג הנכס (דירה, בית פרטי, פנטהאוז וכו')
  enhancedDescription: EnhancedDescription;
  features: PropertyFeatures;
  isSold?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  lastLogin: number;
  createdAt?: number; // מועד הצטרפות למערכת
}

export interface Lead {
  id?: string;
  propertyId: string;    // מזהה הנכס שעליו פנו
  propertyTitle: string; // כותרת הנכס (לנוחות תצוגה)
  ownerId: string;       // ה-UID של הסוכן (למי הליד שייך)
  fullName: string;
  phone: string;
  createdAt: number;
}
