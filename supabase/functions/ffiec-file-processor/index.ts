import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// FFIEC File Processing Edge Function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('FFIEC processor starting, checking auth header...');
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    console.log('Auth header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'null');

    // Use ANON_KEY instead of SERVICE_ROLE_KEY for proper user authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: authHeader ? { Authorization: authHeader } : {}
        } 
      }
    );

    // Get user from JWT
    console.log('Attempting to get user from JWT...');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    console.log('Auth result:', { 
      user: user ? { id: user.id, email: user.email } : null, 
      error: authError?.message,
      userMetadata: user?.user_metadata 
    });
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin by checking user metadata directly
    console.log('Checking admin permissions for user:', user.id);
    
    // Check user metadata for admin role
    const isAdmin = user.user_metadata?.user_type === 'admin';
    console.log('Admin check result:', { isAdmin, userType: user.user_metadata?.user_type });
    
    if (!isAdmin) {
      console.log('User is not admin, denying access');
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Admin check passed, processing request');

    const { action, data } = await req.json();

    switch (action) {
      case 'start_upload':
        return await handleStartUpload(supabaseClient, data, user.id);
      case 'process_batch':
        return await handleProcessBatch(supabaseClient, data);
      case 'get_job_status':
        return await handleGetJobStatus(supabaseClient, data.jobId);
      case 'cancel_job':
        return await handleCancelJob(supabaseClient, data.jobId);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('FFIEC processor error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleStartUpload(supabase: any, data: any, userId: string) {
  const { fileName, fileSize, jobType, totalRecords } = data;

  // Create new import job
  const { data: job, error } = await supabase
    .from('ffiec_import_jobs')
    .insert({
      job_type: jobType,
      status: 'queued',
      file_name: fileName,
      file_size: fileSize,
      records_total: totalRecords || 0,
      created_by: userId,
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create import job: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true, 
    jobId: job.id,
    message: 'Import job created successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleProcessBatch(supabase: any, data: any) {
  const { jobId, records, batchNumber, isLastBatch } = data;

  try {
    // Update job status to processing
    await supabase
      .from('ffiec_import_jobs')
      .update({ status: 'processing' })
      .eq('id', jobId);

    // Process records based on job type
    const { data: job } = await supabase
      .from('ffiec_import_jobs')
      .select('job_type')
      .eq('id', jobId)
      .single();

    let processedCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    if (job?.job_type === 'definitions') {
      // Process FFIEC field definitions
      for (const record of records) {
        try {
          await supabase
            .from('ffiec_field_definitions')
            .upsert({
              field_name: record.field_name,
              field_description: record.field_description,
              data_type: record.data_type,
              valid_values: record.valid_values || null,
              is_required: record.is_required || false
            });
          processedCount++;
        } catch (error) {
          failedCount++;
          errors.push({ record, error: error instanceof Error ? error.message : String(error) });
        }
      }
    } else if (job?.job_type === 'census_data') {
      // Process FFIEC census tract data
      for (const record of records) {
        try {
          const processedRecord = {
            tract_id: record.tract_id,
            state: record.state,
            county: record.county,
            tract_name: record.tract_name,
            income_level: record.income_level,
            msa_md_median_income: parseFloat(record.msa_md_median_income) || null,
            tract_median_family_income: parseFloat(record.tract_median_family_income) || null,
            ami_percentage: parseFloat(record.ami_percentage) || null,
            is_lmi_eligible: ['Low', 'Moderate'].includes(record.income_level),
            tract_population: parseInt(record.tract_population) || null,
            minority_population_pct: parseFloat(record.minority_population_pct) || null,
            owner_occupied_units: parseInt(record.owner_occupied_units) || null,
            ffiec_data_year: 2025,
            centroid_lat: parseFloat(record.centroid_lat) || null,
            centroid_lng: parseFloat(record.centroid_lng) || null
          };

          await supabase
            .from('census_tracts')
            .upsert(processedRecord);
          processedCount++;
        } catch (error) {
          failedCount++;
          errors.push({ record, error: error instanceof Error ? error.message : String(error) });
        }
      }
    }

    // Update job progress
    const { data: currentJob } = await supabase
      .from('ffiec_import_jobs')
      .select('records_processed, records_successful, records_failed')
      .eq('id', jobId)
      .single();

    const updatedProcessed = (currentJob?.records_processed || 0) + processedCount + failedCount;
    const updatedSuccessful = (currentJob?.records_successful || 0) + processedCount;
    const updatedFailed = (currentJob?.records_failed || 0) + failedCount;

    const updateData: any = {
      records_processed: updatedProcessed,
      records_successful: updatedSuccessful,
      records_failed: updatedFailed
    };

    // Calculate progress percentage
    const { data: totalJob } = await supabase
      .from('ffiec_import_jobs')
      .select('records_total')
      .eq('id', jobId)
      .single();

    if (totalJob?.records_total > 0) {
      updateData.progress_percentage = Math.round((updatedProcessed / totalJob.records_total) * 100);
    }

    // If this is the last batch, mark as completed
    if (isLastBatch) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }

    // Store errors in job if any
    if (errors.length > 0) {
      updateData.error_details = errors;
    }

    await supabase
      .from('ffiec_import_jobs')
      .update(updateData)
      .eq('id', jobId);

    return new Response(JSON.stringify({ 
      success: true,
      processed: processedCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Mark job as failed
    await supabase
      .from('ffiec_import_jobs')
      .update({ 
        status: 'failed',
        error_details: { error: error instanceof Error ? error.message : String(error) }
      })
      .eq('id', jobId);

    throw error;
  }
}

async function handleGetJobStatus(supabase: any, jobId: string) {
  const { data: job, error } = await supabase
    .from('ffiec_import_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    throw new Error(`Failed to get job status: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true, 
    job 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleCancelJob(supabase: any, jobId: string) {
  const { error } = await supabase
    .from('ffiec_import_jobs')
    .update({ 
      status: 'cancelled',
      completed_at: new Date().toISOString()
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to cancel job: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Job cancelled successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}