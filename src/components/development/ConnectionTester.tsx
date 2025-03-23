
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { testSupabaseConnection } from '@/lib/supabase/testConnection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ConnectionTester: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [authStatus, setAuthStatus] = useState<'signed-in' | 'signed-out' | 'unknown'>('unknown');
  const [lastTestedAt, setLastTestedAt] = useState<Date | null>(null);
  const [edgeFunctionResponse, setEdgeFunctionResponse] = useState<any>(null);
  
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
      const start = performance.now();
      
      const { data, error } = await supabase.functions.invoke('census-db', {
        body: { 
          action: 'getDashboardStats',
          params: {}
        },
      });
      
      const elapsed = performance.now() - start;
      
      if (error) {
        console.error("Edge function test failed:", error);
        toast.error("Edge function test failed");
        setEdgeFunctionResponse({ error: error.message });
        return;
      }
      
      setEdgeFunctionResponse({
        success: true,
        responseTime: parseFloat(elapsed.toFixed(2)),
        data
      });
      
      toast.success(`Edge function responded in ${elapsed.toFixed(2)}ms`);
    } catch (error) {
      console.error("Edge function test error:", error);
      toast.error("Edge function test failed");
      setEdgeFunctionResponse({ error: String(error) });
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
            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(edgeFunctionResponse, null, 2)}
            </pre>
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
          variant="default" 
          onClick={testEdgeFunction}
          disabled={status === 'testing'}
        >
          Test Edge Function
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConnectionTester;
