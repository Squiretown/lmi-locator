
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { determineCensusTract } from "../lmi-check/census/tract-lookup.ts";
import { geocodeAddress } from "../lmi-check/census/address-geocoder.ts";
import { corsHeaders } from "../lmi-check/cors.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { 
      search_type, 
      search_value, 
      user_id, 
      search_name = 'Untitled Search' 
    } = await req.json();

    // Create a new census tract search record
    const { data: searchRecord, error: searchError } = await supabase
      .from('census_tract_searches')
      .insert({
        user_id,
        search_type,
        search_value,
        search_name,
        status: 'processing'
      })
      .select()
      .single();

    if (searchError) throw searchError;

    // Perform search based on type
    let tractResults: any[] = [];
    switch (search_type) {
      case 'tract_id':
        tractResults = await searchByTractId(supabase, search_value, searchRecord.id);
        break;
      case 'zip_code':
        tractResults = await searchByZipCode(supabase, search_value, searchRecord.id);
        break;
      case 'city':
        tractResults = await searchByCity(supabase, search_value, searchRecord.id);
        break;
      default:
        throw new Error('Invalid search type');
    }

    // Update search record
    await supabase
      .from('census_tract_searches')
      .update({
        status: 'completed',
        result_count: tractResults.length
      })
      .eq('id', searchRecord.id);

    return new Response(JSON.stringify({
      searchId: searchRecord.id,
      results: tractResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('LMI Tract Search Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to search by tract ID
async function searchByTractId(supabase: any, tractId: string, searchId: string) {
  // Implement tract ID search logic
  // This would query properties within the specified tract
  const { data, error } = await supabase
    .from('properties')
    .select('address, city, state, zip_code')
    .eq('census_tract', tractId)
    .eq('property_type', 'residential');

  if (error) throw error;

  // Store properties in tract_properties
  const propertyInserts = data.map(prop => ({
    tract_result_id: await createTractResult(supabase, searchId, tractId),
    address: prop.address,
    city: prop.city,
    state: prop.state,
    zip_code: prop.zip_code
  }));

  if (propertyInserts.length > 0) {
    await supabase.from('tract_properties').insert(propertyInserts);
  }

  return data;
}

// Similar helper functions for searchByZipCode and searchByCity
async function searchByZipCode(supabase: any, zipCode: string, searchId: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('address, city, state, zip_code, census_tract')
    .eq('zip_code', zipCode)
    .eq('property_type', 'residential');

  if (error) throw error;

  // Group by unique census tracts
  const uniqueTracts = [...new Set(data.map(prop => prop.census_tract))];

  // For each tract, store properties
  for (const tractId of uniqueTracts) {
    const tractProperties = data.filter(prop => prop.census_tract === tractId);
    const propertyInserts = tractProperties.map(prop => ({
      tract_result_id: await createTractResult(supabase, searchId, tractId),
      address: prop.address,
      city: prop.city,
      state: prop.state,
      zip_code: prop.zip_code
    }));

    if (propertyInserts.length > 0) {
      await supabase.from('tract_properties').insert(propertyInserts);
    }
  }

  return data;
}

async function searchByCity(supabase: any, city: string, searchId: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('address, city, state, zip_code, census_tract')
    .eq('city', city)
    .eq('property_type', 'residential');

  if (error) throw error;

  // Group by unique census tracts
  const uniqueTracts = [...new Set(data.map(prop => prop.census_tract))];

  // For each tract, store properties
  for (const tractId of uniqueTracts) {
    const tractProperties = data.filter(prop => prop.census_tract === tractId);
    const propertyInserts = tractProperties.map(prop => ({
      tract_result_id: await createTractResult(supabase, searchId, tractId),
      address: prop.address,
      city: prop.city,
      state: prop.state,
      zip_code: prop.zip_code
    }));

    if (propertyInserts.length > 0) {
      await supabase.from('tract_properties').insert(propertyInserts);
    }
  }

  return data;
}

// Helper to create tract result record
async function createTractResult(supabase: any, searchId: string, tractId: string) {
  const { data, error } = await supabase
    .from('census_tract_results')
    .insert({
      search_id: searchId,
      tract_id: tractId
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}
