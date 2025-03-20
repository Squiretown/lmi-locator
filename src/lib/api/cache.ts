
// Local caching implementation for API results

// Cache configuration
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_CACHE_SIZE = 100; // Maximum number of items to store in cache

// Simple LRU cache implementation
export class LRUCache {
  private cache: Map<string, { data: any, timestamp: number }>;
  private maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): any | null {
    if (!this.cache.has(key)) return null;
    
    const item = this.cache.get(key)!;
    
    // Check if cache item has expired
    if (Date.now() - item.timestamp > CACHE_EXPIRY) {
      this.cache.delete(key);
      return null;
    }
    
    // Move the accessed item to the end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.data;
  }

  set(key: string, data: any): void {
    // If cache is full, remove the least recently used item (first item)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Initialize cache
export const apiCache = new LRUCache(MAX_CACHE_SIZE);

// Helper function to make cached API requests
export const cachedFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const cachedResponse = apiCache.get(cacheKey);
  
  if (cachedResponse) {
    console.log('Using cached response from local cache for:', url);
    return cachedResponse;
  }

  console.log('Fetching from API:', url);
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Function to clear the API cache (useful for testing or forcing fresh data)
export const clearApiCache = (): void => {
  apiCache.clear();
  console.log('API cache cleared');
};
