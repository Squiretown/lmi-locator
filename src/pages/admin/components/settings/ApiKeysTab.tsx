
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Key, Eye, EyeOff, Copy, AlertTriangle } from "lucide-react";
import { useState } from 'react';

interface ApiKeysTabProps {
  apiKeys: {
    esriApiKey: string;
    mapboxApiKey: string;
    hudApiKey: string;
  };
  onApiKeyChange: (key: string, value: string) => void;
}

export const ApiKeysTab: React.FC<ApiKeysTabProps> = ({
  apiKeys,
  onApiKeyChange,
}) => {
  const [showKeys, setShowKeys] = useState({
    esriApiKey: false,
    mapboxApiKey: false,
    hudApiKey: false,
  });

  const toggleKeyVisibility = (keyName: keyof typeof showKeys) => {
    setShowKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    return key.slice(0, 8) + '*'.repeat(Math.max(0, key.length - 16)) + key.slice(-8);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Key className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">API Keys Management</h3>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          API keys are sensitive information. Keep them secure and never share them publicly.
          Changes to API keys will affect system functionality immediately.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Third-Party API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="esriApiKey">ESRI ArcGIS API Key</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Used for geocoding and mapping services
            </p>
            <div className="flex gap-2">
              <Input
                id="esriApiKey"
                type={showKeys.esriApiKey ? "text" : "password"}
                value={showKeys.esriApiKey ? apiKeys.esriApiKey : maskKey(apiKeys.esriApiKey)}
                onChange={(e) => onApiKeyChange('esriApiKey', e.target.value)}
                placeholder="Enter ESRI API key"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleKeyVisibility('esriApiKey')}
              >
                {showKeys.esriApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(apiKeys.esriApiKey)}
                disabled={!apiKeys.esriApiKey}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="mapboxApiKey">Mapbox API Key</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Used for interactive map displays and styling
            </p>
            <div className="flex gap-2">
              <Input
                id="mapboxApiKey"
                type={showKeys.mapboxApiKey ? "text" : "password"}
                value={showKeys.mapboxApiKey ? apiKeys.mapboxApiKey : maskKey(apiKeys.mapboxApiKey)}
                onChange={(e) => onApiKeyChange('mapboxApiKey', e.target.value)}
                placeholder="Enter Mapbox API key"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleKeyVisibility('mapboxApiKey')}
              >
                {showKeys.mapboxApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(apiKeys.mapboxApiKey)}
                disabled={!apiKeys.mapboxApiKey}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="hudApiKey">HUD API Key</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Used for accessing HUD Low-to-Moderate Income data
            </p>
            <div className="flex gap-2">
              <Input
                id="hudApiKey"
                type={showKeys.hudApiKey ? "text" : "password"}
                value={showKeys.hudApiKey ? apiKeys.hudApiKey : maskKey(apiKeys.hudApiKey)}
                onChange={(e) => onApiKeyChange('hudApiKey', e.target.value)}
                placeholder="Enter HUD API key"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleKeyVisibility('hudApiKey')}
              >
                {showKeys.hudApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(apiKeys.hudApiKey)}
                disabled={!apiKeys.hudApiKey}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">API Key Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">ESRI API Key</span>
            <span className={`text-sm px-2 py-1 rounded ${apiKeys.esriApiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {apiKeys.esriApiKey ? 'Active' : 'Not Set'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Mapbox API Key</span>
            <span className={`text-sm px-2 py-1 rounded ${apiKeys.mapboxApiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {apiKeys.mapboxApiKey ? 'Active' : 'Not Set'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">HUD API Key</span>
            <span className={`text-sm px-2 py-1 rounded ${apiKeys.hudApiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {apiKeys.hudApiKey ? 'Active' : 'Not Set'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
