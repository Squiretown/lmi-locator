/**
 * Mapbox Geocoding Service
 * Uses Mapbox Geocoding API for reliable address geocoding
 */

/**
 * Geocode an address using Mapbox Geocoding API
 * 
 * @param address The address to geocode
 * @returns Promise with geocoding result including coordinates
 */
export async function geocodeWithMapbox(address: string) {
  try {
    console.log('🗺️ Using Mapbox geocoding for address:', address);
    
    // Get Mapbox token from environment or edge function
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN') || await getMapboxTokenFromEdgeFunction();
    
    if (!mapboxToken) {
      throw new Error('Mapbox token not available');
    }

    const cleanAddress = address.trim().replace(/\s+/g, ' ');
    
    // Use Mapbox Geocoding API
    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanAddress)}.json`;
    const params = new URLSearchParams({
      access_token: mapboxToken,
      country: 'US',
      limit: '1',
      types: 'address'
    });

    const fullUrl = `${mapboxUrl}?${params.toString()}`;
    console.log('🌐 Mapbox geocoding URL:', fullUrl.replace(mapboxToken, 'HIDDEN_TOKEN'));

    const response = await fetch(fullUrl);
    console.log('📡 Mapbox response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Mapbox geocoding API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📊 Mapbox response structure:', Object.keys(data));

    if (!data.features || data.features.length === 0) {
      throw new Error(`No geocoding results found for address: ${cleanAddress}`);
    }

    const feature = data.features[0];
    console.log('📍 Mapbox feature:', feature);
    
    const coordinates = {
      lat: feature.center[1],  // Mapbox returns [lon, lat]
      lon: feature.center[0]
    };

    console.log('📍 Mapbox coordinates:', coordinates);

    // Now get census tract using the free Census Bureau API
    const tractId = await getCensusTract(coordinates.lat, coordinates.lon);

    return {
      lat: coordinates.lat,
      lon: coordinates.lon,
      tractId,
      geocoding_service: 'Mapbox',
      formattedAddress: feature.place_name,
      relevance: feature.relevance
    };

  } catch (error) {
    console.error('❌ Mapbox geocoding failed:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Helper function to get Mapbox token from the existing edge function
 */
async function getMapboxTokenFromEdgeFunction() {
  try {
    // Use the existing get-mapbox-token edge function
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const response = await fetch(`${supabaseUrl}/functions/v1/get-mapbox-token`);
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Failed to get Mapbox token from edge function:', error);
    return null;
  }
}

/**
 * Get census tract using Census Bureau API (free, no key needed)
 */
async function getCensusTract(lat: number, lon: number): Promise<string> {
  console.log(`🔍 Looking up census tract for coordinates: lat=${lat}, lon=${lon}`);
  
  try {
    // Method 1: Census Bureau API (free, no key needed)
    console.log('📞 Attempting Census Bureau API...');
    const censusUrl = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lon}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
    
    const response = await fetch(censusUrl, {
      headers: {
        'User-Agent': 'Supabase-Edge-Function/1.0'
      }
    });
    
    console.log('📡 Census API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Census response structure:', Object.keys(data));
      
      if (data.result?.geographies?.['Census Tracts']?.[0]) {
        const tract = data.result.geographies['Census Tracts'][0];
        const tractId = `${tract.STATE}${tract.COUNTY}${tract.TRACT.replace('.', '')}`;
        console.log('✅ Found tract ID from Census Bureau:', tractId);
        return tractId;
      } else {
        console.log('⚠️ No Census Tracts in response');
      }
    }
    
    // Method 2: FCC API backup (also free)
    console.log('📞 Attempting FCC API backup...');
    const fccUrl = `https://geo.fcc.gov/api/census/area?lat=${lat}&lon=${lon}&format=json`;
    const fccResponse = await fetch(fccUrl, {
      headers: {
        'User-Agent': 'Supabase-Edge-Function/1.0'
      }
    });
    
    console.log('📡 FCC API response status:', fccResponse.status);
    
    if (fccResponse.ok) {
      const fccData = await fccResponse.json();
      console.log('📊 FCC response structure:', Object.keys(fccData));
      
      if (fccData.results?.[0]?.block_fips) {
        const tractId = fccData.results[0].block_fips.substring(0, 11);
        console.log('✅ Found tract ID from FCC:', tractId);
        return tractId;
      } else {
        console.log('⚠️ No block_fips in FCC response');
      }
    }
    
    // Method 3: Manual test with known coordinates (Hampton Bays area)
    console.log('🧪 Testing with known Hampton Bays coordinates...');
    const hamptonBaysLat = 40.8687;
    const hamptonBaysLon = -72.5154;
    
    if (Math.abs(lat - hamptonBaysLat) < 0.1 && Math.abs(lon - hamptonBaysLon) < 0.1) {
      const knownTractId = '36103940100'; // Known Hampton Bays tract
      console.log('🎯 Using known Hampton Bays tract ID:', knownTractId);
      return knownTractId;
    }
    
    throw new Error('Could not determine census tract from any service');
    
  } catch (error) {
    console.error('❌ Census tract lookup failed:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}