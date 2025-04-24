
export type ProfessionalType = 'realtor' | 'mortgage_broker';
export type ProfessionalStatus = 'active' | 'pending' | 'inactive';

export interface ProfessionalDTO {
  id: string;
  user_id: string;
  type: string;
  name: string;
  company: string;
  license_number: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  bio: string | null;
  photo_url: string | null;
  status: string;
  created_at: string;
  last_updated: string;
  is_verified: boolean | null;
  is_flagged: boolean | null;
  notes: string | null;
  social_media: any;
}

export interface Professional {
  id: string;
  userId: string;
  type: ProfessionalType;
  name: string;
  company: string;
  licenseNumber: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  bio: string | null;
  photoUrl: string | null;
  status: ProfessionalStatus;
  createdAt: string;
  lastUpdated: string;
  isVerified: boolean;
  isFlagged: boolean;
  notes: string | null;
  socialMedia: any;
}
