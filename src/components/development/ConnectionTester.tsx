
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCcwIcon, AlertCircleIcon, DatabaseIcon, MailIcon, ShieldIcon } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';
import EdgeFunctionResults from './EdgeFunctionResults';
import EmailTester from './EmailTester';
import AdminTester from './AdminTester';
import TestLogger from './TestLogger';
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
  
  // Check if either test has error status
  const hasErrors = status === 'error' || edgeFunctionStatus === 'error';
  
  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            System Testing Dashboard
            {hasErrors && <AlertCircleIcon className="h-5 w-5 text-destructive" />}
          </CardTitle>
          <CardDescription>
            Comprehensive testing for Supabase connectivity, email functionality, and admin operations
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="connectivity" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="connectivity" className="flex items-center gap-2">
                <DatabaseIcon className="h-4 w-4" />
                Connectivity
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <MailIcon className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <ShieldIcon className="h-4 w-4" />
                Admin
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <RefreshCcwIcon className="h-4 w-4" />
                Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connectivity" className="space-y-4 mt-6">
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
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={testConnection}
                  disabled={status === 'testing'}
                >
                  {status === 'testing' ? (
                    <RefreshCcwIcon className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
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
              </div>
            </TabsContent>

            <TabsContent value="email" className="mt-6">
              <EmailTester />
            </TabsContent>

            <TabsContent value="admin" className="mt-6">
              <AdminTester />
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <TestLogger />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionTester;
