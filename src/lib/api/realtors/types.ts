// Realtor-specific types for the new standardized role system

export interface Realtor {
  id: string;
  userId: string;
  name: string;
  company: string;
  licenseNumber: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  bio?: string;
  photoUrl?: string;
  status: 'active' | 'pending' | 'inactive';
  socialMedia?: Record<string, any>;
  isVerified: boolean;
  isFlagged: boolean;
  notes?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface RealtorFormValues {
  name: string;
  company: string;
  licenseNumber: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  bio?: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface RealtorTable {
  id: string;
  user_id: string;
  name: string;
  company: string;
  license_number: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  bio?: string;
  photo_url?: string;
  status: string;
  social_media?: any;
  is_verified: boolean;
  is_flagged: boolean;
  notes?: string;
  created_at: string;
  last_updated: string;
}