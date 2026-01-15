import { Badge } from "@/components/ui/badge";

// Contact relationship types matching the updated crm_contacts_view
export type ContactRelationshipType = 
  | 'team_member'      // From professional_teams (realtor <-> mortgage professional)
  | 'client'           // From client_profiles
  | 'realtor_partner'  // Manual contact with professional_type = 'realtor'
  | 'lending_team'     // Manual contact with professional_type = 'mortgage_professional'
  | 'attorney'         // Manual contact with professional_type = 'attorney'
  | 'title_company'    // Manual contact with professional_type = 'title_company'
  | 'inspector'        // Manual contact with professional_type = 'inspector'
  | 'appraiser'        // Manual contact with professional_type = 'appraiser'
  | 'insurance'        // Manual contact with professional_type = 'insurance'
  | 'contractor'       // Manual contact with professional_type = 'contractor'
  | 'other';           // Any other manual contact type

export interface ContactBadgeInfo {
  label: string;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  color?: string;
}

/**
 * Get the appropriate badge information for a contact based on their relationship type
 * and professional type. This provides consistent display across the application.
 */
export function getContactBadgeInfo(
  relationshipType?: string,
  professionalType?: string
): ContactBadgeInfo {
  // First, check the explicit relationship_type from the view
  switch (relationshipType) {
    case 'team_member':
      // For team_member, check the professional_type to differentiate
      if (professionalType === 'realtor') {
        return { label: 'Realtor Partner', variant: 'default' };
      }
      if (professionalType === 'mortgage_professional') {
        return { label: 'Lending Team', variant: 'default' };
      }
      return { label: 'Team Member', variant: 'default' };
    
    case 'client':
      return { label: 'Client', variant: 'outline' };
    
    case 'realtor_partner':
      return { label: 'Realtor Partner', variant: 'default' };
    
    case 'lending_team':
      return { label: 'Lending Team', variant: 'default' };
    
    case 'attorney':
      return { label: 'Attorney', variant: 'secondary' };
    
    case 'title_company':
      return { label: 'Title Company', variant: 'secondary' };
    
    case 'inspector':
      return { label: 'Inspector', variant: 'secondary' };
    
    case 'appraiser':
      return { label: 'Appraiser', variant: 'secondary' };
    
    case 'insurance':
      return { label: 'Insurance', variant: 'secondary' };
    
    case 'contractor':
      return { label: 'Contractor', variant: 'secondary' };
    
    case 'other':
      return { label: 'Other', variant: 'secondary' };
    
    default:
      break;
  }

  // Fallback: Check professional_type directly
  // This handles cases where the view hasn't been updated yet
  switch (professionalType) {
    case 'realtor':
      return { label: 'Realtor Partner', variant: 'default' };
    case 'mortgage_professional':
      return { label: 'Lending Team', variant: 'default' };
    case 'attorney':
      return { label: 'Attorney', variant: 'secondary' };
    case 'title_company':
      return { label: 'Title Company', variant: 'secondary' };
    case 'inspector':
      return { label: 'Inspector', variant: 'secondary' };
    case 'appraiser':
      return { label: 'Appraiser', variant: 'secondary' };
    case 'insurance':
      return { label: 'Insurance', variant: 'secondary' };
    case 'contractor':
      return { label: 'Contractor', variant: 'secondary' };
    case 'client':
      return { label: 'Client', variant: 'outline' };
    default:
      return { label: 'Contact', variant: 'secondary' };
  }
}

/**
 * React component to render a contact badge
 */
interface ContactBadgeProps {
  relationshipType?: string;
  professionalType?: string;
  className?: string;
}

export function ContactBadge({ relationshipType, professionalType, className }: ContactBadgeProps) {
  const badgeInfo = getContactBadgeInfo(relationshipType, professionalType);
  
  return (
    <Badge variant={badgeInfo.variant} className={className}>
      {badgeInfo.label}
    </Badge>
  );
}

/**
 * Get all contacts of a specific category
 * Useful for filtering the network dashboard tabs
 */
export type ContactCategory = 
  | 'all' 
  | 'clients' 
  | 'team'  // Realtor partners + Lending team from professional_teams
  | 'vendors'  // Attorneys, title companies, inspectors, etc.
  | 'pending';

export function filterContactsByCategory(
  contacts: Array<{ relationship_type?: string; professional_type?: string; status?: string }>,
  category: ContactCategory
) {
  switch (category) {
    case 'clients':
      return contacts.filter(c => c.relationship_type === 'client');
    
    case 'team':
      // Team includes both professional_teams relationships and manual realtor/lending contacts
      return contacts.filter(c => 
        c.relationship_type === 'team_member' ||
        c.relationship_type === 'realtor_partner' ||
        c.relationship_type === 'lending_team'
      );
    
    case 'vendors':
      // Vendors are service providers - attorneys, title companies, etc.
      return contacts.filter(c => 
        ['attorney', 'title_company', 'inspector', 'appraiser', 'insurance', 'contractor', 'other'].includes(c.relationship_type || '')
      );
    
    case 'pending':
      return contacts.filter(c => c.status === 'pending');
    
    case 'all':
    default:
      return contacts;
  }
}

/**
 * Professional type options for the Add Contact dialog
 */
export const PROFESSIONAL_TYPE_OPTIONS = [
  { value: 'attorney', label: 'Attorney' },
  { value: 'title_company', label: 'Title Company' },
  { value: 'inspector', label: 'Home Inspector' },
  { value: 'appraiser', label: 'Appraiser' },
  { value: 'insurance', label: 'Insurance Agent' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'realtor', label: 'Realtor' },
  { value: 'mortgage_professional', label: 'Mortgage Professional' },
  { value: 'other', label: 'Other' },
] as const;

/**
 * Get display-friendly name for a professional type
 */
export function getProfessionalTypeLabel(type?: string): string {
  const option = PROFESSIONAL_TYPE_OPTIONS.find(opt => opt.value === type);
  return option?.label || type || 'Contact';
}
