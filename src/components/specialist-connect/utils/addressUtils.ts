
/**
 * Format an address string to remove any undefined values and fix formatting issues
 */
export const formatAddress = (addressString: string): string => {
  if (!addressString) return "Property Address";
  
  // Replace 'undefined' (case insensitive) with empty string
  return addressString
    .replace(/undefined/gi, "")
    .replace(/,\s*,/g, ",") // Fix double commas
    .replace(/,\s*$/g, "") // Remove trailing comma
    .replace(/\s+/g, " ")  // Normalize spaces
    .trim();
};
