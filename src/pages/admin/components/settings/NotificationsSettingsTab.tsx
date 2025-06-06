
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotificationsSettingsTabProps {
  settings: {
    emailNotifications: boolean;
  };
  onSettingChange: (key: string, value: any) => void;
}

export const NotificationsSettingsTab: React.FC<NotificationsSettingsTabProps> = ({
  settings,
  onSettingChange,
}) => {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="emailNotifications">Email Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Send system notifications via email
          </p>
        </div>
        <Switch
          id="emailNotifications"
          checked={settings.emailNotifications}
          onCheckedChange={(checked) => onSettingChange('emailNotifications', checked)}
        />
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">User registration</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">System errors</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Database backups</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Security alerts</span>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
