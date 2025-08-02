
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple custom error class - define it directly in this file
class GeocodingError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'GeocodingError'
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { address } = await req.json()
    
    if (!address) {
      throw new Error('Address is required')
    }

    console.log('🔍 LMI check request for address:', address)

    // Step 1: Geocode with Mapbox (using your existing system)
    const geocodeResult = await geocodeWithMapbox(address)
    
    if (!geocodeResult.success) {
      throw new GeocodingError(`Geocoding failed: ${geocodeResult.error}`)
    }

    console.log('📍 Geocoding successful:', geocodeResult.coordinates)

    // Step 2: Get census tract
    const tractId = await getCensusTract(geocodeResult.coordinates.lat, geocodeResult.coordinates.lon)
    console.log('🏠 Found tract ID:', tractId)

    // Step 3: Check FFIEC database
    const ffiecResult = await checkFFIECDatabase(supabase, tractId)
    
    if (ffiecResult.success) {
      console.log('✅ Found FFIEC data:', ffiecResult.data.is_lmi_eligible)
      
      const isEligible = ffiecResult.data.is_lmi_eligible
      
      return new Response(
        JSON.stringify({
          success: true,
          status: 'success',
          lmi_eligible: isEligible,
          is_approved: isEligible,
          tract_id: ffiecResult.data.tract_id,
          income_level: ffiecResult.data.income_level,
          ami_percentage: ffiecResult.data.ami_percentage,
          median_income: ffiecResult.data.median_income || 0,
          ami: ffiecResult.data.msa_md_median_income || 0,
          income_category: getIncomeLevelName(ffiecResult.data.income_level),
          percentage_of_ami: ffiecResult.data.ami_percentage || 0,
          eligibility: isEligible ? 'Eligible' : 'Not Eligible',
          lmi_status: isEligible ? 'LMI Eligible' : 'Not Eligible',
          approval_message: isEligible 
            ? `APPROVED - This location is in a ${getIncomeLevelName(ffiecResult.data.income_level)} Income Census Tract`
            : `NOT APPROVED - This location is in a ${getIncomeLevelName(ffiecResult.data.income_level)} Income Census Tract`,
          data_source: 'FFIEC Census Flat File 2025',
          address: geocodeResult.formattedAddress,
          lat: geocodeResult.coordinates.lat,
          lon: geocodeResult.coordinates.lon
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Fallback if no FFIEC data found
      console.log('⚠️ No FFIEC data found, returning not eligible')
      
      return new Response(
        JSON.stringify({
          success: true,
          status: 'success',
          lmi_eligible: false,
          is_approved: false,
          tract_id: tractId,
          median_income: 0,
          ami: 0,
          income_category: 'Unknown',
          percentage_of_ami: 0,
          eligibility: 'Unknown',
          lmi_status: 'Not Eligible',
          approval_message: 'NOT APPROVED - Census tract data not available',
          data_source: 'FFIEC Census Flat File 2025 (No Data)',
          address: geocodeResult.formattedAddress,
          lat: geocodeResult.coordinates?.lat,
          lon: geocodeResult.coordinates?.lon
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('❌ LMI check error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        status: 'error',
        error: error.message,
        lmi_eligible: false,
        is_approved: false,
        median_income: 0,
        ami: 0,
        income_category: 'Unknown',
        percentage_of_ami: 0,
        eligibility: 'Unknown',
        lmi_status: 'Not Eligible',
        approval_message: `ERROR - ${error.message}`,
        data_source: 'Error',
        message: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Mapbox geocoding function
async function geocodeWithMapbox(address: string) {
  try {
    console.log('🗺️ Using Mapbox geocoding for address:', address)
    
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN')
    
    if (!mapboxToken) {
      throw new Error('MAPBOX_ACCESS_TOKEN environment variable not found')
    }

    const cleanAddress = address.trim().replace(/\s+/g, ' ')
    
    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanAddress)}.json`
    const params = new URLSearchParams({
      access_token: mapboxToken,
      country: 'US',
      limit: '1',
      types: 'address'
    })

    const fullUrl = `${mapboxUrl}?${params.toString()}`
    console.log('🌐 Calling Mapbox geocoding API')

    const response = await fetch(fullUrl)
    console.log('📡 Mapbox response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`Mapbox API returned ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      throw new Error(`No geocoding results found for address: ${cleanAddress}`)
    }

    const feature = data.features[0]
    
    const coordinates = {
      lat: feature.center[1],  // Mapbox returns [lon, lat]
      lon: feature.center[0]
    }

    console.log('📍 Mapbox coordinates:', coordinates)

    return {
      success: true,
      coordinates,
      formattedAddress: feature.place_name
    }

  } catch (error) {
    console.error('❌ Mapbox geocoding failed:', error.message)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

// Census tract lookup
async function getCensusTract(lat: number, lon: number): Promise<string> {
  console.log(`🔍 Looking up census tract for: lat=${lat}, lon=${lon}`)
  
  try {
    // Try Census Bureau API first
    const censusUrl = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lon}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`
    
    const response = await fetch(censusUrl)
    
    if (response.ok) {
      const data = await response.json()
      
      if (data.result?.geographies?.['Census Tracts']?.[0]) {
        const tract = data.result.geographies['Census Tracts'][0]
        const tractId = `${tract.STATE}${tract.COUNTY}${tract.TRACT.replace('.', '')}`
        console.log('✅ Found tract ID from Census Bureau:', tractId)
        return tractId
      }
    }
    
    // Try FCC API as backup
    const fccUrl = `https://geo.fcc.gov/api/census/area?lat=${lat}&lon=${lon}&format=json`
    const fccResponse = await fetch(fccUrl)
    
    if (fccResponse.ok) {
      const fccData = await fccResponse.json()
      
      if (fccData.results?.[0]?.block_fips) {
        const tractId = fccData.results[0].block_fips.substring(0, 11)
        console.log('✅ Found tract ID from FCC:', tractId)
        return tractId
      }
    }
    
    throw new Error('Could not determine census tract')
    
  } catch (error) {
    console.error('❌ Census tract lookup failed:', error.message)
    throw error
  }
}

// FFIEC database lookup
async function checkFFIECDatabase(supabase: any, tractId: string) {
  try {
    console.log('🔍 Querying FFIEC database for tract:', tractId)
    
    const { data, error } = await supabase
      .from('census_tracts')
      .select('*')
      .eq('tract_id', tractId)
      .single()

    if (error) {
      console.log('❌ Database query error:', error.message)
      return { success: false, error: error.message }
    }

    if (!data) {
      console.log('⚠️ No data found for tract:', tractId)
      return { success: false, error: 'Tract not found in FFIEC database' }
    }

    console.log('✅ Found FFIEC data for tract:', tractId)

    return { success: true, data }

  } catch (error) {
    console.error('❌ FFIEC database check failed:', error)
    return { success: false, error: error.message }
  }
}

// Helper function
function getIncomeLevelName(incomeLevel: string): string {
  const levelMap: Record<string, string> = {
    '0': 'No Data',
    '1': 'Low',
    '2': 'Moderate', 
    '3': 'Middle',
    '4': 'Upper'
  }
  return levelMap[incomeLevel] || incomeLevel
}
