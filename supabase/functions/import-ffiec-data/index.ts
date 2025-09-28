// Supabase Edge Function: import-ffiec-data
// Deploy this as an edge function and call it once to import FFIEC data

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting FFIEC data import process...')

    // Step 1: Download FFIEC file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('ffiec-uploads')
      .download('CensusFlatFile2025.csv')

    if (downloadError || !fileData) {
      throw new Error(`Failed to download FFIEC file: ${downloadError?.message}`)
    }

    console.log('Successfully downloaded FFIEC file')

    // Step 2: Parse CSV
    const csvText = await fileData.text()
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    console.log(`Found ${lines.length - 1} data rows with ${headers.length} columns`)
    console.log('FFIEC file headers:', headers)

    // Key columns we expect to find
    const requiredColumns = ['State_Code', 'County_Code', 'Tract_Code', 'Income_Level']
    const missingColumns = requiredColumns.filter(col => !headers.includes(col))
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
    }

    // Step 3: Clear existing data
    console.log('Clearing existing census_tracts data...')
    const { error: deleteError } = await supabase
      .from('census_tracts')
      .delete()
      .neq('tract_id', '')

    if (deleteError) {
      console.warn('Error clearing existing data:', deleteError.message)
    }

    // Step 4: Process and insert data in batches
    const batchSize = 1000
    let totalProcessed = 0
    let totalInserted = 0
    let errors = []

    for (let i = 1; i < lines.length; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, lines.length)
      
      // Log progress every 10 batches
      if (i % (batchSize * 10) === 1) {
        const progressPercent = Math.round((i / lines.length) * 100)
        console.log(`Import progress: ${progressPercent}% (${i}/${lines.length} rows)`)
      }
      
      console.log(`Processing batch: rows ${i} to ${batchEnd - 1}`)

      const batchRecords = []

      for (let j = i; j < batchEnd; j++) {
        if (!lines[j].trim()) continue // Skip empty lines

        try {
          const values = lines[j].split(',').map(v => v.trim().replace(/"/g, ''))
          
          // Create object from CSV row
          const rowData: any = {}
          headers.forEach((header, index) => {
            rowData[header] = values[index] || null
          })

          // Create tract ID (State + County + Tract)
          const stateCode = String(rowData.State_Code || '').padStart(2, '0')
          const countyCode = String(rowData.County_Code || '').padStart(3, '0')
          const tractCode = String(rowData.Tract_Code || '').padStart(6, '0')
          const fullTractId = stateCode + countyCode + tractCode

          // Validate tract ID length
          if (fullTractId.length !== 11) {
            console.warn(`Invalid tract ID length for row ${j}: ${fullTractId} (length: ${fullTractId.length})`)
            continue
          }

          // Determine LMI eligibility
          const incomeLevel = rowData.Income_Level || ''
          const isLmiEligible = ['Low', 'Moderate'].includes(incomeLevel)

          // Map to census_tracts table structure with improved data validation
          const mappedRecord = {
            tract_id: fullTractId,
            state_code: stateCode,
            county_code: countyCode,
            tract_code: tractCode,
            state: rowData.State_Name || null,
            county: rowData.County_Name || null,
            tract_name: rowData.Tract_Name || null,
            ffiec_data_year: parseInt(rowData.Year) || 2025,
            income_level: incomeLevel,
            is_lmi_eligible: isLmiEligible,
            msa_md_median_income: parseFloat(rowData.MSA_Median_Income) || null,
            tract_median_family_income: parseFloat(rowData.Tract_Median_Income) || null,
            median_income: parseFloat(rowData.Tract_Median_Income) || null,
            ami_percentage: parseFloat(rowData.Income_Percentage) || null,
            tract_population: parseInt(rowData.Total_Population) || null,
            total_households: parseInt(rowData.Total_Households) || null,
            minority_population_pct: parseFloat(rowData.Minority_Population_Pct) || null,
            owner_occupied_units: parseInt(rowData.Owner_Occupied_Units) || null,
            last_updated: new Date().toISOString()
          }

          batchRecords.push(mappedRecord)
          totalProcessed++

        } catch (rowError) {
          console.warn(`Error processing row ${j}:`, rowError instanceof Error ? rowError.message : String(rowError))
          errors.push(`Row ${j}: ${rowError instanceof Error ? rowError.message : String(rowError)}`)
        }
      }

      // Insert batch
      if (batchRecords.length > 0) {
        const { data: insertData, error: insertError } = await supabase
          .from('census_tracts')
          .insert(batchRecords)

        if (insertError) {
          console.error('Batch insert error:', insertError.message)
          errors.push(`Batch ${i}-${batchEnd}: ${insertError.message}`)
        } else {
          totalInserted += batchRecords.length
          console.log(`Batch inserted successfully: ${batchRecords.length} records`)
        }
      }
    }

    // Step 5: Verify import
    const { count: finalCount, error: countError } = await supabase
      .from('census_tracts')
      .select('*', { count: 'exact', head: true })

    const { count: lmiCount, error: lmiCountError } = await supabase
      .from('census_tracts')
      .select('*', { count: 'exact', head: true })
      .eq('is_lmi_eligible', true)

    console.log('Import completed!')
    console.log(`Total records processed: ${totalProcessed}`)
    console.log(`Total records inserted: ${totalInserted}`)
    console.log(`Final count in database: ${finalCount || 'unknown'}`)
    console.log(`LMI eligible tracts: ${lmiCount || 'unknown'}`)

    if (errors.length > 0) {
      console.log(`Errors encountered: ${errors.length}`)
      console.log('First 5 errors:', errors.slice(0, 5))
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'FFIEC data import completed',
        stats: {
          totalProcessed,
          totalInserted,
          finalCount: finalCount || 0,
          lmiCount: lmiCount || 0,
          errorCount: errors.length
        },
        errors: errors.slice(0, 10) // Return first 10 errors for debugging
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Import process failed:', error instanceof Error ? error.message : String(error))
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})