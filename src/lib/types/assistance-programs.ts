
// Down Payment Assistance Program Types
export interface AssistanceProgram {
  id: string;
  name: string;
  description?: string;
  funding_source?: string;
  benefit_amount?: number;
  benefit_type?: string;
  income_limit_percentage?: number;
  min_credit_score?: number;
  first_time_buyer_required: boolean;
  military_status_required?: string;
  status: string;
  application_url?: string;
  contact_info?: Record<string, any>;
  program_details?: Record<string, any>;
  created_at: string;
  updated_at: string;
  program_locations?: ProgramLocation[];
  property_types_eligible?: PropertyTypeEligible[];
}

export interface ProgramLocation {
  id: string;
  program_id: string;
  location_type: string;
  location_value: string;
  created_at: string;
}

export interface PropertyTypeEligible {
  id: string;
  program_id: string;
  property_type: string;
  max_units?: number;
  max_price?: number;
  other_requirements?: Record<string, any>;
  created_at: string;
}

export interface ProgramEligibilityCheck {
  id: string;
  user_id?: string;
  search_id?: string;
  property_id?: string;
  first_time_buyer?: boolean;
  military_status?: string;
  residence_intent?: boolean;
  timeframe?: string;
  eligible_programs?: AssistanceProgram[];
  created_at: string;
}

export interface ProfessionalLead {
  id: string;
  professional_id?: string;
  client_name: string;
  email?: string;
  phone?: string;
  property_address?: string;
  property_id?: string;
  status: string;
  source?: string;
  notes?: string;
  eligible_programs?: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_contacted_at?: string;
}
