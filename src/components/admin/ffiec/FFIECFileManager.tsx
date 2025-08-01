import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FFIECFileUpload } from './FFIECFileUpload';
import { FFIECDataImport } from './FFIECDataImport';
import { RefreshCw, Database, FileText, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FFIECStats {
  totalTracts: number;
  lmiEligibleTracts: number;
  definitionsCount: number;
  lastUpdateDate: string | null;
}

interface ImportJob {
  id: string;
  job_type: string;
  status: string;
  file_name: string;
  records_total: number;
  records_successful: number;
  records_failed: number;
  created_at: string;
  completed_at: string | null;
}

export const FFIECFileManager: React.FC = () => {
  const [stats, setStats] = useState<FFIECStats>({
    totalTracts: 0,
    lmiEligibleTracts: 0,
    definitionsCount: 0,
    lastUpdateDate: null
  });
  const [recentJobs, setRecentJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get census tracts stats
      const { data: tractsData, error: tractsError } = await supabase
        .from('census_tracts')
        .select('tract_id, is_lmi_eligible', { count: 'exact' });
      
      if (tractsError) throw tractsError;

      // Get field definitions count
      const { count: definitionsCount, error: definitionsError } = await supabase
        .from('ffiec_field_definitions')
        .select('*', { count: 'exact', head: true });
      
      if (definitionsError) throw definitionsError;

      // Get last update date
      const { data: lastUpdateData } = await supabase
        .from('census_tracts')
        .select('last_updated')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      const lmiEligibleCount = tractsData?.filter(tract => tract.is_lmi_eligible).length || 0;

      setStats({
        totalTracts: tractsData?.length || 0,
        lmiEligibleTracts: lmiEligibleCount,
        definitionsCount: definitionsCount || 0,
        lastUpdateDate: lastUpdateData?.last_updated || null
      });

    } catch (error: any) {
      console.error('Error fetching FFIEC stats:', error);
      toast.error(`Failed to load statistics: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentJobs = async () => {
    try {
      const { data: jobs, error } = await supabase
        .from('ffiec_import_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentJobs(jobs || []);
    } catch (error: any) {
      console.error('Error fetching recent jobs:', error);
      toast.error(`Failed to load import jobs: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecentJobs();
  }, []);

  const handleUploadComplete = (jobId: string) => {
    fetchStats();
    fetchRecentJobs();
    toast.success('File upload completed successfully!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* FFIEC Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Census Tracts</p>
                <p className="text-3xl font-bold">{stats.totalTracts.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">LMI Eligible Tracts</p>
                <p className="text-3xl font-bold text-green-600">{stats.lmiEligibleTracts.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Field Definitions</p>
                <p className="text-3xl font-bold">{stats.definitionsCount}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">LMI Coverage</p>
                <p className="text-3xl font-bold">
                  {stats.totalTracts > 0 ? Math.round((stats.lmiEligibleTracts / stats.totalTracts) * 100) : 0}%
                </p>
              </div>
              <div className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    fetchStats();
                    fetchRecentJobs();
                  }}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Management */}
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">File Upload</TabsTrigger>
          <TabsTrigger value="import">Data Import</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <FFIECFileUpload onUploadComplete={handleUploadComplete} />
        </TabsContent>

        <TabsContent value="import">
          <FFIECDataImport />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>Recent FFIEC file imports and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No import jobs found</p>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{job.file_name}</h4>
                          <Badge variant={getStatusBadgeVariant(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Type:</span> {job.job_type === 'definitions' ? 'Field Definitions' : 'Census Data'}
                          </div>
                          <div>
                            <span className="font-medium">Total:</span> {job.records_total.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Success:</span> {job.records_successful.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Failed:</span> {job.records_failed.toLocaleString()}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Started: {formatDate(job.created_at)}
                          {job.completed_at && ` • Completed: ${formatDate(job.completed_at)}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {stats.lastUpdateDate && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">
              Last data update: {formatDate(stats.lastUpdateDate)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};