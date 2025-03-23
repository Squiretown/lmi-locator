
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { testSupabaseConnection } from '@/lib/supabase/testConnection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertTriangleIcon, CheckCircle2Icon, XCircleIcon, RefreshCcwIcon } from 'lucide-react';

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
  
  const getTroubleshootingTips = () => {
    if (edgeFunctionStatus !== 'error') return null;
    
    return (
      <div className="mt-4 p-3 bg-muted rounded-md text-sm">
        <h4 className="font-semibold mb-2">Troubleshooting Tips:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Verify the edge function is deployed in your Supabase project</li>
          <li>Check the Supabase Edge Function Logs for errors</li>
          <li>Ensure your Supabase URL and API key are correct</li>
          <li>Try redeploying the function: <code>supabase functions deploy lmi-check</code></li>
          <li>Check that CORS is properly configured in the edge function</li>
          <li>If this is in an iframe, ensure the parent domain is allowed in CORS</li>
          {consecutiveErrors > 2 && (
            <li className="text-destructive font-semibold">
              After multiple failed attempts, you may need to check your Supabase project's region 
              and make sure there are no service disruptions
            </li>
          )}
        </ul>
      </div>
    );
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
        <div className="flex items-center justify-between">
          <span className="font-medium">Connection Status:</span>
          <Badge variant={
            status === 'idle' ? 'outline' : 
            status === 'testing' ? 'secondary' :
            status === 'success' ? 'default' : 'destructive'
          }>
            {status === 'idle' ? 'Not Tested' : 
             status === 'testing' ? 'Testing...' :
             status === 'success' ? 'Connected' : 'Failed'}
          </Badge>
        </div>
        
        {pingTime !== null && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Response Time:</span>
            <span>{pingTime}ms</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="font-medium">Auth Status:</span>
          <Badge variant={
            authStatus === 'unknown' ? 'outline' :
            authStatus === 'signed-in' ? 'default' : 'secondary'
          }>
            {authStatus === 'unknown' ? 'Unknown' :
             authStatus === 'signed-in' ? 'Signed In' : 'Signed Out'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-medium">Edge Function Status:</span>
          <Badge variant={
            edgeFunctionStatus === 'idle' ? 'outline' : 
            edgeFunctionStatus === 'testing' ? 'secondary' :
            edgeFunctionStatus === 'success' ? 'default' : 'destructive'
          }>
            {edgeFunctionStatus === 'idle' ? 'Not Tested' : 
             edgeFunctionStatus === 'testing' ? 'Testing...' :
             edgeFunctionStatus === 'success' ? 'Connected' : 'Failed'}
          </Badge>
        </div>
        
        {lastTestedAt && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Last Tested:</span>
            <span>{lastTestedAt.toLocaleTimeString()}</span>
          </div>
        )}
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="font-medium">Edge Function Test Results:</h3>
          {edgeFunctionResponse ? (
            <>
              {edgeFunctionResponse.error ? (
                <div className="text-red-500 flex items-start gap-2">
                  <AlertTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Error:</p>
                    <p className="text-sm">{edgeFunctionResponse.error}</p>
                    {getTroubleshootingTips()}
                  </div>
                </div>
              ) : (
                <div className="bg-muted p-3 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-medium">
                      Response time: {edgeFunctionResponse.responseTime}ms
                    </p>
                  </div>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(edgeFunctionResponse.data, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No test run yet</p>
          )}
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
