
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { testSupabaseConnection } from '@/lib/supabase/testConnection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCcwIcon } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';
import EdgeFunctionResults from './EdgeFunctionResults';

const ConnectionTester: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [authStatus, setAuthStatus] = useState<'signed-in' | 'signed-out' | 'unknown'>('unknown');
  const [lastTestedAt, setLastTestedAt] = useState<Date | null>(null);
  const [edgeFunctionResponse, setEdgeFunctionResponse] = useState<any>(null);
  const [edgeFunctionStatus, setEdgeFunctionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
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
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Supabase Connection Tester</CardTitle>
        <CardDescription>
          Test connectivity to Supabase APIs and Edge Functions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ConnectionStatus 
          status={status}
          authStatus={authStatus}
          edgeFunctionStatus={edgeFunctionStatus}
          pingTime={pingTime}
          lastTestedAt={lastTestedAt}
        />
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="font-medium">Edge Function Test Results:</h3>
          <EdgeFunctionResults 
            edgeFunctionResponse={edgeFunctionResponse}
            edgeFunctionStatus={edgeFunctionStatus}
            consecutiveErrors={consecutiveErrors}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={testConnection}
          disabled={status === 'testing'}
        >
          Test Database Connection
        </Button>
        <Button 
          variant={edgeFunctionStatus === 'error' ? 'destructive' : 'default'}
          onClick={testEdgeFunction}
          disabled={edgeFunctionStatus === 'testing'}
        >
          {edgeFunctionStatus === 'testing' ? (
            <RefreshCcwIcon className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Test Edge Function
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConnectionTester;
