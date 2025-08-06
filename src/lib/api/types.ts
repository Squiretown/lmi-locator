
// Define common interface types used across the API

export interface Professional {
  id: string;
  userId: string;
  professionalType: 'realtor' | 'mortgage_professional';
  name: string;
  company: string;
  licenseNumber: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  bio: string | null;
  photoUrl: string | null;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
  lastUpdated: string;
  // Optional additional fields
  isVerified?: boolean | null;
  isFlagged?: boolean | null;
  notes?: string | null;
  socialMedia?: any;
}

export interface ProfessionalFormValues {
  name: string;
  professionalType: 'realtor' | 'mortgage_professional';
  company: string;
  licenseNumber: string;
  phone?: string;
  address?: string;
  website?: string;
  bio?: string;
  photoUrl?: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface Contact {
  id: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: 'active' | 'inactive' | 'lead' | 'client';
  createdAt: string;
  lastUpdated: string;
  customFields: any | null;
}

export interface ContactFormValues {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'lead' | 'client';
  customFields?: any;
}

export interface ContactInteraction {
  id: string;
  contactId: string;
  userId: string;
  type: 'note' | 'call' | 'email' | 'property_check';
  timestamp: string;
  description: string | null;
  metadata: any | null;
}

export interface ContactInteractionFormValues {
  type: 'note' | 'call' | 'email' | 'property_check';
  description?: string;
  metadata?: any;
}

export interface MortgageBroker {
  id: string;
  name: string;
  company: string;
  license_number: string;
  email: string;
  phone: string | null;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
}

export interface BrokerFormValues {
  name: string;
  company: string;
  license_number: string;
  email: string;
  phone?: string;
  status: 'active' | 'pending' | 'inactive';
}
