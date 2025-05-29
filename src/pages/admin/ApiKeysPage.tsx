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
import { Key, Plus, Eye, EyeOff, Copy, Edit, Trash2, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const ApiKeysPage: React.FC = () => {
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

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
    },
    {
      id: '3',
      name: 'Mapbox API Key',
      service: 'Mapbox',
      key: 'pk_live_51234567890abcdef...',
      status: 'inactive',
      lastUsed: 'Never',
      requests: 0,
      environment: 'production'
    },
    {
      id: '4',
      name: 'OpenAI Integration',
      service: 'OpenAI',
      key: 'sk_proj_51234567890abcdef...',
      status: 'active',
      lastUsed: '5 minutes ago',
      requests: 8932,
      environment: 'production'
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
    },
    {
      name: 'OpenAI',
      description: 'AI-powered text processing and generation',
      status: 'configured',
      keys: 1,
      docs: 'https://platform.openai.com/docs'
    },
    {
      name: 'Stripe',
      description: 'Payment processing and billing',
      status: 'not_configured',
      keys: 0,
      docs: 'https://stripe.com/docs/api'
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
  };

  const handleAddKey = () => {
    setIsAddKeyOpen(false);
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
                <CardTitle>API Keys Management</CardTitle>
                <CardDescription>
                  Manage API keys and external service integrations
                </CardDescription>
              </div>
            </div>
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
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="keys" className="space-y-4">
            <TabsList>
              <TabsTrigger value="keys">API Keys</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
            </TabsList>

            <TabsContent value="keys">
              <div className="space-y-4">
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

            <TabsContent value="services">
              <div className="space-y-4">
                <div className="grid gap-4">
                  {services.map((service) => (
                    <Card key={service.name}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              service.status === 'configured' ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <div>
                              <div className="font-medium">{service.name}</div>
                              <div className="text-sm text-muted-foreground">{service.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm font-medium">{service.keys} keys</div>
                              <div className="text-xs text-muted-foreground">
                                {service.status === 'configured' ? 'Configured' : 'Not configured'}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={service.docs} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="outline" size="sm">
                              {service.status === 'configured' ? 'Manage' : 'Configure'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
