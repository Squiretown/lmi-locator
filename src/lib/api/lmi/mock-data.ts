
import { LmiResult } from './types';

/**
 * Helper function to provide mock responses for testing
 * @param query The address or place name to generate mock data for
 * @param searchType The type of search ('address' or 'place')
 * @returns Mock LMI result object
 */
export function getMockResponse(query: string, searchType: 'address' | 'place' = 'address'): LmiResult {
  // For testing purposes - addresses containing "low" or "poor" will be LMI eligible
  const isLowIncome = query.toLowerCase().includes('low') || 
                      query.toLowerCase().includes('poor');
  
  // Addresses containing "rich" or "wealth" or "90210" will not be LMI eligible
  const isHighIncome = query.toLowerCase().includes('rich') || 
                       query.toLowerCase().includes('wealth') ||
                       query.toLowerCase().includes('90210');
  
  // Default to moderate income (eligible) if no keywords are present
  const isEligible = isLowIncome || (!isHighIncome);
  
  const medianIncome = isLowIncome ? 30000 : (isHighIncome ? 150000 : 62500);
  const ami = 100000; // Area Median Income
  const percentageOfAmi = (medianIncome / ami) * 100;
  
  let incomeCategory = "";
  if (percentageOfAmi <= 30) incomeCategory = "Extremely Low Income";
  else if (percentageOfAmi <= 50) incomeCategory = "Very Low Income";
  else if (percentageOfAmi <= 80) incomeCategory = "Low Income";
  else if (percentageOfAmi <= 120) incomeCategory = "Moderate Income";
  else incomeCategory = "Above Moderate Income";
  
  // Determine QCT status for mock data
  const isQct = isLowIncome || query.toLowerCase().includes('qct');
  
  const result: LmiResult = {
    status: "success",
    tract_id: isLowIncome ? "06075010200" : (isHighIncome ? "06037701000" : "06075010800"),
    median_income: medianIncome,
    ami,
    income_category: incomeCategory,
    percentage_of_ami: parseFloat(percentageOfAmi.toFixed(1)),
    eligibility: isEligible ? "Eligible" : "Ineligible",
    color_code: isEligible ? "success" : "danger",
    is_approved: isEligible,
    approval_message: isEligible 
      ? `APPROVED - This location is in a ${incomeCategory} Census Tract`
      : "NOT APPROVED - This location is not in an LMI Census Tract",
    lmi_status: isEligible ? "LMI Eligible" : "Not LMI Eligible",
    is_qct: isQct,
    qct_status: isQct ? "Qualified Census Tract" : "Not a Qualified Census Tract",
    geocoding_service: "Mock Data",
    timestamp: new Date().toISOString(),
    data_source: "MOCK DATA (Fallback Mode)",
    search_type: searchType
  };
  
  if (searchType === 'address') {
    result.address = query.toUpperCase();
  } else {
    result.place_name = query;
    result.matched_location = `Matched ${query}`;
  }
  
  // Add coordinates based on income type (just for variety in mock data)
  result.lat = isLowIncome ? 37.7749 : (isHighIncome ? 34.0736 : 38.5816);
  result.lon = isLowIncome ? -122.4194 : (isHighIncome ? -118.4004 : -121.4944);
  
  return result;
}
