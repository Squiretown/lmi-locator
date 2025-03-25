
/**
 * Parse an address string into components
 * This implementation handles more complex address formats
 * @param address Full address string to parse
 */
export const parseAddressComponents = (address: string): {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
} => {
  try {
    // Start with a clean address
    address = address.trim();
    
    // Extract ZIP code using regex
    const zipPattern = /\b(\d{5})(?:-\d{4})?\b/;
    const zipMatch = address.match(zipPattern);
    
    let zipCode: string | undefined;
    if (zipMatch) {
      zipCode = zipMatch[1];
      // Remove ZIP from address for further parsing
      address = address.substring(0, zipMatch.index).trim();
    }
    
    // Extract state using regex for US state abbreviations
    const statePattern = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/i;
    const stateMatch = address.match(statePattern);
    
    let state: string | undefined;
    if (stateMatch) {
      state = stateMatch[1].toUpperCase();
      // Remove state from address for further parsing
      const beforeState = address.substring(0, stateMatch.index).trim();
      const afterState = address.substring(stateMatch.index + stateMatch[0].length).trim();
      address = (beforeState + " " + afterState).trim();
    }
    
    // Extract city - look for the last comma before the state
    let city: string | undefined;
    if (address.includes(',')) {
      const parts = address.split(',');
      city = parts[parts.length - 1].trim();
      // Remove city from address
      address = parts.slice(0, parts.length - 1).join(',').trim();
    }
    
    // What remains should be the street address
    const street = address.trim();
    
    return {
      street: street || undefined,
      city: city || undefined,
      state: state || undefined,
      zip: zipCode || undefined
    };
  } catch (error) {
    console.error("Error parsing address:", error);
    // Return empty object in case of error
    return {};
  }
};
