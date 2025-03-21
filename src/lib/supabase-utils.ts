
import { JsonRecord } from './types';

/**
 * Safely converts Supabase Json type to a JavaScript object
 * @param jsonData The JSON data from Supabase
 * @returns A properly typed JavaScript object
 */
export function parseJsonData<T = JsonRecord>(jsonData: any): T {
  if (jsonData === null) return {} as T;
  
  if (typeof jsonData === 'object') {
    return jsonData as unknown as T;
  }
  
  try {
    if (typeof jsonData === 'string') {
      return JSON.parse(jsonData) as T;
    }
    return {} as T;
  } catch (error) {
    console.error('Error parsing JSON data:', error);
    return {} as T;
  }
}

/**
 * Helper to safely access search history data and convert JSON fields
 */
export function parseSearchHistory(searchData: any) {
  if (!searchData) return null;
  
  return {
    ...searchData,
    search_params: parseJsonData(searchData.search_params),
    result: parseJsonData(searchData.result)
  };
}
