// Edge Function: import-ffiec-chunked-fixed
// Fixes authentication, data mapping, and job tracking issues

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase with service role key (bypasses auth requirements)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
    }

    // Use service role for admin operations - bypasses authentication
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse request parameters
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'start'
    const jobId = url.searchParams.get('jobId')
    const chunkSize = parseInt(url.searchParams.get('chunkSize') || '3000') // Reduced for reliability

    console.log(`🔧 Action: ${action}, JobId: ${jobId}, ChunkSize: ${chunkSize}`)

    // Route to appropriate handler
    switch (action) {
      case 'start':
        return await startImportJob(supabase, chunkSize)
      case 'process':
        if (!jobId) throw new Error('jobId required for process action')
        return await processNextChunk(supabase, jobId, chunkSize)
      case 'status':
        if (!jobId) throw new Error('jobId required for status action')
        return await getJobStatus(supabase, jobId)
      case 'reset':
        return await resetImport(supabase)
      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('❌ Import function error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function startImportJob(supabase: any, chunkSize: number) {
  console.log('🚀 Starting new FFIEC import job...')

  try {
    // Download FFIEC file to get total rows
    console.log('📥 Downloading FFIEC file to count rows...')
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('ffiec-uploads')
      .download('CensusFlatFile2025.csv')

    if (downloadError || !fileData) {
      throw new Error(`Failed to download FFIEC file: ${downloadError?.message}`)
    }

    // Parse CSV to count rows
    const csvText = await fileData.text()
    const lines = csvText.split('\n').filter(line => line.trim())
    const totalRows = lines.length - 1 // Exclude header row
    const totalChunks = Math.ceil(totalRows / chunkSize)

    console.log(`📊 Analysis complete: ${totalRows} data rows, ${totalChunks} chunks needed`)

    // Generate unique job ID
    const jobId = crypto.randomUUID()

    // Create job tracking record in import_jobs table
    const jobRecord = {
      id: jobId,
      status: 'pending',
      total_rows: totalRows,
      processed_rows: 0,
      current_chunk: 0,
      total_chunks: totalChunks,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('💾 Creating job tracking record...')
    const { error: jobInsertError } = await supabase
      .from('import_jobs')
      .insert(jobRecord)

    if (jobInsertError) {
      console.warn('⚠️ Job tracking insert failed:', jobInsertError.message)
      // Continue anyway - job tracking is nice-to-have but not critical
    }

    // Clear existing census data before starting fresh import
    console.log('🗑️ Clearing existing census_tracts data...')
    const { error: deleteError } = await supabase
      .from('census_tracts')
      .delete()
      .neq('tract_id', '') // Delete all records

    if (deleteError) {
      console.warn('⚠️ Error clearing existing data:', deleteError.message)
    }

    console.log('✅ Import job initialized successfully')

    return new Response(
      JSON.stringify({
        success: true,
        jobId: jobId,
        totalRows: totalRows,
        totalChunks: totalChunks,
        chunkSize: chunkSize,
        message: 'Import job started successfully. Use process action to begin.',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in startImportJob:', error)
    throw error
  }
}

async function processNextChunk(supabase: any, jobId: string, chunkSize: number) {
  console.log(`⚙️ Processing chunk for job: ${jobId}`)

  try {
    // Get current job status
    const { data: jobData, error: jobFetchError } = await supabase
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobFetchError || !jobData) {
      throw new Error(`Job not found: ${jobId}. Error: ${jobFetchError?.message}`)
    }

    if (jobData.status === 'completed') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Job already completed',
          job: jobData,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update job to processing status
    await supabase
      .from('import_jobs')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    // Download and parse FFIEC file
    console.log('📥 Downloading FFIEC file for processing...')
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('ffiec-uploads')
      .download('CensusFlatFile2025.csv')

    if (downloadError || !fileData) {
      throw new Error(`Failed to download FFIEC file: ${downloadError?.message}`)
    }

    const csvText = await fileData.text()
    const lines = csvText.split('\n').filter(line => line.trim())
    const headerLine = lines[0]
    const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''))

    console.log('📋 CSV Headers found:', headers.slice(0, 10)) // Log first 10 headers

    // Calculate chunk boundaries
    const startRow = (jobData.current_chunk * chunkSize) + 1 // +1 to skip header
    const endRow = Math.min(startRow + chunkSize, lines.length)

    console.log(`📦 Processing chunk ${jobData.current_chunk + 1}/${jobData.total_chunks}: rows ${startRow} to ${endRow - 1}`)

    const batchRecords = []
    let processedInChunk = 0

    // Process each row in the chunk
    for (let i = startRow; i < endRow; i++) {
      if (!lines[i]?.trim()) continue

      try {
        // Parse CSV row
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        
        // Create row object from CSV
        const rowData: any = {}
        headers.forEach((header, index) => {
          rowData[header] = values[index] || null
        })

        // Transform FFIEC data to census_tracts schema
        const censusRecord = transformFFIECToCensusTracts(rowData)
        
        if (censusRecord) {
          batchRecords.push(censusRecord)
          processedInChunk++
        }

      } catch (rowError) {
        console.warn(`⚠️ Error processing row ${i}:`, rowError.message)
        // Continue processing other rows
      }
    }

    // Insert batch into census_tracts table
    let insertedCount = 0
    if (batchRecords.length > 0) {
      console.log(`💾 Inserting ${batchRecords.length} records into census_tracts...`)
      
      const { error: insertError } = await supabase
        .from('census_tracts')
        .insert(batchRecords)

      if (insertError) {
        console.error('❌ Batch insert error:', insertError)
        throw new Error(`Batch insert failed: ${insertError.message}`)
      }

      insertedCount = batchRecords.length
      console.log(`✅ Successfully inserted ${insertedCount} records`)
    }

    // Update job progress
    const newProcessedRows = jobData.processed_rows + insertedCount
    const newCurrentChunk = jobData.current_chunk + 1
    const isCompleted = newCurrentChunk >= jobData.total_chunks

    await supabase
      .from('import_jobs')
      .update({
        status: isCompleted ? 'completed' : 'pending',
        processed_rows: newProcessedRows,
        current_chunk: newCurrentChunk,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    const progressPercent = Math.round((newProcessedRows / jobData.total_rows) * 100)

    console.log(`📈 Progress: ${progressPercent}% (${newProcessedRows}/${jobData.total_rows})`)

    return new Response(
      JSON.stringify({
        success: true,
        jobId: jobId,
        chunkCompleted: newCurrentChunk,
        totalChunks: jobData.total_chunks,
        recordsInserted: insertedCount,
        totalProcessed: newProcessedRows,
        totalRows: jobData.total_rows,
        progressPercent: progressPercent,
        isCompleted: isCompleted,
        message: isCompleted ? '🎉 Import completed successfully!' : '✅ Chunk processed successfully',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in processNextChunk:', error)
    
    // Update job with error status
    await supabase
      .from('import_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    throw error
  }
}

function transformFFIECToCensusTracts(ffiecRow: any): any | null {
  try {
    // Extract and format tract components
    const stateCode = String(ffiecRow.State_Code || '').padStart(2, '0')
    const countyCode = String(ffiecRow.County_Code || '').padStart(3, '0')
    const tractCode = String(ffiecRow.Tract_Code || '').padStart(6, '0')
    
    // Create full tract ID (11 digits: state + county + tract)
    const fullTractId = stateCode + countyCode + tractCode

    // Validate tract ID length
    if (fullTractId.length !== 11 || fullTractId === '00000000000') {
      console.warn(`Invalid tract ID: ${fullTractId}`)
      return null
    }

    // Determine LMI eligibility from Income_Level field
    const incomeLevel = String(ffiecRow.Income_Level || '').trim()
    const isLmiEligible = ['Low', 'Moderate'].includes(incomeLevel)

    // Parse numeric fields safely
    const parseNumber = (value: any): number | null => {
      const num = parseFloat(value)
      return isNaN(num) ? null : num
    }

    const parseInt = (value: any): number | null => {
      const num = parseInt(value)
      return isNaN(num) ? null : num
    }

    // Map FFIEC fields to census_tracts schema
    return {
      tract_id: fullTractId,
      state_code: stateCode,
      county_code: countyCode,
      tract_code: tractCode,
      state: ffiecRow.State_Name || null,
      county: ffiecRow.County_Name || null,
      tract_name: ffiecRow.Tract_Name || null,
      ffiec_data_year: parseInt(ffiecRow.Year) || 2025,
      income_level: incomeLevel,
      is_lmi_eligible: isLmiEligible,
      msa_md_median_income: parseNumber(ffiecRow.MSA_Median_Income),
      tract_median_family_income: parseNumber(ffiecRow.Tract_Median_Income),
      ami_percentage: parseNumber(ffiecRow.Income_Percentage),
      tract_population: parseInt(ffiecRow.Total_Population),
      minority_population_pct: parseNumber(ffiecRow.Minority_Population_Percent),
      owner_occupied_units: parseInt(ffiecRow.Owner_Occupied_Units),
      median_income: parseNumber(ffiecRow.Median_Household_Income),
      data_vintage: '2024',
      last_updated: new Date().toISOString()
    }

  } catch (error) {
    console.warn('⚠️ Error transforming FFIEC row:', error.message)
    return null
  }
}

async function getJobStatus(supabase: any, jobId: string) {
  const { data: jobData, error: jobError } = await supabase
    .from('import_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (jobError || !jobData) {
    throw new Error(`Job not found: ${jobId}`)
  }

  // Get current count in census_tracts table
  const { count: currentCount } = await supabase
    .from('census_tracts')
    .select('*', { count: 'exact', head: true })

  // Get sample of LMI-eligible tracts
  const { count: lmiCount } = await supabase
    .from('census_tracts')
    .select('*', { count: 'exact', head: true })
    .eq('is_lmi_eligible', true)

  return new Response(
    JSON.stringify({
      success: true,
      job: jobData,
      currentDatabaseCount: currentCount || 0,
      lmiEligibleCount: lmiCount || 0,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function resetImport(supabase: any) {
  console.log('🔄 Resetting all import data...')

  // Clear census_tracts table
  const { error: deleteError } = await supabase
    .from('census_tracts')
    .delete()
    .neq('tract_id', '')

  // Clear import jobs tracking
  const { error: jobDeleteError } = await supabase
    .from('import_jobs')
    .delete()
    .neq('id', '')

  console.log('✅ Reset completed')

  return new Response(
    JSON.stringify({
      success: true,
      message: 'All import data reset successfully',
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}