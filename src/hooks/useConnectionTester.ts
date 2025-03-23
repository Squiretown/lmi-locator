
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
      try {
        const { data } = await supabase.auth.getSession();
        setAuthStatus(data?.session ? 'signed-in' : 'signed-out');
      } catch (authError) {
        console.error("Auth check error:", authError);
        setAuthStatus('unknown');
      }
      
    } catch (error) {
      console.error("Connection test error:", error);
      setStatus('error');
      setPingTime(null);
      toast.error("Connection test failed");
    }
  };
  
  const testEdgeFunction = async () => {
    try {
      toast.info("Testing edge function...");
      setEdgeFunctionStatus('testing');
      const start = performance.now();
      
      // Testing with a simple address that should work without special keywords
      // This avoids triggering mock data intentionally
      const { data, error } = await supabase.functions.invoke('lmi-check', {
        body: { 
          address: "1600 Pennsylvania Avenue, Washington, DC 20500"
        },
      });
      
      const elapsed = performance.now() - start;
      
      if (error) {
        setConsecutiveErrors(prev => prev + 1);
        console.error("Edge function test failed:", error);
        toast.error(`Edge function test failed: ${error.message}`);
        setEdgeFunctionResponse({ 
          error: error.message,
          details: error,
          errorObject: error 
        });
        setEdgeFunctionStatus('error');
        return;
      }
      
      if (!data) {
        setConsecutiveErrors(prev => prev + 1);
        console.error("Edge function returned empty response");
        toast.error("Edge function returned empty response");
        setEdgeFunctionResponse({ error: "Empty response from edge function" });
        setEdgeFunctionStatus('error');
        return;
      }
      
      // Check if data contains mock indicator
      if (data.geocoding_service === "Mock Data") {
        toast.warning("Function returned mock data - real services unavailable");
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
