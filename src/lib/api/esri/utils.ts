
/**
 * Parse an address string into components (basic implementation)
 * This is a simple implementation and may not work for all address formats
 * @param address Full address string to parse
 */
export const parseAddressComponents = (address: string): {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
} => {
  // Very basic parsing - this could be improved with a library
  const parts = address.split(',').map(part => part.trim());
  
  // Simple logic: first part is street, last part might contain zip, second to last might be state
  const result: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  } = {};
  
  if (parts.length >= 1) {
    result.street = parts[0];
  }
  
  if (parts.length >= 2) {
    result.city = parts[1];
  }
  
  if (parts.length >= 3) {
    // Last part might have zip code
    const lastPart = parts[parts.length - 1];
    const zipMatch = lastPart.match(/\d{5}(-\d{4})?/);
    
    if (zipMatch) {
      result.zip = zipMatch[0];
      // State might be before the zip
      const statePart = lastPart.replace(zipMatch[0], '').trim();
      if (statePart) {
        result.state = statePart;
      } else if (parts.length >= 4) {
        // If no state in last part, check second to last
        result.state = parts[parts.length - 2];
      }
    } else {
      // No zip found, assume last part is state
      result.state = lastPart;
    }
  }
  
  return result;
};
