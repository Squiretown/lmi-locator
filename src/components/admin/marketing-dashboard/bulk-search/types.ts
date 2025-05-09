
export type SearchType = 'tract_id' | 'zip_code' | 'city' | 'county' | 'bulk';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface SearchResult {
  address: string;
  city: string;
  state: string;
  zip_code: string;
  is_eligible?: boolean;
}
