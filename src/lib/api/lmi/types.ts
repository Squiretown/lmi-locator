
// Type definitions for LMI API module

/**
 * Result object returned from LMI eligibility check
 */
export interface LmiResult {
  status: 'success' | 'error' | 'warning';
  message?: string;
  address?: string;
  place_name?: string;
  matched_location?: string;
  tract_id?: string;
  lat?: number;
  lon?: number;
  median_income?: number;
  ami?: number;
  income_category?: string;
  percentage_of_ami?: number;
  eligibility?: string;
  color_code?: string;
  is_approved?: boolean;
  approval_message?: string;
  lmi_status?: string;
  is_qct?: boolean;
  qct_status?: string;
  geocoding_service?: string;
  timestamp?: string;
  data_source?: string;
  search_type?: 'address' | 'place';
  // New properties for HUD low-mod data
  hud_low_mod_percent?: number;
  hud_low_mod_population?: number;
  need_manual_verification?: boolean;
}

/**
 * Options for LMI status check
 */
export interface LmiCheckOptions {
  searchType?: 'address' | 'place';
  level?: 'tract' | 'blockGroup';
  useHud?: boolean;
  useEnhanced?: boolean;
  useDirect?: boolean;
  useMock?: boolean;
}
