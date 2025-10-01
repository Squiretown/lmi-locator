// src/components/EdgeFunctionTest.tsx
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TestResult {
  success: boolean;
  timestamp: string;
  responseTime?: number;
  data?: any;
  error?: any;
}

export function EdgeFunctionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testLmiCheck = async () => {
    console.log('🧪 Testing lmi-check Edge Function directly...');
    setIsLoading(true);
    setError(null);
    
    const startTime = Date.now();
    
    try {
      // Test with Hampton Bays address that should be NOT LMI eligible
      const testPayload = {
        address: "26 rolling Hill Rd, hampton bays, NY 11946",
        ami: 100000
      };

      const { data, error: invokeError } = await supabase.functions.invoke('lmi-check', {
        body: testPayload
      });

      const responseTime = Date.now() - startTime;

      if (invokeError) {
        setError(invokeError.message);
        setLastResult({
          success: false,
          timestamp: new Date().toLocaleTimeString(),
          responseTime,
          error: invokeError
        });
      } else {
        setLastResult({
          success: true,
          timestamp: new Date().toLocaleTimeString(),
          responseTime,
          data
        });
      }
    } catch (err) {
      const responseTime = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      setError(errorMessage);
      setLastResult({
        success: false,
        timestamp: new Date().toLocaleTimeString(),
        responseTime,
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Edge Function Test - lmi-check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testLmiCheck}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test lmi-check with Hampton Bays'}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="font-semibold text-red-800">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {lastResult && (
          <div className="p-4 bg-gray-50 border rounded-md">
            <h3 className="font-semibold mb-2">
              Last Test Result ({lastResult.timestamp}):
            </h3>
            <div className="space-y-2">
              <p><strong>Success:</strong> {lastResult.success ? 'Yes' : 'No'}</p>
              {lastResult.responseTime && (
                <p><strong>Response Time:</strong> {lastResult.responseTime}ms</p>
              )}
              
              {lastResult.data && (
                <div>
                  <strong>Response Data:</strong>
                  <pre className="mt-2 p-2 bg-white border rounded text-sm overflow-auto max-h-96">
{JSON.stringify(lastResult.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {lastResult.error && (
                <div>
                  <strong>Error:</strong>
                  <pre className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm overflow-auto">
{JSON.stringify(lastResult.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>Test Address:</strong> 26 rolling Hill Rd, hampton bays, NY 11946</p>
          <p><strong>Expected:</strong> NOT LMI Eligible (tract 36103190603 has AMI 83.78%)</p>
          <p><strong>Purpose:</strong> Verify database-first approach is working</p>
        </div>
      </CardContent>
    </Card>
  );
}