
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface SystemSettingsTabProps {
  settings: {
    maxFileSize: string;
    autoBackup: boolean;
  };
  onSettingChange: (key: string, value: any) => void;
}

export const SystemSettingsTab: React.FC<SystemSettingsTabProps> = ({
  settings,
  onSettingChange,
}) => {
  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
        <Input
          id="maxFileSize"
          type="number"
          value={settings.maxFileSize}
          onChange={(e) => onSettingChange('maxFileSize', e.target.value)}
          placeholder="10"
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="autoBackup">Automatic Backups</Label>
          <p className="text-sm text-muted-foreground">
            Automatically backup database daily
          </p>
        </div>
        <Switch
          id="autoBackup"
          checked={settings.autoBackup}
          onCheckedChange={(checked) => onSettingChange('autoBackup', checked)}
        />
      </div>
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>System Status</AlertTitle>
        <AlertDescription>
          All systems are running normally. Last backup: 2 hours ago.
        </AlertDescription>
      </Alert>
    </div>
  );
};
