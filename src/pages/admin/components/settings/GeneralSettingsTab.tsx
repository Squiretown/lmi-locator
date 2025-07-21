
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ContactInfoSection } from './ContactInfoSection';

interface GeneralSettingsTabProps {
  settings: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    supportEmail: string;
    businessHours: string;
  };
  onSettingChange: (key: string, value: any) => void;
  onContactInfoChange: (key: string, value: string) => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  settings,
  contactInfo,
  onSettingChange,
  onContactInfoChange,
}) => {
  return (
    <div className="space-y-8">
      <div className="grid gap-4">
        <div>
          <h3 className="text-lg font-medium mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => onSettingChange('siteName', e.target.value)}
                placeholder="Enter site name"
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => onSettingChange('siteDescription', e.target.value)}
                placeholder="Enter site description"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable to show maintenance page to users
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => onSettingChange('maintenanceMode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowRegistration">Allow Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register accounts
                </p>
              </div>
              <Switch
                id="allowRegistration"
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => onSettingChange('allowRegistration', checked)}
              />
            </div>
          </div>
        </div>
      </div>

      <ContactInfoSection
        contactInfo={contactInfo}
        onContactInfoChange={onContactInfoChange}
      />
    </div>
  );
};
