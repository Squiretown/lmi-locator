// File: supabase/functions/census-geometry/index.ts
// COMPLETE FIXED VERSION - Replace your entire file with this

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CensusTractGeometry {
  type: string;
  coordinates: number[][][];
}

interface TigerFeature {
  type: string;
  properties: {
    GEOID: string;
    NAME: string;
  };
  geometry: CensusTractGeometry;
}

interface TigerResponse {
  type: string;
  features: TigerFeature[];
}

// State abbreviation to FIPS code mapping
const STATE_TO_FIPS: Record<string, string> = {
  'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06', 'CO': '08', 'CT': '09', 'DE': '10',
  'FL': '12', 'GA': '13', 'HI': '15', 'ID': '16', 'IL': '17', 'IN': '18', 'IA': '19', 'KS': '20',
  'KY': '21', 'LA': '22', 'ME': '23', 'MD': '24', 'MA': '25', 'MI': '26', 'MN': '27', 'MS': '28',
  'MO': '29', 'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33', 'NJ': '34', 'NM': '35', 'NY': '36',
  'NC': '37', 'ND': '38', 'OH': '39', 'OK': '40', 'OR': '41', 'PA': '42', 'RI': '44', 'SC': '45',
  'SD': '46', 'TN': '47', 'TX': '48', 'UT': '49', 'VT': '50', 'VA': '51', 'WA': '53', 'WV': '54',
  'WI': '55', 'WY': '56', 'DC': '11', 'PR': '72'
};

/**
 * Normalize geometry to MultiPolygon format for database storage
 * Census APIs return Polygon for single-part tracts, but DB expects MultiPolygon
 */
function normalizeToMultiPolygon(geometry: any): any {
  if (!geometry) return null;
  
  if (geometry.type === 'Polygon') {
    // Convert Polygon to MultiPolygon by wrapping coordinates in array
    return {
      type: 'MultiPolygon',
      coordinates: [geometry.coordinates]
    };
  } else if (geometry.type === 'MultiPolygon') {
    // Already MultiPolygon, return as-is
    return geometry;
  } else {
    console.warn(`⚠️ Unexpected geometry type: ${geometry.type}`);
    return geometry;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { action, tractId, state, county, batchSize = 25 } = await req.json();

    console.log('📥 Request:', { action, tractId, state, county, batchSize });

    if (action === 'updateGeometry') {
      if (tractId) {
        // Update single tract geometry
        const geometry = await fetchTractGeometry(tractId);
        if (geometry) {
          const { error } = await supabase
            .from('census_tracts')
            .update({ geometry })
            .eq('tract_id', tractId);

          if (error) throw error;
          
          return new Response(
            JSON.stringify({ success: true, tractId, updated: 1, processed: 1, hasMore: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ success: false, tractId, updated: 0, processed: 1, hasMore: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else if (state) {
        // Batch update tracts for a state
        return await updateStateGeometry(supabase, state, county, batchSize);
      }
    } else if (action === 'getProgress') {
      // Check progress of geometry updates - simple count queries
      const { data: totalTracts, count: totalCount } = await supabase
        .from('census_tracts')
        .select('*', { count: 'exact', head: true });

      const { data: withGeometry, count: geometryCount } = await supabase
        .from('census_tracts')
        .select('*', { count: 'exact', head: true })
        .not('geometry', 'is', null);

      const progress = {
        total: totalCount || 0,
        with_geometry: geometryCount || 0,
        percentage: totalCount ? Math.round(((geometryCount || 0) / totalCount) * 100) : 0
      };

      return new Response(
        JSON.stringify({ progress }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function fetchTractGeometry(tractId: string): Promise<any> {
  try {
    console.log(`🔍 Fetching geometry for tract: ${tractId}`);

    // Try Census Bureau TIGER/Line Web Map Service
    const apiUrl = `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/8/query`;
    const params = new URLSearchParams({
      where: `GEOID='${tractId}'`,
      outFields: '*',
      outSR: '4326',
      f: 'geojson'
    });

    const response = await fetch(`${apiUrl}?${params}`);
    
    if (!response.ok) {
      console.log(`⚠️ Primary API failed for ${tractId}, trying alternative`);
      return await fetchTractGeometryAlternative(tractId);
    }

    const data: TigerResponse = await response.json();
    
    if (data.features && data.features.length > 0) {
      console.log(`✅ Found geometry for ${tractId}`);
      const geometry = data.features[0].geometry;
      // Normalize to MultiPolygon if needed
      return normalizeToMultiPolygon(geometry);
    }

    console.log(`⚠️ No geometry found for tract ${tractId}, trying alternative`);
    return await fetchTractGeometryAlternative(tractId);
  } catch (error) {
    console.error(`❌ Error fetching geometry for tract ${tractId}:`, error);
    return null;
  }
}

async function fetchTractGeometryAlternative(tractId: string): Promise<any> {
  try {
    // Alternative Census API
    const apiUrl = `https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Census_Tract_Boundaries_Current/FeatureServer/0/query`;
    const params = new URLSearchParams({
      where: `GEOID='${tractId}'`,
      outFields: '*',
      outSR: '4326',
      f: 'geojson'
    });

    const response = await fetch(`${apiUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: TigerResponse = await response.json();
    
    if (data.features && data.features.length > 0) {
      console.log(`✅ Found geometry from alternative API for ${tractId}`);
      const geometry = data.features[0].geometry;
      // Normalize to MultiPolygon if needed
      return normalizeToMultiPolygon(geometry);
    }

    return null;
  } catch (error) {
    console.error(`❌ Error with alternative API for tract ${tractId}:`, error);
    return null;
  }
}

async function updateStateGeometry(
  supabase: any, 
  state: string, 
  county?: string, 
  batchSize: number = 25
) {
  try {
    console.log(`🔄 Starting batch update for state: ${state}${county ? `, county: ${county}` : ''}`);
    
    // Convert state abbreviation to FIPS code if needed
    const stateFips = STATE_TO_FIPS[state.toUpperCase()] || state.padStart(2, '0');
    const countyFips = county?.padStart(3, '0') || '';
    
    console.log(`📍 Using FIPS codes: state=${stateFips}, county=${countyFips || 'all'}`);

    // Build query that works with both populated and NULL state/county columns
    let query = supabase
      .from('census_tracts')
      .select('tract_id, state_code, county_code')
      .is('geometry', null)
      .limit(batchSize);

    if (county) {
      // Pattern for specific county: e.g., '36103%' for NY Suffolk
      const tractPattern = `${stateFips}${countyFips}%`;
      console.log(`🔍 Searching for tracts matching pattern: ${tractPattern}`);
      
      // Use tract_id pattern matching (works even if state/county columns are NULL)
      query = query.like('tract_id', tractPattern);
    } else {
      // Pattern for entire state: e.g., '36%' for all NY
      const tractPattern = `${stateFips}%`;
      console.log(`🔍 Searching for tracts matching pattern: ${tractPattern}`);
      
      query = query.like('tract_id', tractPattern);
    }

    const { data: tracts, error: queryError } = await query;

    if (queryError) {
      console.error('❌ Query error:', queryError);
      throw queryError;
    }

    console.log(`📊 Found ${tracts?.length || 0} tracts without geometry`);

    if (!tracts || tracts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: 0, 
          updated: 0, 
          failed: 0, 
          hasMore: false,
          message: 'No tracts found without geometry'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let updated = 0;
    let failed = 0;

    for (const tract of tracts) {
      try {
        console.log(`📍 Processing tract ${tract.tract_id}...`);
        const geometry = await fetchTractGeometry(tract.tract_id);
        
        if (geometry) {
          const { error: updateError } = await supabase
            .from('census_tracts')
            .update({ geometry })
            .eq('tract_id', tract.tract_id);

          if (updateError) {
            console.error(`❌ Update error for ${tract.tract_id}:`, updateError);
            failed++;
          } else {
            console.log(`✅ Updated ${tract.tract_id}`);
            updated++;
          }
        } else {
          console.warn(`⚠️ No geometry available for ${tract.tract_id}`);
          failed++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error processing ${tract.tract_id}:`, error);
        failed++;
      }
    }

    // Check if there are more tracts to process
    const { count: remainingCount } = await query.select('*', { count: 'exact', head: true });
    const hasMore = (remainingCount || 0) > 0;

    console.log(`✅ Batch complete: ${updated} updated, ${failed} failed, hasMore: ${hasMore}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        state, 
        county,
        processed: tracts.length,
        updated, 
        failed,
        hasMore,
        stateFips,
        countyFips: countyFips || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in batch update:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        processed: 0,
        updated: 0,
        failed: 0,
        hasMore: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}