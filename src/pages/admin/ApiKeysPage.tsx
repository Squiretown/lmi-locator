
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Key, 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Edit, 
  Trash2, 
  AlertCircle, 
  ExternalLink,
  Database,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

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

const ApiKeysPage: React.FC = () => {
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [isAddTokenOpen, setIsAddTokenOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newTokenName, setNewTokenName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for API tokens
  const [apiTokens, setApiTokens] = useState<ApiToken[]>([
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

  // Mock data for integrations
  const [integrations, setIntegrations] = useState<Integration[]>([
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
    }
  ]);

  // Mock data for sync operations
  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>([
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
    }
  ]);

  // Mock API keys data
  const apiKeys = [
    {
      id: '1',
      name: 'Production API Key',
      service: 'Esri Geocoding',
      key: 'sk_live_51234567890abcdef...',
      status: 'active',
      lastUsed: '2 hours ago',
      requests: 15420,
      environment: 'production'
    },
    {
      id: '2',
      name: 'Development Geocoding',
      service: 'Esri Geocoding',
      key: 'sk_test_51234567890abcdef...',
      status: 'active',
      lastUsed: '1 day ago',
      requests: 234,
      environment: 'development'
    }
  ];

  const services = [
    {
      name: 'Esri Geocoding',
      description: 'Address geocoding and reverse geocoding services',
      status: 'configured',
      keys: 2,
      docs: 'https://developers.arcgis.com/rest/geocode/'
    },
    {
      name: 'Mapbox',
      description: 'Interactive maps and location services',
      status: 'configured',
      keys: 1,
      docs: 'https://docs.mapbox.com/api/'
    }
  ];

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleAddKey = () => {
    setIsAddKeyOpen(false);
    toast.success('API key added successfully');
  };

  const createApiToken = async () => {
    if (!newTokenName) {
      toast.error('Please enter a token name');
      return;
    }

    try {
      setIsLoading(true);
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
      setIsAddTokenOpen(false);
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

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>API Keys & System Integration Management</CardTitle>
                <CardDescription>
                  Manage API keys, tokens, integrations, and sync operations
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="keys" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="keys">API Keys</TabsTrigger>
              <TabsTrigger value="tokens">API Tokens</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="sync">Sync Operations</TabsTrigger>
              <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
            </TabsList>

            <TabsContent value="keys">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">External Service API Keys</h3>
                  <Dialog open={isAddKeyOpen} onOpenChange={setIsAddKeyOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add API Key
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New API Key</DialogTitle>
                        <DialogDescription>
                          Add a new API key for external service integration
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="keyName">Key Name</Label>
                          <Input id="keyName" placeholder="e.g., Production Geocoding Key" />
                        </div>
                        <div>
                          <Label htmlFor="service">Service</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="esri">Esri Geocoding</SelectItem>
                              <SelectItem value="mapbox">Mapbox</SelectItem>
                              <SelectItem value="openai">OpenAI</SelectItem>
                              <SelectItem value="stripe">Stripe</SelectItem>
                              <SelectItem value="custom">Custom Service</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="environment">Environment</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select environment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="production">Production</SelectItem>
                              <SelectItem value="development">Development</SelectItem>
                              <SelectItem value="testing">Testing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="apiKey">API Key</Label>
                          <Input id="apiKey" type="password" placeholder="Enter your API key" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddKeyOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddKey}>Add Key</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Security Notice</AlertTitle>
                  <AlertDescription>
                    API keys are sensitive credentials. Store them securely and never expose them in client-side code.
                  </AlertDescription>
                </Alert>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Environment</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell className="font-medium">{apiKey.name}</TableCell>
                        <TableCell>{apiKey.service}</TableCell>
                        <TableCell>
                          <Badge variant={apiKey.environment === 'production' ? 'default' : 'secondary'}>
                            {apiKey.environment}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm">
                              {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                            >
                              {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(apiKey.key)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                            {apiKey.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{apiKey.lastUsed}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="tokens">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">API Token Lifecycle Management</h3>
                  <Dialog open={isAddTokenOpen} onOpenChange={setIsAddTokenOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Key className="h-4 w-4 mr-2" />
                        Create Token
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New API Token</DialogTitle>
                        <DialogDescription>
                          Create a new API token with specific permissions
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="tokenName">Token Name</Label>
                          <Input 
                            id="tokenName" 
                            placeholder="Enter token name..."
                            value={newTokenName}
                            onChange={(e) => setNewTokenName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Permissions</Label>
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="read-properties" defaultChecked />
                              <Label htmlFor="read-properties">Read Properties</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="write-searches" />
                              <Label htmlFor="write-searches">Write Searches</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddTokenOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createApiToken} disabled={isLoading || !newTokenName}>
                          Create Token
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {apiTokens.length > 0 && (
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
                )}
              </div>
            </TabsContent>

            <TabsContent value="integrations">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Connected Systems Status & Sync Controls</h3>
                
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
              </div>
            </TabsContent>

            <TabsContent value="sync">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Historical Sync Operations & Real-time Status</h3>
                
                {syncOperations.length > 0 && (
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
                              <span className={
                                operation.status === 'completed' ? 'text-green-600' :
                                operation.status === 'failed' ? 'text-red-600' :
                                operation.status === 'in_progress' ? 'text-yellow-600' :
                                'text-gray-600'
                              }>
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
                )}
              </div>
            </TabsContent>

            <TabsContent value="usage">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium">Total Requests Today</div>
                      <div className="text-2xl font-bold">24,586</div>
                      <div className="text-xs text-muted-foreground">+12% from yesterday</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium">Active API Keys</div>
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-xs text-muted-foreground">1 inactive</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium">Services Configured</div>
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-xs text-muted-foreground">1 pending</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">API Usage by Service</CardTitle>
                    <CardDescription>Requests in the last 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {apiKeys.filter(key => key.status === 'active').map((key) => (
                        <div key={key.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{key.service}</div>
                            <div className="text-sm text-muted-foreground">{key.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{key.requests.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">requests</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Rate Limiting</AlertTitle>
                  <AlertDescription>
                    Monitor your API usage to avoid hitting rate limits. Consider implementing caching for frequently requested data.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeysPage;
