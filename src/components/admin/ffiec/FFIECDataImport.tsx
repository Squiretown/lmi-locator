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

  // Start the import process
  const startImport = async () => {
    try {
      setImportProgress({
        isRunning: true,
        progress: 0,
        message: 'Starting FFIEC data import...',
        recordsProcessed: 0,
        totalRecords: 0,
        lmiEligible: 0,
        status: 'running'
      });

      toast.info('Starting FFIEC data import...');

      const { data, error } = await supabase.functions.invoke('import-ffiec-data', {
        body: {}
      });

      if (error) {
        throw error;
      }

      // Start polling for progress
      startProgressPolling();

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

  // Poll for import progress
  const startProgressPolling = () => {
    const interval = setInterval(async () => {
      try {
        // Check latest import job status
        const { data: latestJob, error } = await supabase
          .from('ffiec_import_jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        if (latestJob && latestJob.status === 'processing') {
          const progress = latestJob.records_total > 0 
            ? Math.round((latestJob.records_processed / latestJob.records_total) * 100)
            : 0;

          setImportProgress(prev => ({
            ...prev,
            progress,
            message: `Processing records... ${latestJob.records_processed}/${latestJob.records_total}`,
            recordsProcessed: latestJob.records_processed,
            totalRecords: latestJob.records_total,
            status: 'running'
          }));
        } else if (latestJob && latestJob.status === 'completed') {
          setImportProgress(prev => ({
            ...prev,
            isRunning: false,
            progress: 100,
            message: `Import completed successfully! Processed ${latestJob.records_successful} records.`,
            recordsProcessed: latestJob.records_successful,
            totalRecords: latestJob.records_total,
            status: 'completed'
          }));

          clearInterval(interval);
          setPollingInterval(null);
          await checkDataStatus();
          toast.success(`Import completed! Processed ${latestJob.records_successful} records.`);
        } else if (latestJob && latestJob.status === 'failed') {
          setImportProgress(prev => ({
            ...prev,
            isRunning: false,
            status: 'error',
            error: 'Import failed',
            message: 'Import failed. Check logs for details.'
          }));

          clearInterval(interval);
          setPollingInterval(null);
          toast.error('Import failed. Check logs for details.');
        }
      } catch (error: any) {
        console.error('Progress polling error:', error);
      }
    }, 2000); // Poll every 2 seconds

    setPollingInterval(interval);
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