import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Play, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportProgress {
  isRunning: boolean;
  progress: number;
  message: string;
  recordsProcessed: number;
  totalRecords: number;
  lmiEligible: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  error?: string;
}

interface ImportStats {
  currentDataYear: number | null;
  totalTracts: number;
  lmiEligibleTracts: number;
  lastImportDate: string | null;
  hasDataFile: boolean;
}

export const FFIECDataImport: React.FC = () => {
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    isRunning: false,
    progress: 0,
    message: 'Ready to import FFIEC data',
    recordsProcessed: 0,
    totalRecords: 0,
    lmiEligible: 0,
    status: 'idle'
  });

  const [stats, setStats] = useState<ImportStats>({
    currentDataYear: null,
    totalTracts: 0,
    lmiEligibleTracts: 0,
    lastImportDate: null,
    hasDataFile: false
  });

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Check if data file exists and get current stats
  const checkDataStatus = async () => {
    try {
      // Check if CSV file exists in storage
      const { data: files, error: storageError } = await supabase.storage
        .from('ffiec-uploads')
        .list('', {
          search: 'CensusFlatFile2025.csv'
        });

      const hasDataFile = !storageError && files && files.length > 0;

      // Get current data stats
      const { data: tractsData, error: tractsError } = await supabase
        .from('census_tracts')
        .select('ffiec_data_year, is_lmi_eligible, last_updated', { count: 'exact' });

      if (tractsError) throw tractsError;

      const totalTracts = tractsData?.length || 0;
      const lmiEligibleTracts = tractsData?.filter(tract => tract.is_lmi_eligible).length || 0;
      const currentDataYear = tractsData && tractsData.length > 0 ? tractsData[0]?.ffiec_data_year : null;
      const lastImportDate = tractsData && tractsData.length > 0 ? tractsData[0]?.last_updated : null;

      setStats({
        currentDataYear,
        totalTracts,
        lmiEligibleTracts,
        lastImportDate,
        hasDataFile
      });

    } catch (error: any) {
      console.error('Error checking data status:', error);
      toast.error(`Failed to check data status: ${error.message}`);
    }
  };

  // Start the chunked import process using new edge function
  const startImport = async () => {
    try {
      setImportProgress({
        isRunning: true,
        progress: 0,
        message: 'Initializing FFIEC import...',
        recordsProcessed: 0,
        totalRecords: 0,
        lmiEligible: 0,
        status: 'running'
      });

      toast.info('Starting FFIEC data import...');

      // Step 1: Start the import job
      console.log('🚀 Starting import job...');
      const startResponse = await fetch(
        `https://llhofjbijjxkfezidxyi.supabase.co/functions/v1/import-ffiec-chunked-fixed?action=start`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaG9mamJpamp4a2ZlemlkeHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MjkzMDIsImV4cCI6MjA1ODAwNTMwMn0.sD475girHZmrVREV0AENbjvlOCeT_ArrPpS3LcOS5VQ`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!startResponse.ok) {
        const errorData = await startResponse.json();
        throw new Error(errorData.error || 'Failed to start import job');
      }

      const startData = await startResponse.json();
      
      if (!startData.success) {
        throw new Error(startData.error || 'Failed to start import job');
      }

      const { jobId, totalRows, totalChunks } = startData;
      
      setImportProgress(prev => ({
        ...prev,
        totalRecords: totalRows,
        message: `Processing ${totalChunks} chunks...`
      }));

      // Step 2: Process chunks sequentially
      for (let i = 0; i < totalChunks; i++) {
        setImportProgress(prev => ({
          ...prev,
          message: `Processing chunk ${i + 1} of ${totalChunks}...`
        }));

        const processResponse = await fetch(
          `https://llhofjbijjxkfezidxyi.supabase.co/functions/v1/import-ffiec-chunked-fixed?action=process&jobId=${jobId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaG9mamJpamp4a2ZlemlkeHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MjkzMDIsImV4cCI6MjA1ODAwNTMwMn0.sD475girHZmrVREV0AENbjvlOCeT_ArrPpS3LcOS5VQ`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!processResponse.ok) {
          const errorData = await processResponse.json();
          throw new Error(errorData.error || `Failed to process chunk ${i + 1}`);
        }

        const chunkData = await processResponse.json();
        
        if (!chunkData.success) {
          throw new Error(chunkData.error || `Failed to process chunk ${i + 1}`);
        }

        // Update progress
        setImportProgress(prev => ({
          ...prev,
          recordsProcessed: chunkData.totalProcessed,
          progress: chunkData.progressPercent,
          message: chunkData.message
        }));

        if (chunkData.isCompleted) {
          setImportProgress(prev => ({
            ...prev,
            isRunning: false,
            status: 'completed',
            message: '🎉 Import completed successfully!'
          }));
          
          await checkDataStatus();
          toast.success(`Import completed! Processed ${chunkData.totalProcessed} records.`);
          return;
        }
      }

    } catch (error: any) {
      console.error('Import error:', error);
      setImportProgress(prev => ({
        ...prev,
        isRunning: false,
        status: 'error',
        error: error.message,
        message: `Import failed: ${error.message}`
      }));
      toast.error(`Import failed: ${error.message}`);
    }
  };

  // Add a reset function for clearing data
  const resetImport = async () => {
    try {
      const response = await fetch(
        `https://llhofjbijjxkfezidxyi.supabase.co/functions/v1/import-ffiec-chunked-fixed?action=reset`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaG9mamJpamp4a2ZlemlkeHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MjkzMDIsImV4cCI6MjA1ODAwNTMwMn0.sD475girHZmrVREV0AENbjvlOCeT_ArrPpS3LcOS5VQ`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset import data');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Import data reset successfully');
        await checkDataStatus();
      }
    } catch (error: any) {
      toast.error(`Reset failed: ${error.message}`);
    }
  };

  useEffect(() => {
    checkDataStatus();
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const getStatusIcon = () => {
    switch (importProgress.status) {
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (importProgress.status) {
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Data Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Current FFIEC Data Status
          </CardTitle>
          <CardDescription>
            Overview of currently imported census tract data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Data Year</p>
              <p className="text-2xl font-bold">
                {stats.currentDataYear || 'No Data'}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Census Tracts</p>
              <p className="text-2xl font-bold">
                {stats.totalTracts.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">LMI Eligible Tracts</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.lmiEligibleTracts.toLocaleString()}
              </p>
            </div>
          </div>
          {stats.lastImportDate && (
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {new Date(stats.lastImportDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Import Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Import FFIEC Data
            {getStatusBadge()}
          </CardTitle>
          <CardDescription>
            Import census tract data from the uploaded FFIEC flat file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!stats.hasDataFile && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No FFIEC data file found. Please upload a CensusFlatFile2025.csv file first using the File Upload tab.
              </AlertDescription>
            </Alert>
          )}

          {importProgress.status === 'error' && importProgress.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {importProgress.error}
              </AlertDescription>
            </Alert>
          )}

          {importProgress.isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{importProgress.message}</span>
                <span>{importProgress.progress}%</span>
              </div>
              <Progress value={importProgress.progress} className="w-full" />
              {importProgress.totalRecords > 0 && (
                <p className="text-sm text-muted-foreground">
                  {importProgress.recordsProcessed.toLocaleString()} of {importProgress.totalRecords.toLocaleString()} records processed
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={startImport}
              disabled={!stats.hasDataFile || importProgress.isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {importProgress.isRunning ? 'Import Running...' : 'Start Annual Import'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={checkDataStatus}
              disabled={importProgress.isRunning}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </Button>

            <Button 
              variant="destructive"
              onClick={resetImport}
              disabled={importProgress.isRunning}
              className="flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Reset Data
            </Button>
          </div>

          {!importProgress.isRunning && importProgress.status !== 'idle' && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Import Status</p>
              <p className="text-sm text-muted-foreground">{importProgress.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Annual Import Process</CardTitle>
          <CardDescription>
            Follow these steps for annual FFIEC data updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Download the latest FFIEC flat file from the official source</li>
            <li>Upload the CensusFlatFile[Year].csv file using the File Upload tab</li>
            <li>Use the "Start Annual Import" button above to process the data</li>
            <li>Monitor the import progress and verify completion</li>
            <li>Review the updated statistics and test system functionality</li>
            <li>Notify users of the data update if necessary</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};