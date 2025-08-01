// Enhanced FFIEC File Upload with Comprehensive Error Handling
import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/integrations/supabase/client'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Eye, Database, User } from 'lucide-react'
import { toast } from 'sonner'

interface FFIECFileUploadProps {
  onUploadComplete?: (jobId: string) => void;
}

interface UploadProgress {
  phase: 'idle' | 'validating' | 'parsing' | 'processing' | 'uploading' | 'completed' | 'error'
  progress: number
  message: string
  recordsProcessed?: number
  totalRecords?: number
  errorDetails?: string
  filePreview?: any[]
}

interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  headers: string[]
  sampleData: any[]
  totalRows: number
}

export const FFIECFileUpload: React.FC<FFIECFileUploadProps> = ({ onUploadComplete }) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    phase: 'idle',
    progress: 0,
    message: 'Ready to upload FFIEC file'
  })
  
  const [validationResult, setValidationResult] = useState<FileValidationResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Enhanced error logging function
  const logError = (stage: string, error: any, details?: any) => {
    console.error(`[FFIEC Upload - ${stage}]`, error)
    if (details) {
      console.error(`[FFIEC Upload - ${stage} Details]`, details)
    }
    
    // Also log to a custom error tracking if needed
    const errorLog = {
      timestamp: new Date().toISOString(),
      stage,
      error: error.message || String(error),
      details: details ? JSON.stringify(details, null, 2) : null,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    // Store in localStorage for debugging
    const existingLogs = JSON.parse(localStorage.getItem('ffiec_upload_errors') || '[]')
    existingLogs.push(errorLog)
    localStorage.setItem('ffiec_upload_errors', JSON.stringify(existingLogs.slice(-10))) // Keep last 10 errors
  }

  // Environment and permissions check
  const checkSystemStatus = async (): Promise<{ isReady: boolean; issues: string[] }> => {
    const issues: string[] = []
    
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        issues.push('User not authenticated')
      } else {
        console.log('✅ User authenticated:', user.email)
      }
      
      // Check if storage bucket exists and is accessible
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
        const ffiecBucket = buckets?.find(b => b.name === 'ffiec-uploads')
        
        if (!ffiecBucket) {
          issues.push('Storage bucket "ffiec-uploads" not found')
        } else {
          console.log('✅ Storage bucket found')
          
          // Test upload permissions
          try {
            const testFile = new Blob(['test'], { type: 'text/plain' })
            const testFileName = `test-${Date.now()}.txt`
            
            const { error: uploadTestError } = await supabase.storage
              .from('ffiec-uploads')
              .upload(testFileName, testFile)
              
            if (uploadTestError) {
              issues.push(`Storage upload test failed: ${uploadTestError.message}`)
            } else {
              console.log('✅ Storage upload permissions working')
              // Clean up test file
              await supabase.storage.from('ffiec-uploads').remove([testFileName])
            }
          } catch (testError) {
            issues.push(`Storage permission test error: ${testError}`)
          }
        }
      } catch (storageError) {
        issues.push(`Storage check failed: ${storageError}`)
      }
      
      // Check database table access
      try {
        const { data, error: tableError } = await supabase
          .from('census_tracts')
          .select('*')
          .limit(1)
          
        if (tableError) {
          issues.push(`Database table access error: ${tableError.message}`)
        } else {
          console.log('✅ Database table accessible')
        }
      } catch (dbError) {
        issues.push(`Database check failed: ${dbError}`)
      }
      
      // Check import log table
      try {
        const { error: logError } = await supabase
          .from('ffiec_import_jobs')
          .select('id')
          .limit(1)
          
        if (logError) {
          issues.push(`Import log table error: ${logError.message}`)
        } else {
          console.log('✅ Import log table accessible')
        }
      } catch (logTableError) {
        issues.push(`Import log check failed: ${logTableError}`)
      }
      
    } catch (systemError) {
      issues.push(`System check failed: ${systemError}`)
    }
    
    return {
      isReady: issues.length === 0,
      issues
    }
  }

  // Enhanced file validation
  const validateFFIECFile = async (file: File): Promise<FileValidationResult> => {
    const result: FileValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      headers: [],
      sampleData: [],
      totalRows: 0
    }
    
    try {
      console.log('📋 Validating file:', file.name, 'Size:', file.size)
      
      // Check file type
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        result.errors.push('Invalid file type. Please use Excel (.xlsx, .xls) or CSV files.')
        return result
      }
      
      // Check file size (warn if > 50MB, error if > 500MB)
      if (file.size > 500 * 1024 * 1024) {
        result.errors.push('File too large. Maximum size is 500MB.')
        return result
      } else if (file.size > 50 * 1024 * 1024) {
        result.warnings.push('Large file detected. Processing may take longer.')
      }
      
      // Read and parse file
      setUploadProgress({
        phase: 'parsing',
        progress: 20,
        message: 'Reading and parsing file...'
      })
      
      const arrayBuffer = await file.arrayBuffer()
      console.log('📊 File read successfully, parsing...')
      
      let rawData: any[][] = []
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        // Handle CSV files
        const text = new TextDecoder().decode(arrayBuffer)
        const lines = text.split('\n')
        rawData = lines.map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')))
      } else {
        // Handle Excel files
        const workbook = XLSX.read(arrayBuffer, { 
          type: 'array',
          cellDates: true,
          cellFormula: false
        })
        
        if (workbook.SheetNames.length === 0) {
          result.errors.push('No worksheets found in Excel file.')
          return result
        }
        
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        rawData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          defval: ""
        }) as any[][]
      }
      
      if (rawData.length === 0) {
        result.errors.push('File appears to be empty.')
        return result
      }
      
      result.totalRows = rawData.length
      console.log(`📊 Parsed ${result.totalRows} rows`)
      
      // Find header row
      const headerRowIndex = rawData.findIndex(row => 
        row && row.some(cell => 
          cell && String(cell).toLowerCase().match(/(tract|census|state|county|income)/i)
        )
      )
      
      if (headerRowIndex === -1) {
        result.errors.push('Could not find header row. Expected columns like "tract", "census", "state", "county", or "income".')
        return result
      }
      
      result.headers = rawData[headerRowIndex].map(h => String(h || '').trim())
      console.log('📋 Headers found:', result.headers)
      
      // Validate required columns
      const requiredPatterns = ['state', 'county', 'tract']
      const missingColumns = requiredPatterns.filter(pattern => 
        !result.headers.some(header => 
          header.toLowerCase().includes(pattern.toLowerCase())
        )
      )
      
      if (missingColumns.length > 0) {
        result.errors.push(`Missing required columns: ${missingColumns.join(', ')}`)
      }
      
      // Get sample data (first 5 rows after header)
      const dataStartIndex = headerRowIndex + 1
      result.sampleData = rawData
        .slice(dataStartIndex, dataStartIndex + 5)
        .filter(row => row && row.some(cell => cell && String(cell).trim()))
      
      console.log('📋 Sample data:', result.sampleData)
      
      // Additional validations
      if (result.sampleData.length === 0) {
        result.warnings.push('No data rows found after header.')
      }
      
      // Check data quality
      const dataRows = rawData.slice(dataStartIndex).filter(row => 
        row && row.some(cell => cell && String(cell).trim())
      )
      
      if (dataRows.length < 10) {
        result.warnings.push('Very few data rows found. Please verify this is the correct file.')
      }
      
      result.isValid = result.errors.length === 0
      
      if (result.isValid) {
        console.log('✅ File validation passed')
      } else {
        console.log('❌ File validation failed:', result.errors)
      }
      
    } catch (error: any) {
      logError('File Validation', error)
      result.errors.push(`File validation error: ${error.message}`)
    }
    
    return result
  }

  // Process FFIEC record with enhanced error handling
  const processFFIECRecord = (row: any[], headers: string[]): any | null => {
    try {
      const getColumnValue = (patterns: string[]) => {
        for (const pattern of patterns) {
          const index = headers.findIndex(h => 
            h && String(h).toLowerCase().includes(pattern.toLowerCase())
          )
          if (index >= 0 && row[index] !== undefined && row[index] !== null && String(row[index]).trim() !== '') {
            return String(row[index]).trim()
          }
        }
        return null
      }

      // Extract key fields with multiple possible column names
      const state = getColumnValue(['state', 'st', 'state_code'])
      const county = getColumnValue(['county', 'cnty', 'county_code'])
      const tract = getColumnValue(['tract', 'census', 'tract_code'])
      const incomeLevel = getColumnValue(['income', 'level', 'income_level', 'lmi'])

      // Validate required fields
      if (!state || !county || !tract) {
        console.warn('Skipping row - missing required fields:', { state, county, tract })
        return null
      }

      // Clean and format tract ID
      const stateCode = state.padStart(2, '0')
      const countyCode = county.padStart(3, '0')
      const tractCode = tract.padStart(6, '0')
      const tractId = `${stateCode}${countyCode}${tractCode}`

      // Parse numeric fields safely
      const parseNumeric = (value: string | null, defaultValue: number | null = null) => {
        if (!value) return defaultValue
        const parsed = parseFloat(String(value).replace(/[,$%]/g, ''))
        return isNaN(parsed) ? defaultValue : parsed
      }

      const msaMedianIncome = parseNumeric(getColumnValue(['msa', 'median', 'msa_median']), null)
      const tractMedianIncome = parseNumeric(getColumnValue(['family', 'income', 'tract_median']), null)
      const amiPercentage = parseNumeric(getColumnValue(['percentage', 'pct', 'ami_pct']), null)
      const population = parseNumeric(getColumnValue(['population', 'pop']), null)
      const minorityPct = parseNumeric(getColumnValue(['minority', 'minority_pct']), null)

      // Determine eligibility
      const isLmiEligible = incomeLevel && ['low', 'moderate', 'l', 'm'].includes(incomeLevel.toLowerCase())
      const eligibility = isLmiEligible ? 'eligible' : 'not_eligible'

      return {
        tract_id: tractId,
        state_code: stateCode,
        county_code: countyCode,
        tract_code: tractCode,
        income_level: incomeLevel,
        msa_md_median_income: msaMedianIncome,
        tract_median_family_income: tractMedianIncome,
        ami_percentage: amiPercentage,
        is_lmi_eligible: isLmiEligible,
        tract_population: population,
        minority_population_pct: minorityPct,
        ffiec_data_year: new Date().getFullYear(),
        import_batch_id: crypto.randomUUID(),
        data_vintage: String(new Date().getFullYear()),
        eligibility: eligibility,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

    } catch (error) {
      console.warn('Error processing record:', error, 'Row:', row)
      return null
    }
  }

  // Enhanced file processing with better error handling
  const processFile = async (file: File) => {
    try {
      console.log('🚀 Starting file processing:', file.name)
      
      // Step 1: System checks
      setUploadProgress({
        phase: 'validating',
        progress: 5,
        message: 'Checking system status...'
      })
      
      const systemStatus = await checkSystemStatus()
      if (!systemStatus.isReady) {
        throw new Error(`System not ready: ${systemStatus.issues.join(', ')}`)
      }
      
      // Step 2: File validation
      setUploadProgress({
        phase: 'validating',
        progress: 15,
        message: 'Validating file format...'
      })
      
      const validation = await validateFFIECFile(file)
      setValidationResult(validation)
      
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`)
      }
      
      if (validation.warnings.length > 0) {
        console.warn('⚠️ File validation warnings:', validation.warnings)
        validation.warnings.forEach(warning => toast.warning(warning))
      }
      
      // Step 3: Parse file data
      setUploadProgress({
        phase: 'parsing',
        progress: 30,
        message: 'Parsing file data...'
      })
      
      const arrayBuffer = await file.arrayBuffer()
      let rawData: any[][] = []
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        const text = new TextDecoder().decode(arrayBuffer)
        const lines = text.split('\n')
        rawData = lines.map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')))
      } else {
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
      }
      
      // Find header and data rows
      const headerRowIndex = rawData.findIndex(row => 
        row && row.some(cell => String(cell).toLowerCase().match(/(tract|census|state|county)/i))
      )
      
      const headers = rawData[headerRowIndex]
      const dataRows = rawData.slice(headerRowIndex + 1)
        .filter(row => row && row.some(cell => cell && String(cell).trim()))
      
      console.log(`📊 Processing ${dataRows.length} data rows`)
      
      // Step 4: Log import start
      const { data: { user } } = await supabase.auth.getUser()
      const importLogData = {
        job_type: 'census_data',
        status: 'processing',
        file_name: file.name,
        file_size: file.size,
        records_total: dataRows.length,
        records_processed: 0,
        records_successful: 0,
        records_failed: 0,
        created_by: user?.id,
        started_at: new Date().toISOString()
      }
      
      const { data: importLog, error: logError } = await supabase
        .from('ffiec_import_jobs')
        .insert(importLogData)
        .select()
        .single()
      
      if (logError) {
        console.warn('⚠️ Could not create import log:', logError)
      }
      
      // Step 5: Process data in batches
      setUploadProgress({
        phase: 'processing',
        progress: 40,
        message: 'Processing census tract data...',
        totalRecords: dataRows.length
      })
      
      const batchSize = 500 // Reduced batch size for better error handling
      let processed = 0
      let successful = 0
      let failed = 0
      const errors: string[] = []
      
      for (let i = 0; i < dataRows.length; i += batchSize) {
        try {
          const batch = dataRows.slice(i, i + batchSize)
          const processedBatch = batch
            .map(row => processFFIECRecord(row, headers))
            .filter(record => record !== null)
          
          if (processedBatch.length > 0) {
            console.log(`📤 Inserting batch ${Math.floor(i/batchSize) + 1}: ${processedBatch.length} records`)
            
            const { error: insertError } = await supabase
              .from('census_tracts')
              .upsert(processedBatch, { 
                onConflict: 'tract_id',
                ignoreDuplicates: false 
              })
            
            if (insertError) {
              console.error('❌ Batch insert error:', insertError)
              errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${insertError.message}`)
              failed += processedBatch.length
            } else {
              console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} inserted successfully`)
              successful += processedBatch.length
            }
          }
          
          processed += batch.length
          
          // Update progress
          const progress = 40 + (processed / dataRows.length) * 50
          setUploadProgress({
            phase: 'processing',
            progress,
            message: `Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(dataRows.length/batchSize)}...`,
            recordsProcessed: processed,
            totalRecords: dataRows.length
          })
          
          // Small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100))
          
        } catch (batchError: any) {
          console.error('Batch Processing Error:', batchError, { batchIndex: Math.floor(i/batchSize) + 1 })
          errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${batchError?.message || String(batchError)}`)
          failed += batchSize
          processed += batchSize
        }
      }
      
      // Step 6: Update import log
      if (importLog && !logError) {
        await supabase
          .from('ffiec_import_jobs')
          .update({
            records_processed: processed,
            records_successful: successful,
            records_failed: failed,
            status: successful > 0 ? 'completed' : 'failed',
            completed_at: new Date().toISOString(),
            error_details: errors.length > 0 ? errors.join('; ') : null
          })
          .eq('id', importLog.id)
      }
      
      // Step 7: Complete
      if (successful > 0) {
        setUploadProgress({
          phase: 'completed',
          progress: 100,
          message: `Successfully imported ${successful.toLocaleString()} FFIEC records!`,
          recordsProcessed: processed,
          totalRecords: dataRows.length
        })
        
        toast.success(`Import completed: ${successful.toLocaleString()} records processed`)
        onUploadComplete?.(importLog?.id || 'unknown')
        
        if (failed > 0) {
          toast.warning(`${failed} records failed to import. Check the logs for details.`)
        }
      } else {
        throw new Error(`Import failed: No records were successfully imported. Errors: ${errors.join('; ')}`)
      }
      
    } catch (error: any) {
      logError('File Processing', error)
      setUploadProgress({
        phase: 'error',
        progress: 0,
        message: `Processing failed: ${error.message}`,
        errorDetails: error.stack
      })
      toast.error(`Import failed: ${error.message}`)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    processFile(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false,
    maxSize: 500 * 1024 * 1024
  })

  const resetUpload = () => {
    setUploadProgress({
      phase: 'idle',
      progress: 0,
      message: 'Ready to upload FFIEC file'
    })
    setValidationResult(null)
    setShowPreview(false)
  }

  const getStatusIcon = (phase: string) => {
    switch (phase) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'processing':
      case 'uploading':
      case 'parsing':
      case 'validating':
        return <Upload className="h-5 w-5 text-blue-500 animate-pulse" />
      default:
        return <FileSpreadsheet className="h-5 w-5 text-gray-500" />
    }
  }

  const getPhaseMessage = (phase: string) => {
    const messages = {
      idle: 'Ready to upload',
      validating: 'Validating file and system',
      parsing: 'Reading file contents',
      processing: 'Importing to database',
      uploading: 'Uploading file',
      completed: 'Import completed',
      error: 'Import failed'
    }
    return messages[phase] || phase
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Enhanced FFIEC File Upload
          </CardTitle>
          <CardDescription>
            Upload FFIEC Excel or CSV files to import census tract data. 
            Includes comprehensive validation and error handling.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadProgress.phase === 'idle' ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            >
              <input {...getInputProps()} />
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="text-lg font-medium">
                  {isDragActive ? 'Drop your FFIEC file here...' : 'Upload FFIEC Data File'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Supports Excel (.xlsx, .xls) and CSV files up to 500MB
                </div>
                <div className="text-xs text-muted-foreground">
                  System will validate file format and database connectivity first
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status Display */}
              <div className="flex items-center gap-3">
                {getStatusIcon(uploadProgress.phase)}
                <div className="flex-1">
                  <p className="font-medium">{uploadProgress.message}</p>
                  <p className="text-sm text-muted-foreground">
                    Phase: {getPhaseMessage(uploadProgress.phase)} • Progress: {uploadProgress.progress.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {uploadProgress.progress > 0 && (
                <div className="space-y-2">
                  <Progress value={uploadProgress.progress} className="w-full" />
                  
                  {uploadProgress.recordsProcessed && uploadProgress.totalRecords && (
                    <div className="text-center text-sm text-muted-foreground">
                      {uploadProgress.recordsProcessed.toLocaleString()} / {uploadProgress.totalRecords.toLocaleString()} records
                    </div>
                  )}
                </div>
              )}

              {/* File Validation Results */}
              {validationResult && (
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      File Validation Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={validationResult.isValid ? "default" : "destructive"}>
                        {validationResult.isValid ? "Valid" : "Invalid"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {validationResult.totalRows.toLocaleString()} rows, {validationResult.headers.length} columns
                      </span>
                    </div>
                    
                    {validationResult.errors.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium">Validation Errors:</div>
                          <ul className="list-disc list-inside mt-1">
                            {validationResult.errors.map((error, i) => (
                              <li key={i} className="text-sm">{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {validationResult.warnings.length > 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium">Warnings:</div>
                          <ul className="list-disc list-inside mt-1">
                            {validationResult.warnings.map((warning, i) => (
                              <li key={i} className="text-sm">{warning}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {validationResult.sampleData.length > 0 && (
                      <div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowPreview(!showPreview)}
                        >
                          {showPreview ? 'Hide' : 'Show'} Data Preview
                        </Button>
                        
                        {showPreview && (
                          <div className="mt-3 p-3 bg-muted rounded border">
                            <div className="text-sm font-medium mb-2">Headers:</div>
                            <div className="text-xs mb-3 flex flex-wrap gap-1">
                              {validationResult.headers.map((header, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {header || `Column ${i + 1}`}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="text-sm font-medium mb-2">Sample Data (first 5 rows):</div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b">
                                    {validationResult.headers.slice(0, 6).map((header, i) => (
                                      <th key={i} className="text-left p-1 bg-muted">
                                        {header || `Col ${i + 1}`}
                                      </th>
                                    ))}
                                    {validationResult.headers.length > 6 && (
                                      <th className="text-left p-1 bg-muted">...</th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {validationResult.sampleData.map((row, i) => (
                                    <tr key={i} className="border-b">
                                      {row.slice(0, 6).map((cell, j) => (
                                        <td key={j} className="p-1 border-r">
                                          {String(cell || '').substring(0, 20)}
                                          {String(cell || '').length > 20 && '...'}
                                        </td>
                                      ))}
                                      {row.length > 6 && (
                                        <td className="p-1">...</td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Success Message */}
              {uploadProgress.phase === 'completed' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">✅ Import Completed Successfully!</div>
                    <div className="mt-1">
                      {uploadProgress.recordsProcessed?.toLocaleString()} FFIEC census tract records have been processed.
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Details */}
              {uploadProgress.phase === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">❌ Import Failed</div>
                    <div className="mt-1">{uploadProgress.message}</div>
                    {uploadProgress.errorDetails && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">
                          Show Technical Details
                        </summary>
                        <pre className="mt-2 text-xs bg-destructive/5 p-2 rounded overflow-auto max-h-32">
                          {uploadProgress.errorDetails}
                        </pre>
                      </details>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              {['completed', 'error'].includes(uploadProgress.phase) && (
                <div className="flex gap-3">
                  <Button onClick={resetUpload} variant="outline">
                    Upload Another File
                  </Button>
                  
                  {uploadProgress.phase === 'error' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const logs = localStorage.getItem('ffiec_upload_errors')
                        if (logs) {
                          const blob = new Blob([logs], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `ffiec-upload-errors-${Date.now()}.json`
                          a.click()
                          URL.revokeObjectURL(url)
                        }
                      }}
                    >
                      Download Error Log
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* System Status Indicator */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>System Status:</span>
              <Badge variant="outline" className="text-xs">
                Ready for Import
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Expected File Format:</span>
              <ul className="list-disc list-inside mt-1 text-xs text-muted-foreground">
                <li>Excel (.xlsx, .xls) or CSV files</li>
                <li>Headers containing: state, county, tract</li>
                <li>Optional: income, level, population, etc.</li>
              </ul>
            </div>
            <div>
              <span className="font-medium">System Requirements:</span>
              <ul className="list-disc list-inside mt-1 text-xs text-muted-foreground">
                <li>User must be authenticated</li>
                <li>Storage bucket "ffiec-uploads" must exist</li>
                <li>Database tables must be accessible</li>
              </ul>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <details>
              <summary className="cursor-pointer font-medium">
                Troubleshooting Tips
              </summary>
              <div className="mt-2 space-y-1">
                <div>• Ensure your Excel file has a clear header row with column names</div>
                <div>• Check that required columns (state, county, tract) are present</div>
                <div>• Verify file is not corrupted and opens correctly in Excel</div>
                <div>• Try with a smaller file first to test the system</div>
                <div>• Check browser console for detailed error messages</div>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}