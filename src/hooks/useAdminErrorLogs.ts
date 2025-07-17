import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminErrorLog {
  id: string;
  admin_user_id: string;
  error_type: string;
  error_message: string;
  error_details: any;
  operation: string;
  target_user_id?: string;
  ip_address?: string;
  user_agent?: string;
  resolved: boolean;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export const useAdminErrorLogs = () => {
  const [logs, setLogs] = useState<AdminErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('admin_error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching admin error logs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch error logs';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveError = async (logId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { error: updateError } = await supabase
        .from('admin_error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: session.user.id
        })
        .eq('id', logId);

      if (updateError) {
        throw updateError;
      }

      toast.success('Error marked as resolved');
      await fetchLogs();
    } catch (err) {
      console.error('Error resolving log:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve error';
      toast.error(errorMessage);
    }
  };

  const unresolveError = async (logId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('admin_error_logs')
        .update({
          resolved: false,
          resolved_at: null,
          resolved_by: null
        })
        .eq('id', logId);

      if (updateError) {
        throw updateError;
      }

      toast.success('Error marked as unresolved');
      await fetchLogs();
    } catch (err) {
      console.error('Error unresolving log:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to unresolve error';
      toast.error(errorMessage);
    }
  };

  const clearResolvedLogs = async () => {
    try {
      const { error: deleteError } = await supabase
        .from('admin_error_logs')
        .delete()
        .eq('resolved', true);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('Resolved error logs cleared');
      await fetchLogs();
    } catch (err) {
      console.error('Error clearing resolved logs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear resolved logs';
      toast.error(errorMessage);
    }
  };

  const resolveBulkErrors = async (logIds: string[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { error: updateError } = await supabase
        .from('admin_error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: session.user.id
        })
        .in('id', logIds);

      if (updateError) {
        throw updateError;
      }

      toast.success(`${logIds.length} errors marked as resolved`);
      await fetchLogs();
    } catch (err) {
      console.error('Error resolving bulk logs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve errors';
      toast.error(errorMessage);
    }
  };

  const retryFailedOperation = async (log: AdminErrorLog) => {
    try {
      if (log.operation === 'delete_user' && log.target_user_id) {
        // Retry user deletion
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session');
        }

        const { data, error } = await supabase.functions.invoke('delete-user', {
          body: { userId: log.target_user_id },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (error || !data?.success) {
          throw new Error(data?.error || 'Retry failed');
        }

        toast.success('User deletion retry successful');
        await resolveError(log.id);
      } else {
        toast.info('Retry not available for this operation type');
      }
    } catch (err) {
      console.error('Error retrying operation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to retry operation';
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    isLoading,
    error,
    fetchLogs,
    resolveError,
    unresolveError,
    clearResolvedLogs,
    resolveBulkErrors,
    retryFailedOperation
  };
};