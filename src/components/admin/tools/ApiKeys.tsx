
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, CheckCircle, XCircle, Trash2 } from "lucide-react";

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

export const ApiKeys: React.FC = () => {
  // State for API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
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
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [keyPermissions, setKeyPermissions] = useState<string[]>(['read']);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

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

  return (
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
  );
};
