
import { useState } from 'react';
import { testSupabaseConnection } from '@/lib/supabase/testConnection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';
type AuthStatus = 'signed-in' | 'signed-out' | 'unknown';
type EdgeFunctionStatus = 'idle' | 'testing' | 'success' | 'error';

export function useConnectionTester() {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unknown');
  const [lastTestedAt, setLastTestedAt] = useState<Date | null>(null);
  const [edgeFunctionResponse, setEdgeFunctionResponse] = useState<any>(null);
  const [edgeFunctionStatus, setEdgeFunctionStatus] = useState<EdgeFunctionStatus>('idle');
  const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0);
  
  const testConnection = async () => {
    setStatus('testing');
    try {
      const start = performance.now();
      const success = await testSupabaseConnection();
      const elapsed = performance.now() - start;
      
      setPingTime(parseFloat(elapsed.toFixed(2)));
      setStatus(success ? 'success' : 'error');
      setLastTestedAt(new Date());
      
      // Check authentication status
      const { data } = await supabase.auth.getSession();
      setAuthStatus(data.session ? 'signed-in' : 'signed-out');
      
    } catch (error) {
      console.error("Connection test error:", error);
      setStatus('error');
      toast.error("Connection test failed");
    }
  };
  
  const testEdgeFunction = async () => {
    try {
      toast.info("Testing edge function...");
      setEdgeFunctionStatus('testing');
      const start = performance.now();
      
      // Testing with a simple address
      const { data, error } = await supabase.functions.invoke('lmi-check', {
        body: { 
          address: "123 Test Street, Test City, CA 12345"
        },
      });
      
      const elapsed = performance.now() - start;
      
      if (error) {
        setConsecutiveErrors(prev => prev + 1);
        console.error("Edge function test failed:", error);
        toast.error(`Edge function test failed: ${error.message}`);
        setEdgeFunctionResponse({ error: error.message, details: error });
        setEdgeFunctionStatus('error');
        return;
      }
      
      setConsecutiveErrors(0);
      setEdgeFunctionResponse({
        success: true,
        responseTime: parseFloat(elapsed.toFixed(2)),
        data
      });
      
      setEdgeFunctionStatus('success');
      toast.success(`Edge function responded in ${elapsed.toFixed(2)}ms`);
    } catch (error) {
      setConsecutiveErrors(prev => prev + 1);
      console.error("Edge function test error:", error);
      
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(`Edge function test failed: ${errorMessage}`);
      
      setEdgeFunctionResponse({ 
        error: errorMessage,
        errorObject: error 
      });
      setEdgeFunctionStatus('error');
    }
  };

  return {
    status,
    pingTime,
    authStatus,
    lastTestedAt,
    edgeFunctionResponse,
    edgeFunctionStatus,
    consecutiveErrors,
    testConnection,
    testEdgeFunction
  };
}
