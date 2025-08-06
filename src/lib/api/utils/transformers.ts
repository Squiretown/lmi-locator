
import { 
  ProfessionalTable, 
  ContactTable, 
  ContactInteractionTable 
} from '../database-types';
import { 
  Professional, 
  Contact, 
  ContactInteraction 
} from '../types';

// Transform database object to Professional interface
export const transformProfessional = (item: ProfessionalTable): Professional => ({
  id: item.id,
  userId: item.user_id,
  professionalType: item.professional_type,
  name: item.name,
  company: item.company,
  licenseNumber: item.license_number,
  phone: item.phone,
  address: item.address || null,
  website: item.website,
  bio: item.bio,
  photoUrl: item.photo_url,
  status: item.status || 'pending',
  createdAt: item.created_at,
  lastUpdated: item.last_updated,
  isVerified: item.is_verified,
  isFlagged: item.is_flagged,
  notes: item.notes,
  socialMedia: item.social_media
});

// Transform database object to Contact interface
export const transformContact = (item: ContactTable): Contact => ({
  id: item.id,
  ownerId: item.owner_id,
  firstName: item.first_name,
  lastName: item.last_name,
  email: item.email,
  phone: item.phone,
  address: item.address,
  notes: item.notes,
  status: item.status,
  createdAt: item.created_at,
  lastUpdated: item.last_updated,
  customFields: item.custom_fields
});

// Transform database object to ContactInteraction interface
export const transformInteraction = (item: ContactInteractionTable): ContactInteraction => ({
  id: item.id,
  contactId: item.contact_id,
  userId: item.user_id,
  type: item.type,
  timestamp: item.timestamp,
  description: item.description,
  metadata: item.metadata
});
