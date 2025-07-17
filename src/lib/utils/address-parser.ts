/**
 * Utility functions for parsing and handling address data
 */

export interface ParsedAddress {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * Parse an address string to extract city, state, and zip code
 * Handles various address formats commonly found in property searches
 */
export function parseAddress(addressString: string): ParsedAddress {
  const cleaned = addressString.trim();
  
  // Default values
  const defaultResult: ParsedAddress = {
    address: cleaned,
    city: 'Unknown',
    state: 'Unknown',
    zipCode: '00000'
  };

  // Try to extract zip code (5 digits, optionally followed by -4 digits)
  const zipMatch = cleaned.match(/\b(\d{5}(?:-\d{4})?)\b/);
  const zipCode = zipMatch ? zipMatch[1] : defaultResult.zipCode;
  
  // Remove zip code from string for further parsing
  const withoutZip = zipMatch ? cleaned.replace(zipMatch[0], '').trim() : cleaned;
  
  // Try to extract state (2-letter abbreviation or full state name at the end)
  const stateMatch = withoutZip.match(/,?\s*([A-Z]{2}|[A-Za-z\s]+)\s*$/);
  let state = defaultResult.state;
  let withoutState = withoutZip;
  
  if (stateMatch) {
    state = stateMatch[1].trim();
    withoutState = withoutZip.replace(stateMatch[0], '').trim();
  }
  
  // Extract city (everything after the last comma, before state)
  const cityMatch = withoutState.match(/,\s*([^,]+)\s*$/);
  let city = defaultResult.city;
  let address = cleaned;
  
  if (cityMatch) {
    city = cityMatch[1].trim();
    address = withoutState.replace(cityMatch[0], '').trim();
  } else if (withoutState !== cleaned) {
    // If we found state but no comma-separated city, use the last part as city
    const parts = withoutState.split(/\s+/);
    if (parts.length > 1) {
      city = parts[parts.length - 1];
      address = parts.slice(0, -1).join(' ');
    }
  }
  
  return {
    address: address || cleaned,
    city: city || defaultResult.city,
    state: state || defaultResult.state,
    zipCode
  };
}

/**
 * Generate a unique MLS number for properties that don't have one
 */
export function generateMLSNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LMI-${timestamp.slice(-6)}-${random}`;
}

/**
 * Get a reasonable default price for properties
 */
export function getDefaultPrice(): number {
  return 1; // Use 1 instead of 0 to avoid potential division by zero issues
}