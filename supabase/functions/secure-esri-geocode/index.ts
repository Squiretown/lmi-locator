import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeocodeRequest {
  address: string;
  maxLocations?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Get ESRI API key from secrets
    const esriApiKey = Deno.env.get('ESRI_API_KEY')
    if (!esriApiKey) {
      throw new Error('ESRI API key not configured')
    }

    // Parse request body
    const { address, maxLocations = 1 }: GeocodeRequest = await req.json()

    if (!address) {
      throw new Error('Address is required')
    }

    // Make secure ESRI API request
    const params = new URLSearchParams({
      address: address,
      outFields: 'Addr_type,StAddr,City,Region,Postal',
      f: 'json',
      token: esriApiKey,
      maxLocations: maxLocations.toString()
    })

    const esriUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?${params.toString()}`
    
    console.log('Making ESRI API request for user:', user.id)
    
    const response = await fetch(esriUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`ESRI API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Log usage for monitoring
    await supabase.from('api_usage').insert({
      api_name: 'esri_geocode',
      status: 'success',
      count: 1,
      response_time: Date.now()
    })

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('ESRI geocoding error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error) || 'Internal server error',
        candidates: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})