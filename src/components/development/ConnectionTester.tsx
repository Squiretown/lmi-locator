
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RefreshCcwIcon } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';
import EdgeFunctionResults from './EdgeFunctionResults';
import { useConnectionTester } from '@/hooks/useConnectionTester';

const ConnectionTester: React.FC = () => {
  const {
    status,
    pingTime,
    authStatus,
    lastTestedAt,
    edgeFunctionResponse,
    edgeFunctionStatus,
    consecutiveErrors,
    testConnection,
    testEdgeFunction
  } = useConnectionTester();
  
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
