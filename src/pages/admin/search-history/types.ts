
export interface JsonRecord {
  [key: string]: any;
}

export interface SearchHistory {
  id: string;
  address: string;
  user_id: string | null;
  searched_at: string;
  is_eligible: boolean | null;
  income_category: string | null;
  result_count: number;
  lmi_result_count: number;
  search_params: JsonRecord;
  result: JsonRecord;
  ip_address: string | null;
  user_agent: string | null;
  tract_id: string | null;
  search_query: string | null;
}

export interface DateRangeType {
  from: Date | undefined;
  to: Date | undefined;
}
