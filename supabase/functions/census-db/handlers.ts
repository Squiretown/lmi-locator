
// Define constants locally instead of importing from another edge function
const CENSUS_API_BASE_URL = "https://api.census.gov/data";
const ACS_DATASET = "2019/acs/acs5"; // Using 2019 ACS 5-year estimates
const MEDIAN_INCOME_VARIABLE = "B19013_001E"; // Median household income variable

export async function getMedianIncome(params: { geoid: string, state: string, county: string, tract: string }) {
  console.log('Getting median income for tract:', params.geoid);
  
  try {
    // Get Census API Key from Deno environment
    const CENSUS_API_KEY = Deno.env.get("CENSUS_API_KEY");
    
    if (!CENSUS_API_KEY) {
      console.warn('Census API key not found in environment variables');
      throw new Error('Census API key not configured');
    }
    
    const { state, county, tract } = params;
    
    // Create URL for ACS API request
    const apiUrl = `${CENSUS_API_BASE_URL}/${ACS_DATASET}?get=${MEDIAN_INCOME_VARIABLE}&for=tract:${tract}&in=state:${state}%20county:${county}&key=${CENSUS_API_KEY}`;
    
    console.log(`Making request to Census ACS API`);
    
    // Make the API request
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Census API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Census API returns a 2D array with headers in the first row and data in subsequent rows
    if (data.length < 2) {
      throw new Error('Invalid response from Census API');
    }
    
    // Extract the median income value from the response
    const medianIncome = parseInt(data[1][0]);
    
    return {
      success: true,
      medianIncome
    };
  } catch (error) {
    console.error('Error fetching median income from Census API:', error);
    
    // Return error response
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

// Function to export search results as CSV
export async function exportSearchResults(supabase: any, params: { searchId: string, userId: string, format: string }) {
  console.log('Exporting search results:', params);
  
  try {
    // Verify that the search belongs to the user
    const { data: searchData, error: searchError } = await supabase
      .from('census_tract_searches')
      .select('*')
      .eq('id', params.searchId)
      .eq('user_id', params.userId)
      .single();
    
    if (searchError) throw new Error('Search not found or access denied');
    
    // Get the tract results for this search
    const { data: tractResults, error: tractError } = await supabase
      .from('census_tract_results')
      .select('id, tract_id, lmi_status')
      .eq('search_id', params.searchId);
    
    if (tractError) throw new Error('Unable to retrieve tract results');
    
    // Get all properties for these tracts
    let properties: any[] = [];
    
    for (const tract of tractResults) {
      const { data: tractProperties, error: propsError } = await supabase
        .from('tract_properties')
        .select('*')
        .eq('tract_result_id', tract.id);
        
      if (!propsError && tractProperties.length > 0) {
        // Append tract LMI status to each property
        const propertiesWithLmiStatus = tractProperties.map(prop => ({
          ...prop,
          lmi_eligible: tract.lmi_status,
          census_tract: tract.tract_id
        }));
        
        properties = [...properties, ...propertiesWithLmiStatus];
      }
    }
    
    // Convert to CSV
    const headers = ['address', 'city', 'state', 'zip_code', 'census_tract', 'lmi_eligible'];
    const csvRows = [
      // Headers
      headers.join(','),
      // Data rows
      ...properties.map(prop => 
        headers.map(header => {
          const val = prop[header];
          // Properly escape strings with quotes if they contain commas
          return typeof val === 'string' && val.includes(',') 
            ? `"${val.replace(/"/g, '""')}"` 
            : val;
        }).join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Update download count
    const newDownloadCount = (searchData.download_count || 0) + 1;
    
    return {
      success: true,
      csvContent,
      downloadCount: newDownloadCount,
      format: params.format
    };
    
  } catch (error) {
    console.error('Error exporting search results:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

// Add the handleApiRequest function to process different API requests
export async function handleApiRequest(supabase: any, action: string, params: any) {
  switch (action) {
    case 'getMedianIncome':
      return await getMedianIncome(params);
    case 'exportSearchResults':
      return await exportSearchResults(supabase, params);
    // Add more actions as needed
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
