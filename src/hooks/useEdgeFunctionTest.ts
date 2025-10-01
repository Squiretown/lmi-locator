// FILE: src/hooks/useEdgeFunctionTest.ts
import { useState } from 'react';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';
import { toast } from 'sonner';

// ✅ IMPORTANT: Named export
export function useEdgeFunctionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testFunction = async (functionName: string, payload?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Testing edge function: ${functionName}`);
      
      const startTime = performance.now();
      
      // ✅ FIXED: Using invokeEdgeFunction with proper auth header
      const { data, error } = await invokeEdgeFunction(functionName, 
        payload || { action: 'ping', params: {} }
      );
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      if (error) {
        console.error(`Edge function error (${functionName}):`, error);
        setError(error.message);
        setLastResult({
          success: false,
          error: error.message,
          errorObject: error,
          responseTime,
          timestamp: new Date().toISOString()
        });
        toast.error("Function Test Failed", {
          description: `Error: ${error.message}`
        });
        return false;
      }
      
      console.log(`Edge function response (${functionName}):`, data);
      setLastResult({
        success: true,
        data,
        responseTime,
        timestamp: new Date().toISOString()
      });
      
      toast.success("Function Test Successful", {
        description: `Response time: ${responseTime}ms`
      });
      
      return true;
    } catch (err) {
      console.error(`Exception testing edge function (${functionName}):`, err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      setError(errorMessage);
      setLastResult({
        success: false,
        error: errorMessage,
        errorObject: err,
        timestamp: new Date().toISOString()
      });
      
      toast.error("Function Test Failed", {
        description: `Error: ${errorMessage}`
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    testFunction,
    isLoading,
    lastResult,
    error
  };
}