
/**
 * Interface for LMI check result
 */
export interface LmiResult {
  status: string;
  address?: string;
  place_name?: string;
  matched_location?: string;
  lat?: number;
  lon?: number;
  tract_id: string;
  median_income?: number;
  ami?: number;
  income_category?: string;
  percentage_of_ami?: number;
  hud_low_mod_percent?: number;
  hud_low_mod_population?: number;
  eligibility: string;
  color_code?: string;
  is_approved: boolean;
  approval_message: string;
  lmi_status?: string;
  is_qct?: boolean;
  qct_status?: string;
  geocoding_service?: string;
  timestamp: string;
  data_source?: string;
  message?: string;
  search_type?: string;
  need_manual_verification?: boolean;
}

/**
 * Options for LMI status check
 */
export interface LmiCheckOptions {
  useHud?: boolean;
  useEnhanced?: boolean;
  useDirect?: boolean;
  searchType?: 'address' | 'place';
  level?: 'tract' | 'blockGroup';
}
