
export type ProfessionalType = 'realtor' | 'mortgage_broker';
export type ProfessionalStatus = 'active' | 'pending' | 'inactive';

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
  lastUpdated: string | null;
  isVerified: boolean;
  isFlagged: boolean;
  notes: string | null;
  socialMedia: Record<string, any> | null;
}
