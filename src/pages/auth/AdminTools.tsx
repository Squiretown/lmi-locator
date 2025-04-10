import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  Key, 
  ShieldCheck, 
  Users, 
  Database, 
  Trash2, 
  RefreshCw, 
  Copy, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  FileText,
  Terminal,
  Download
} from "lucide-react";
import { toast } from "sonner";
import SignOutAllUsersButton from "@/components/admin/SignOutAllUsersButton";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  context: string;
  details: any;
}

const AdminTools: React.FC = () => {
  // State for API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [keyPermissions, setKeyPermissions] = useState<string[]>(['read']);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // State for System Logs
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [logLevel, setLogLevel] = useState<string>('all');
  const [logContext, setLogContext] = useState<string>('all');

  // State for Database Maintenance
  const [dbStatus, setDbStatus] = useState<{
    tables: number;
    size: string;
    lastBackup: string;
  } | null>(null);

  useEffect(() => {
    // Fetch API keys
    async function fetchApiKeys() {
      // In a real app, this would fetch from your database
      // Simulating API keys for demonstration
      const mockApiKeys: ApiKey[] = [
        {
          id: '1',
          name: 'Production API Key',
          key: 'pk_live_' + Math.random().toString(36).substring(2, 15),
          permissions: ['read', 'write'],
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_used_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        },
        {
          id: '2',
          name: 'Test API Key',
          key: 'pk_test_' + Math.random().toString(36).substring(2, 15),
          permissions: ['read'],
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          last_used_at: null,
          expires_at: null,
          is_active: true
        }
      ];
      setApiKeys(mockApiKeys);

      // Initialize key visibility state
      const initialShowKeys: Record<string, boolean> = {};
      mockApiKeys.forEach(key => {
        initialShowKeys[key.id] = false;
      });
      setShowKeys(initialShowKeys);
    }

    // Fetch system logs
    async function fetchSystemLogs() {
      // In a real app, this would fetch from your database/logs system
      // Simulating logs for demonstration
      const mockLogs: SystemLog[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          level: 'info',
          message: 'User authentication successful',
          context: 'auth',
          details: { userId: 'user-123', method: 'email' }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          level: 'warn',
          message: 'Rate limit reached for API endpoint',
          context: 'api',
          details: { endpoint: '/api/data', ip: '192.168.1.1' }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          level: 'error',
          message: 'Database connection timeout',
          context: 'database',
          details: { attempt: 3, retryIn: '30s' }
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          level: 'info',
          message: 'Scheduled backup completed',
          context: 'database',
          details: { size: '2.3GB', duration: '127s' }
        }
      ];
      setSystemLogs(mockLogs);
    }

    // Fetch database status
    async function fetchDatabaseStatus() {
      // Simulating database status
      const mockStatus = {
        tables: 32,
        size: '3.7 GB',
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      };
      setDbStatus(mockStatus);
    }

    fetchApiKeys();
    fetchSystemLogs();
    fetchDatabaseStatus();
  }, []);

  // Filter logs based on selected level and context
  const filteredLogs = systemLogs.filter(log => {
    if (logLevel !== 'all' && log.level !== logLevel) return false;
    if (logContext !== 'all' && log.context !== logContext) return false;
    return true;
  });

  // Toggle API key visibility
  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  // Copy API key to clipboard
  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard");
    
    // Show the key briefly then hide it again
    setShowKeys(prev => ({ ...prev, [keyId]: true }));
    setTimeout(() => {
      setShowKeys(prev => ({ ...prev, [keyId]: false }));
    }, 3000);
  };

  // Create new API key
  const handleCreateApiKey = () => {
    if (!newKeyName) {
      toast.error("Please provide a name for the API key");
      return;
    }

    const newKey: ApiKey = {
      id: (apiKeys.length + 1).toString(),
      name: newKeyName,
      key: 'pk_' + (keyPermissions.includes('write') ? 'live_' : 'test_') + Math.random().toString(36).substring(2, 15),
      permissions: keyPermissions,
      created_at: new Date().toISOString(),
      last_used_at: null,
      expires_at: null,
      is_active: true
    };

    setApiKeys([...apiKeys, newKey]);
    setShowKeys(prev => ({ ...prev, [newKey.id]: true }));
    setNewKeyName('');
    setKeyPermissions(['read']);
    
    toast.success("New API key created successfully");
  };

  // Toggle key active status
  const toggleKeyStatus = (keyId: string) => {
    setApiKeys(apiKeys.map(key => {
      if (key.id === keyId) {
        return { ...key, is_active: !key.is_active };
      }
      return key;
    }));
    
    toast.success("API key status updated");
  };

  // Delete an API key
  const deleteKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
    toast.success("API key deleted successfully");
  };

  // Run database maintenance task
  const runDatabaseMaintenance = (task: string) => {
    toast.success(`${task} task initiated`);
    // In a real app, this would call an API to run the maintenance task
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Admin Tools</CardTitle>
          <CardDescription>
            Administrative tools for managing the system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="flex items-center gap-1">
                <Key className="h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                System Logs
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                Database Tools
              </TabsTrigger>
            </TabsList>
            
            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Global User Operations</h3>
                <div className="flex flex-col space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Sign Out All Users</CardTitle>
                      <CardDescription>
                        This will force all users to log out and require them to sign in again.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <SignOutAllUsersButton />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Verify Pending Users</CardTitle>
                      <CardDescription>
                        Review and approve users awaiting verification.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <Button variant="outline" onClick={() => toast.success("Redirecting to user verification page")}>
                        View Pending Verifications
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">User Authentication Settings</CardTitle>
                      <CardDescription>
                        Configure password policy, MFA requirements, and session duration.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <Button variant="outline" onClick={() => toast.success("Auth settings page not implemented")}>
                        Edit Auth Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* API Keys Tab */}
            <TabsContent value="api-keys" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                      Manage API keys for external integrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Key</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                              No API keys created yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          apiKeys.map((apiKey) => (
                            <TableRow key={apiKey.id}>
                              <TableCell>{apiKey.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="bg-muted px-2 py-1 rounded text-xs">
                                    {showKeys[apiKey.id] ? apiKey.key : '•••••••••••••••••'}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => toggleKeyVisibility(apiKey.id)}
                                  >
                                    {showKeys[apiKey.id] ? (
                                      <EyeOff className="h-3.5 w-3.5" />
                                    ) : (
                                      <Eye className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {apiKey.permissions.map(perm => (
                                    <Badge key={perm} variant="outline" className="capitalize">
                                      {perm}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(apiKey.created_at).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                {apiKey.is_active ? (
                                  <Badge variant="success" className="bg-green-100">Active</Badge>
                                ) : (
                                  <Badge variant="destructive" className="bg-red-100">Inactive</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => toggleKeyStatus(apiKey.id)}
                                  >
                                    {apiKey.is_active ? (
                                      <XCircle className="h-4 w-4 text-destructive" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 text-success" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-destructive"
                                    onClick={() => deleteKey(apiKey.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Create New API Key</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">API Key Name</label>
                      <Input 
                        placeholder="Production API Key" 
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Permissions</label>
                      <div className="flex gap-2">
                        <Button
                          variant={keyPermissions.includes('read') ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (keyPermissions.includes('read')) {
                              setKeyPermissions(keyPermissions.filter(p => p !== 'read'));
                            } else {
                              setKeyPermissions([...keyPermissions, 'read']);
                            }
                          }}
                        >
                          Read
                        </Button>
                        <Button
                          variant={keyPermissions.includes('write') ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (keyPermissions.includes('write')) {
                              setKeyPermissions(keyPermissions.filter(p => p !== 'write'));
                            } else {
                              setKeyPermissions([...keyPermissions, 'write']);
                            }
                          }}
                        >
                          Write
                        </Button>
                        <Button
                          variant={keyPermissions.includes('admin') ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (keyPermissions.includes('admin')) {
                              setKeyPermissions(keyPermissions.filter(p => p !== 'admin'));
                            } else {
                              setKeyPermissions([...keyPermissions, 'admin']);
                            }
                          }}
                        >
                          Admin
                        </Button>
                      </div>
                    </div>
                    
                    <Button className="w-full" onClick={handleCreateApiKey}>
                      Create API Key
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* System Logs Tab */}
            <TabsContent value="logs" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Level:</label>
                    <select
                      className="border rounded p-1 text-sm"
                      value={logLevel}
                      onChange={(e) => setLogLevel(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="info">Info</option>
                      <option value="warn">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Context:</label>
                    <select
                      className="border rounded p-1 text-sm"
                      value={logContext}
                      onChange={(e) => setLogContext(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="auth">Authentication</option>
                      <option value="api">API</option>
                      <option value="database">Database</option>
                    </select>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.success("Logs refreshed")}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>

              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead className="w-[100px]">Level</TableHead>
                      <TableHead className="w-[100px]">Context</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                          No logs found matching the selected filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                log.level === 'error' ? 'destructive' : 
                                log.level === 'warn' ? 'default' : 
                                'outline'
                              }
                              className={
                                log.level === 'error' ? 'bg-red-100' :
                                log.level === 'warn' ? 'bg-yellow-100' :
                                'bg-blue-100'
                              }
                            >
                              {log.level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {log.context}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-xs">{log.message}</div>
                            <div className="mt-1 text-xs text-muted-foreground overflow-hidden text-ellipsis">
                              {JSON.stringify(log.details)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.success("Log file downloaded")}>
                  <Download className="h-4 w-4 mr-1" />
                  Export Logs
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.success("Logs cleared")}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear Logs
                </Button>
              </div>
            </TabsContent>
            
            {/* Database Tools Tab */}
            <TabsContent value="database" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Database Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Database Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dbStatus ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Tables:</span>
                          <span className="font-medium">{dbStatus.tables}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Size:</span>
                          <span className="font-medium">{dbStatus.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Last Backup:</span>
                          <span className="font-medium">{new Date(dbStatus.lastBackup).toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2">Loading...</div>
                    )}
                  </CardContent>
                </Card>

                {/* Database Maintenance Tools Card */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Maintenance Tasks</CardTitle>
                    <CardDescription>Run database maintenance operations</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => runDatabaseMaintenance('Backup')}
                    >
                      <Database className="mr-2 h-4 w-4" />
                      Create Backup
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => runDatabaseMaintenance('Vacuum')}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Vacuum Database
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => runDatabaseMaintenance('Analyze')}
                    >
                      <Terminal className="mr-2 h-4 w-4" />
                      Analyze Tables
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => runDatabaseMaintenance('Reindex')}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reindex Tables
                    </Button>
                  </CardContent>
                </Card>

                {/* Error Reporting Card */}
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-base">Error Reporting</CardTitle>
                    <CardDescription>
                      View and manage system error reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>System is operating normally</AlertTitle>
                      <AlertDescription>
                        No critical errors have been reported in the last 24 hours.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="mt-4">
                      <Button variant="outline" onClick={() => toast.success("Redirecting to error logs page")}>
                        View Detailed Error Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="text-xs text-muted-foreground">
          These operations require admin privileges and all actions are logged for security purposes.
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminTools;
