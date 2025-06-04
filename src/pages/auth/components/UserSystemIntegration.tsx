
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Key, 
  RefreshCw, 
  ExternalLink, 
  Shield, 
  Zap,
  Database,
  Link2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import type { AdminUser } from '../types/admin-user';

interface UserSystemIntegrationProps {
  user: AdminUser;
}

interface ApiToken {
  id: string;
  name: string;
  token: string;
  permissions: string[];
  created_at: string;
  last_used: string;
  expires_at: string;
  is_active: boolean;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  last_sync: string;
  permissions: string[];
  settings: Record<string, any>;
}

interface SyncOperation {
  id: string;
  system: string;
  operation: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  details: string;
}

export const UserSystemIntegration: React.FC<UserSystemIntegrationProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiTokens, setApiTokens] = useState<ApiToken[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>([]);
  const [newTokenName, setNewTokenName] = useState('');

  const loadIntegrationData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - in real implementation this would come from integration service
      setApiTokens([
        {
          id: '1',
          name: 'Mobile App Access',
          token: 'tok_1234567890abcdef',
          permissions: ['read:properties', 'write:searches'],
          created_at: '2024-01-15T10:00:00Z',
          last_used: '2024-01-20T09:30:00Z',
          expires_at: '2024-07-15T10:00:00Z',
          is_active: true
        },
        {
          id: '2',
          name: 'Third Party Integration',
          token: 'tok_abcdef1234567890',
          permissions: ['read:profile', 'read:properties'],
          created_at: '2024-01-10T14:30:00Z',
          last_used: '2024-01-18T16:45:00Z',
          expires_at: '2024-04-10T14:30:00Z',
          is_active: false
        }
      ]);

      setIntegrations([
        {
          id: '1',
          name: 'CRM System',
          type: 'customer_management',
          status: 'connected',
          last_sync: '2024-01-20T08:00:00Z',
          permissions: ['read:contacts', 'write:leads'],
          settings: { auto_sync: true, sync_frequency: '1h' }
        },
        {
          id: '2',
          name: 'Marketing Platform',
          type: 'marketing',
          status: 'error',
          last_sync: '2024-01-19T12:00:00Z',
          permissions: ['read:campaigns', 'write:contacts'],
          settings: { auto_sync: false, sync_frequency: '24h' }
        },
        {
          id: '3',
          name: 'Analytics Service',
          type: 'analytics',
          status: 'disconnected',
          last_sync: '2024-01-15T10:00:00Z',
          permissions: ['read:events'],
          settings: { auto_sync: false }
        }
      ]);

      setSyncOperations([
        {
          id: '1',
          system: 'CRM System',
          operation: 'Export Leads',
          status: 'completed',
          started_at: '2024-01-20T08:00:00Z',
          completed_at: '2024-01-20T08:05:00Z',
          details: 'Successfully exported 15 leads to CRM'
        },
        {
          id: '2',
          system: 'Marketing Platform',
          operation: 'Sync Contacts',
          status: 'failed',
          started_at: '2024-01-19T12:00:00Z',
          completed_at: '2024-01-19T12:02:00Z',
          details: 'Authentication failed - token expired'
        },
        {
          id: '3',
          system: 'Analytics Service',
          operation: 'Import Events',
          status: 'in_progress',
          started_at: '2024-01-20T10:30:00Z',
          details: 'Processing user activity events...'
        }
      ]);

      toast.success('Integration data loaded successfully');
    } catch (error) {
      toast.error('Failed to load integration data');
    } finally {
      setIsLoading(false);
    }
  };

  const createApiToken = async () => {
    if (!newTokenName) {
      toast.error('Please enter a token name');
      return;
    }

    try {
      setIsLoading(true);
      // Mock token creation
      const newToken: ApiToken = {
        id: Date.now().toString(),
        name: newTokenName,
        token: `tok_${Math.random().toString(36).substring(2)}`,
        permissions: ['read:properties'],
        created_at: new Date().toISOString(),
        last_used: 'Never',
        expires_at: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      };

      setApiTokens([...apiTokens, newToken]);
      setNewTokenName('');
      toast.success('API token created successfully');
    } catch (error) {
      toast.error('Failed to create API token');
    } finally {
      setIsLoading(false);
    }
  };

  const revokeToken = async (tokenId: string) => {
    try {
      setIsLoading(true);
      setApiTokens(apiTokens.filter(token => token.id !== tokenId));
      toast.success('API token revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke API token');
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithSystem = async (integrationId: string) => {
    try {
      setIsLoading(true);
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) return;

      // Mock sync operation
      const newOperation: SyncOperation = {
        id: Date.now().toString(),
        system: integration.name,
        operation: 'Manual Sync',
        status: 'in_progress',
        started_at: new Date().toISOString(),
        details: `Syncing data with ${integration.name}...`
      };

      setSyncOperations([newOperation, ...syncOperations]);
      toast.info(`Started sync with ${integration.name}`);

      // Simulate completion after 3 seconds
      setTimeout(() => {
        setSyncOperations(ops => ops.map(op => 
          op.id === newOperation.id 
            ? { ...op, status: 'completed', completed_at: new Date().toISOString(), details: 'Sync completed successfully' }
            : op
        ));
        toast.success(`Sync with ${integration.name} completed`);
      }, 3000);
    } catch (error) {
      toast.error('Failed to start sync operation');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'completed':
        return 'text-green-600';
      case 'error':
      case 'failed':
        return 'text-red-600';
      case 'in_progress':
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <Database className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Integration & API Management
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={loadIntegrationData} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tokens" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tokens">API Tokens</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="sync">Sync Operations</TabsTrigger>
            </TabsList>

            <TabsContent value="tokens" className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="tokenName">Create New API Token</Label>
                  <Input
                    id="tokenName"
                    placeholder="Enter token name..."
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                  />
                </div>
                <Button onClick={createApiToken} disabled={isLoading || !newTokenName}>
                  <Key className="h-4 w-4 mr-2" />
                  Create Token
                </Button>
              </div>

              {apiTokens.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Active API Tokens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Token</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead>Last Used</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiTokens.map((token) => (
                          <TableRow key={token.id}>
                            <TableCell className="font-medium">{token.name}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {token.token.substring(0, 20)}...
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {token.permissions.map((perm, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {perm}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {token.last_used === 'Never' ? 'Never' : new Date(token.last_used).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{new Date(token.expires_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={token.is_active ? 'default' : 'secondary'}>
                                {token.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => revokeToken(token.id)}
                              >
                                Revoke
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              {integrations.length > 0 && (
                <div className="grid gap-4">
                  {integrations.map((integration) => (
                    <Card key={integration.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(integration.status)}
                            <div>
                              <h3 className="font-medium">{integration.name}</h3>
                              <p className="text-sm text-muted-foreground capitalize">
                                {integration.type.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={integration.status === 'connected' ? 'default' : 
                                      integration.status === 'error' ? 'destructive' : 'secondary'}
                            >
                              {integration.status}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => syncWithSystem(integration.id)}
                              disabled={integration.status === 'disconnected'}
                            >
                              <Zap className="h-4 w-4 mr-2" />
                              Sync Now
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Last Sync:</span>
                            <br />
                            {new Date(integration.last_sync).toLocaleString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Permissions:</span>
                            <br />
                            <div className="flex gap-1 flex-wrap mt-1">
                              {integration.permissions.map((perm, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {integration.settings.auto_sync !== undefined && (
                          <div className="mt-4 flex items-center gap-2">
                            <Switch 
                              checked={integration.settings.auto_sync} 
                              onCheckedChange={() => {
                                toast.info('Auto-sync setting updated');
                              }}
                            />
                            <Label>Auto-sync enabled</Label>
                            {integration.settings.sync_frequency && (
                              <span className="text-sm text-muted-foreground">
                                (every {integration.settings.sync_frequency})
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sync" className="space-y-4">
              {syncOperations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sync Operations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>System</TableHead>
                          <TableHead>Operation</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Started</TableHead>
                          <TableHead>Completed</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {syncOperations.map((operation) => (
                          <TableRow key={operation.id}>
                            <TableCell className="font-medium">{operation.system}</TableCell>
                            <TableCell>{operation.operation}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(operation.status)}
                                <span className={getStatusColor(operation.status)}>
                                  {operation.status.replace('_', ' ')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{new Date(operation.started_at).toLocaleString()}</TableCell>
                            <TableCell>
                              {operation.completed_at 
                                ? new Date(operation.completed_at).toLocaleString()
                                : '-'
                              }
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {operation.details}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
