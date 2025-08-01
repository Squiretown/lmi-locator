// Corrected File Upload System - Avoiding Edge Function Limitations
// This approach uses Supabase Storage + client-side processing for large files

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/integrations/supabase/client'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface FFIECFileUploadProps {
  onUploadComplete?: (jobId: string) => void;
}

interface UploadProgress {
  phase: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  message: string
  recordsProcessed?: number
  totalRecords?: number
}

export const FFIECFileUpload: React.FC<FFIECFileUploadProps> = ({ onUploadComplete }) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    phase: 'uploading',
    progress: 0,
    message: 'Ready to upload'
  })

  // Method 1: Direct Storage Upload + Client Processing (Recommended)
  const uploadToStorageAndProcess = async (file: File) => {
    try {
      setUploadProgress({
        phase: 'uploading',
        progress: 10,
        message: 'Uploading file to storage...'
      })

      // Step 1: Upload to Supabase Storage (handles large files)
      const fileName = `ffiec-${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ffiec-uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      setUploadProgress({
        phase: 'processing',
        progress: 30,
        message: 'File uploaded, starting processing...'
      })

      // Step 2: Download and process file client-side
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('ffiec-uploads')
        .download(fileName)

      if (downloadError) throw downloadError

      // Step 3: Process Excel file in browser
      await processExcelFile(fileData)

      // Clean up storage file after processing
      await supabase.storage
        .from('ffiec-uploads')
        .remove([fileName])

    } catch (error: any) {
      setUploadProgress({
        phase: 'error',
        progress: 0,
        message: `Upload failed: ${error.message}`
      })
    }
  }

  // Method 2: Direct Client-Side Processing (No storage needed)
  const processFileDirectly = async (file: File) => {
    try {
      setUploadProgress({
        phase: 'processing',
        progress: 20,
        message: 'Reading Excel file...'
      })

      // Read file directly from user's computer
      const arrayBuffer = await file.arrayBuffer()
      
      setUploadProgress({
        phase: 'processing',
        progress: 40,
        message: 'Parsing Excel data...'
      })

      // Parse Excel file
      const workbook = XLSX.read(arrayBuffer, { 
        type: 'array',
        cellDates: true,
        cellFormula: false
      })

      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: ""
      }) as any[][]

      // Process the data
      await processFFIECData(rawData, file.name)

    } catch (error: any) {
      setUploadProgress({
        phase: 'error',
        progress: 0,
        message: `Processing failed: ${error.message}`
      })
    }
  }

  const processExcelFile = async (fileBlob: Blob, fileName?: string) => {
    const arrayBuffer = await fileBlob.arrayBuffer()
    
    setUploadProgress({
      phase: 'processing',
      progress: 50,
      message: 'Parsing Excel structure...'
    })

    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array',
      cellDates: true 
    })

    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    await processFFIECData(rawData, fileName || 'uploaded-file')
  }

  const processFFIECData = async (rawData: any[][], fileName: string) => {
    try {
      // Find header row
      const headerRowIndex = rawData.findIndex(row => 
        row && row.some(cell => cell && String(cell).toLowerCase().includes('tract'))
      )

      if (headerRowIndex === -1) {
        throw new Error('Could not find header row in Excel file')
      }

      const headers = rawData[headerRowIndex]
      const dataRows = rawData.slice(headerRowIndex + 1)
        .filter(row => row && row.some(cell => cell && String(cell).trim()))

      setUploadProgress({
        phase: 'processing',
        progress: 60,
        message: `Processing ${dataRows.length} records...`,
        totalRecords: dataRows.length
      })

      // Log import start
      const importLogData = {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        import_type: 'ffiec_census_data',
        file_name: fileName,
        file_size: null,
        records_processed: 0,
        records_successful: 0,
        records_failed: 0,
        import_status: 'processing',
        started_at: new Date().toISOString()
      }

      const { data: importLog, error: logError } = await supabase
        .from('data_import_log')
        .insert(importLogData)
        .select()
        .single()

      // Process in batches to avoid overwhelming the database
      const batchSize = 1000
      let processed = 0
      let successful = 0
      let failed = 0

      for (let i = 0; i < dataRows.length; i += batchSize) {
        const batch = dataRows.slice(i, i + batchSize)
        const processedBatch = batch
          .map(row => processFFIECRecord(row, headers))
          .filter(record => record !== null)

        if (processedBatch.length > 0) {
          // Insert batch into database - using correct table name from schema
          const { data: insertData, error } = await supabase
            .from('census_tracts')
            .upsert(processedBatch, { 
              onConflict: 'tract_id',
              ignoreDuplicates: false 
            })

          if (error) {
            console.error('Batch insert error:', error)
            failed += processedBatch.length
          } else {
            successful += processedBatch.length
          }
        }

        processed += batch.length
        
        // Update progress
        setUploadProgress({
          phase: 'processing',
          progress: 60 + (processed / dataRows.length) * 35,
          message: `Processed ${processed}/${dataRows.length} records...`,
          recordsProcessed: processed,
          totalRecords: dataRows.length
        })

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Update import log
      if (importLog && !logError) {
        await supabase
          .from('data_import_log')
          .update({
            records_processed: processed,
            records_successful: successful,
            records_failed: failed,
            import_status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', importLog.id)
      }

      // Complete
      setUploadProgress({
        phase: 'completed',
        progress: 100,
        message: `Successfully imported ${successful} FFIEC records!`,
        recordsProcessed: processed,
        totalRecords: dataRows.length
      })

      toast.success(`Import completed: ${successful} records processed`)
      onUploadComplete?.(importLog?.id || 'unknown')

    } catch (error: any) {
      setUploadProgress({
        phase: 'error',
        progress: 0,
        message: `Data processing failed: ${error.message}`
      })
      toast.error(`Import failed: ${error.message}`)
    }
  }

  const processFFIECRecord = (row: any[], headers: any[]): any | null => {
    try {
      // Map your specific FFIEC file structure
      const getColumnValue = (patterns: string[]) => {
        for (const pattern of patterns) {
          const index = headers.findIndex(h => 
            h && String(h).toLowerCase().includes(pattern.toLowerCase())
          )
          if (index >= 0 && row[index] !== undefined) {
            return String(row[index]).trim()
          }
        }
        return null
      }

      const state = getColumnValue(['state', 'st'])
      const county = getColumnValue(['county', 'cnty'])
      const tract = getColumnValue(['tract', 'census'])
      const incomeLevel = getColumnValue(['income', 'level'])

      if (!state || !county || !tract) {
        return null // Skip invalid records
      }

      // Build tract ID
      const tractId = `${state.padStart(2, '0')}${county.padStart(3, '0')}${tract}`

      return {
        tract_id: tractId,
        state_code: state.padStart(2, '0'),
        county_code: county.padStart(3, '0'),
        tract_code: tract,
        income_level: incomeLevel,
        msa_md_median_income: parseFloat(getColumnValue(['msa', 'median']) || '0') || null,
        tract_median_family_income: parseFloat(getColumnValue(['family', 'income']) || '0') || null,
        ami_percentage: parseFloat(getColumnValue(['percentage', 'pct']) || '0') || null,
        is_lmi_eligible: incomeLevel && ['low', 'moderate'].includes(incomeLevel.toLowerCase()),
        tract_population: parseInt(getColumnValue(['population', 'pop']) || '0') || null,
        minority_population_pct: parseFloat(getColumnValue(['minority']) || '0') || null,
        ffiec_data_year: 2025,
        import_batch_id: crypto.randomUUID(),
        data_vintage: '2025',
        eligibility: incomeLevel?.toLowerCase() === 'low' || incomeLevel?.toLowerCase() === 'moderate' ? 'eligible' : 'not_eligible'
      }

    } catch (error) {
      console.warn('Error processing record:', error)
      return null
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Check file type
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setUploadProgress({
        phase: 'error',
        progress: 0,
        message: 'Please upload an Excel (.xlsx, .xls) or CSV file'
      })
      return
    }

    // Choose processing method based on file size
    if (file.size > 100 * 1024 * 1024) { // > 100MB
      // Use storage upload for very large files
      uploadToStorageAndProcess(file)
    } else {
      // Process directly for smaller files
      processFileDirectly(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false,
    maxSize: 500 * 1024 * 1024 // 500MB limit
  })

  const resetUpload = () => {
    setUploadProgress({
      phase: 'uploading',
      progress: 0,
      message: 'Ready to upload'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'processing':
      case 'uploading':
        return <Upload className="h-5 w-5 text-blue-500 animate-pulse" />
      default:
        return <FileSpreadsheet className="h-5 w-5 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            FFIEC File Upload
          </CardTitle>
          <CardDescription>
            Upload FFIEC Excel files to import census tract data. Files are processed client-side for better performance and reliability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadProgress.progress === 0 ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input {...getInputProps()} />
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <div className="text-lg font-medium">
                  {isDragActive ? 'Drop your FFIEC file here...' : 'Upload FFIEC Data File'}
                </div>
                <div className="text-sm text-gray-500">
                  Supports Excel (.xlsx, .xls) and CSV files up to 500MB
                </div>
                <div className="text-xs text-gray-400">
                  Large files will be processed in the background
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(uploadProgress.phase)}
                <div>
                  <p className="font-medium">{uploadProgress.message}</p>
                  <p className="text-sm text-gray-500">
                    Phase: {uploadProgress.phase} • Progress: {uploadProgress.progress.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Progress Display */}
              {uploadProgress.progress > 0 && (
                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.progress}%` }}
                    />
                  </div>
                  
                  {uploadProgress.recordsProcessed && uploadProgress.totalRecords && (
                    <div className="text-center text-sm text-gray-600">
                      {uploadProgress.recordsProcessed.toLocaleString()} / {uploadProgress.totalRecords.toLocaleString()} records
                    </div>
                  )}
                </div>
              )}

              {/* Success/Error Messages */}
              {uploadProgress.phase === 'completed' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Import Completed Successfully! {uploadProgress.recordsProcessed?.toLocaleString()} FFIEC census tract records have been imported.
                  </AlertDescription>
                </Alert>
              )}

              {uploadProgress.phase === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    ❌ Import Failed: {uploadProgress.message}
                  </AlertDescription>
                </Alert>
              )}

              {uploadProgress.phase !== 'processing' && (
                <Button onClick={resetUpload} variant="outline" className="w-full">
                  Upload Another File
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}