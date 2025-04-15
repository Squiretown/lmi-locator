
// API Response Types
export interface CheckLmiStatusResponse {
  is_approved: boolean;
  address: string;
  approval_message: string;
  tract_id: string;
  median_income: number;
  ami: number;
  income_category: string;
  percentage_of_ami: number;
  eligibility: string;
  lmi_status: string;
  is_qct?: boolean;
  qct_status?: string;
  qct_info?: {
    year?: number;
    designation_type?: string;
    poverty_rate?: number;
    income_threshold?: number;
    additional_info?: string;
  } | null;
  geocoding_service?: string;
  lat?: number;
  lon?: number;
}

// Form submission types
export interface EligibilityScreenerFormData {
  first_time_buyer: boolean;
  military_status: string;
  residence_intent: boolean;
  timeframe: string;
}

// Dashboard Statistics Interface
export interface DashboardStats {
  totalSearches: number;
  lmiProperties: number;
  lmiPercentage: number;
  recentSearches: any[]; // Will import SearchHistory type later
}

// Program Results Props
export interface ProgramResultsProps {
  programs: any[]; // Will import AssistanceProgram type later
  address: string;
  onConnectSpecialist: () => void;
}

// Add JsonRecord type 
export type JsonRecord = Record<string, any>;

// Replace the problematic import of Json from @supabase/supabase-js
// with a simpler approach for JSON type conversion
export type JsonToRecord<T> = T extends object ? T : JsonRecord;
