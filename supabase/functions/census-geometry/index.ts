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

    const { action, tractId, state, county, batchSize = 50 } = await req.json();

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
            JSON.stringify({ success: true, tractId, updated: 1 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else if (state) {
        // Batch update tracts for a state
        return await updateStateGeometry(supabase, state, county, batchSize);
      }
    } else if (action === 'getProgress') {
      // Check progress of geometry updates
      const { data: progress } = await supabase
        .from('census_tracts')
        .select('state, COUNT(*) as total, COUNT(geometry) as with_geometry', { count: 'exact' })
        .group('state');

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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function fetchTractGeometry(tractId: string): Promise<any> {
  try {
    const state = tractId.substring(0, 2);
    const county = tractId.substring(2, 5);
    const tract = tractId.substring(5);

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
      console.log(`Failed to fetch from primary API for ${tractId}, trying alternative`);
      return await fetchTractGeometryAlternative(tractId);
    }

    const data: TigerResponse = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].geometry;
    }

    console.log(`No geometry found for tract ${tractId}`);
    return null;
  } catch (error) {
    console.error(`Error fetching geometry for tract ${tractId}:`, error);
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
      return data.features[0].geometry;
    }

    return null;
  } catch (error) {
    console.error(`Error with alternative API for tract ${tractId}:`, error);
    return null;
  }
}

async function updateStateGeometry(supabase: any, state: string, county?: string, batchSize: number = 50) {
  try {
    let query = supabase
      .from('census_tracts')
      .select('tract_id, state, county')
      .eq('state', state)
      .is('geometry', null)
      .limit(batchSize);

    if (county) {
      query = query.eq('county', county);
    }

    const { data: tracts, error } = await query;

    if (error) throw error;

    let updated = 0;
    let failed = 0;

    for (const tract of tracts) {
      try {
        const geometry = await fetchTractGeometry(tract.tract_id);
        
        if (geometry) {
          const { error: updateError } = await supabase
            .from('census_tracts')
            .update({ geometry })
            .eq('tract_id', tract.tract_id);

          if (updateError) {
            console.error(`Failed to update ${tract.tract_id}:`, updateError);
            failed++;
          } else {
            updated++;
          }
        } else {
          failed++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing tract ${tract.tract_id}:`, error);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        state, 
        county,
        processed: tracts.length,
        updated, 
        failed,
        hasMore: tracts.length === batchSize
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in batch update:', error);
    throw error;
  }
}