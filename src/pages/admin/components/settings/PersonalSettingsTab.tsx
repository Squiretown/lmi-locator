
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface PersonalSettingsTabProps {
  personalSettings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
    securityAlerts: boolean;
    marketingEmails: boolean;
    theme: string;
    dateFormat: string;
    timeFormat: string;
  };
  onPersonalSettingChange: (key: string, value: any) => void;
}

export const PersonalSettingsTab: React.FC<PersonalSettingsTabProps> = ({
  personalSettings,
  onPersonalSettingChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Personal Settings</h3>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notification Preferences</CardTitle>
            <CardDescription>
              Choose how you want to be notified about important events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                checked={personalSettings.emailNotifications}
                onCheckedChange={(checked) => onPersonalSettingChange('emailNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
              </div>
              <Switch
                checked={personalSettings.pushNotifications}
                onCheckedChange={(checked) => onPersonalSettingChange('pushNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">Get a weekly summary email</p>
              </div>
              <Switch
                checked={personalSettings.weeklyDigest}
                onCheckedChange={(checked) => onPersonalSettingChange('weeklyDigest', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Security Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified of security events</p>
              </div>
              <Switch
                checked={personalSettings.securityAlerts}
                onCheckedChange={(checked) => onPersonalSettingChange('securityAlerts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive product updates and tips</p>
              </div>
              <Switch
                checked={personalSettings.marketingEmails}
                onCheckedChange={(checked) => onPersonalSettingChange('marketingEmails', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Display Preferences</CardTitle>
            <CardDescription>
              Customize how information is displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={personalSettings.theme}
                onValueChange={(value) => onPersonalSettingChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={personalSettings.dateFormat}
                onValueChange={(value) => onPersonalSettingChange('dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select
                value={personalSettings.timeFormat}
                onValueChange={(value) => onPersonalSettingChange('timeFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
