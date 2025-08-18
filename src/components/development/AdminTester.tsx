import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCcwIcon, ShieldIcon, UsersIcon, BellIcon, MailIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import StatusBadge from './StatusBadge';

interface TestResult {
  success: boolean;
  error?: string;
  data?: any;
  responseTime: number;
}

const AdminTester: React.FC = () => {
  const [activeTab, setActiveTab] = useState('user-management');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  
  // Test data states
  const [testUserId, setTestUserId] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testUserType, setTestUserType] = useState('client');
  const [testPermission, setTestPermission] = useState('');

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setIsLoading(true);
    const startTime = performance.now();

    try {
      const result = await testFunction();
      const responseTime = Math.round(performance.now() - startTime);
      
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: true,
          data: result.data,
          responseTime
        }
      }));
      
      toast.success(`${testName} test completed successfully`);
    } catch (error: any) {
      const responseTime = Math.round(performance.now() - startTime);
      
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          error: error.message,
          responseTime
        }
      }));
      
      toast.error(`${testName} test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testUserManagement = () => {
    if (!testUserId) {
      toast.error('Please enter a test user ID');
      return;
    }

    runTest('User Management', async () => {
      return await supabase.functions.invoke('get-user-type-name', {
        body: { userId: testUserId }
      });
    });
  };

  const testUserPermissions = () => {
    if (!testUserId) {
      toast.error('Please enter a test user ID');
      return;
    }

    runTest('User Permissions', async () => {
      return await supabase.functions.invoke('get-user-permissions', {
        body: { userId: testUserId }
      });
    });
  };

  const testUserCreation = () => {
    if (!testEmail) {
      toast.error('Please enter a test email');
      return;
    }

    runTest('User Creation', async () => {
      return await supabase.functions.invoke('create-user', {
        body: { 
          email: testEmail,
          userType: testUserType,
          testMode: true // Prevent actual user creation
        }
      });
    });
  };

  const testPermissionCheck = () => {
    if (!testUserId || !testPermission) {
      toast.error('Please enter user ID and permission');
      return;
    }

    runTest('Permission Check', async () => {
      return await supabase.functions.invoke('user-has-permission', {
        body: { 
          userId: testUserId,
          permission: testPermission
        }
      });
    });
  };

  const testBulkUserOperation = () => {
    runTest('Bulk User Operation', async () => {
      return await supabase.functions.invoke('list-users', {
        body: { 
          page: 1,
          limit: 5,
          testMode: true
        }
      });
    });
  };

  const testNotificationSending = () => {
    if (!testUserId) {
      toast.error('Please enter a test user ID');
      return;
    }

    runTest('Notification Sending', async () => {
      return await supabase.functions.invoke('notify-admin', {
        body: { 
          userId: testUserId,
          message: 'Test notification from admin panel',
          testMode: true
        }
      });
    });
  };

  const testInvitationSending = () => {
    if (!testEmail) {
      toast.error('Please enter a test email');
      return;
    }

    runTest('Invitation Sending', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return await supabase.functions.invoke('send-invitation', {
        body: { 
          target: 'client',
          channel: 'email',
          recipient: {
            email: testEmail,
            name: 'Test User'
          },
          context: {
            templateType: 'test',
            customMessage: 'This is a test invitation from admin panel'
          }
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
    });
  };

  const renderTestResult = (testName: string) => {
    const result = testResults[testName];
    if (!result) return null;

    return (
      <div className="mt-3 p-3 rounded-lg border bg-muted/50">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm">{testName} Result:</span>
          <StatusBadge 
            status={result.success ? 'success' : 'error'}
            successText="Passed"
            errorText="Failed"
          />
        </div>
        <div className="text-xs space-y-1">
          <div>Response Time: {result.responseTime}ms</div>
          {result.error && (
            <div className="text-destructive">Error: {result.error}</div>
          )}
          {result.data && (
            <div>
              <div className="font-medium">Data:</div>
              <pre className="bg-background p-2 rounded text-xs overflow-auto max-h-20">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ShieldIcon className="h-5 w-5" />
          Admin Function Testing
        </CardTitle>
        <CardDescription>
          Test admin functions, user management, and system operations
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="user-management" className="text-xs">
              <UsersIcon className="h-4 w-4 mr-1" />
              Users
            </TabsTrigger>
            <TabsTrigger value="permissions" className="text-xs">
              <ShieldIcon className="h-4 w-4 mr-1" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">
              <BellIcon className="h-4 w-4 mr-1" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="invitations" className="text-xs">
              <MailIcon className="h-4 w-4 mr-1" />
              Invitations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user-management" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-user-id">Test User ID</Label>
                  <Input
                    id="test-user-id"
                    placeholder="User UUID"
                    value={testUserId}
                    onChange={(e) => setTestUserId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-email">Test Email</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="test-user-type">User Type</Label>
                <Select value={testUserType} onValueChange={setTestUserType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={testUserManagement}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  {isLoading ? <RefreshCcwIcon className="h-4 w-4 animate-spin" /> : null}
                  Test User Info
                </Button>
                <Button 
                  onClick={testUserCreation}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Test User Creation
                </Button>
              </div>
              
              <Button 
                onClick={testBulkUserOperation}
                disabled={isLoading}
                className="w-full"
                size="sm"
              >
                Test Bulk Operations
              </Button>
            </div>
            
            {renderTestResult('User Management')}
            {renderTestResult('User Creation')}
            {renderTestResult('Bulk User Operation')}
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-permission">Permission Name</Label>
                <Select value={testPermission} onValueChange={setTestPermission}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin_access">Admin Access</SelectItem>
                    <SelectItem value="user_management">User Management</SelectItem>
                    <SelectItem value="data_export">Data Export</SelectItem>
                    <SelectItem value="system_logs">System Logs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={testUserPermissions}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Get User Permissions
                </Button>
                <Button 
                  onClick={testPermissionCheck}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Check Permission
                </Button>
              </div>
            </div>
            
            {renderTestResult('User Permissions')}
            {renderTestResult('Permission Check')}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              <Button 
                onClick={testNotificationSending}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <RefreshCcwIcon className="h-4 w-4 animate-spin mr-2" /> : null}
                Test Notification Sending
              </Button>
            </div>
            
            {renderTestResult('Notification Sending')}
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            <div className="space-y-4">
              <Button 
                onClick={testInvitationSending}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <RefreshCcwIcon className="h-4 w-4 animate-spin mr-2" /> : null}
                Test Invitation Sending
              </Button>
            </div>
            
            {renderTestResult('Invitation Sending')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminTester;