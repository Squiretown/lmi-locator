export type ManualContactType = 
  | 'attorney' 
  | 'title_company' 
  | 'inspector' 
  | 'appraiser' 
  | 'insurance' 
  | 'contractor' 
  | 'other'
  | 'realtor'
  | 'mortgage_professional';

export interface ManualContact {
  id: string;
  owner_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  professional_type?: ManualContactType;
  role_title?: string;
  notes?: string;
  visible_to_clients: boolean;
  requires_system_access: boolean;
  status: 'active' | 'inactive' | 'lead' | 'client';
  created_at: string;
  last_updated: string;
}

export interface CreateManualContactRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyName: string;
  professionalType: ManualContactType;
  roleTitle?: string;
  notes?: string;
  visibleToClients?: boolean;
}

export interface UpdateManualContactRequest extends Partial<CreateManualContactRequest> {
  id: string;
}
