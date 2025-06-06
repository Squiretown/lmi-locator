
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SecuritySettingsTabProps {
  settings: {
    sessionTimeout: string;
    apiRateLimit: string;
  };
  onSettingChange: (key: string, value: any) => void;
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = ({
  settings,
  onSettingChange,
}) => {
  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
        <Select
          value={settings.sessionTimeout}
          onValueChange={(value) => onSettingChange('sessionTimeout', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 hour</SelectItem>
            <SelectItem value="4">4 hours</SelectItem>
            <SelectItem value="8">8 hours</SelectItem>
            <SelectItem value="24">24 hours</SelectItem>
            <SelectItem value="168">1 week</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
        <Input
          id="apiRateLimit"
          type="number"
          value={settings.apiRateLimit}
          onChange={(e) => onSettingChange('apiRateLimit', e.target.value)}
          placeholder="1000"
        />
      </div>
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          Changes to security settings will affect all users. Consider notifying users before making changes.
        </AlertDescription>
      </Alert>
    </div>
  );
};
