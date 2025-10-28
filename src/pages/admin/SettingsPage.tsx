import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loadSystemSettings, saveSystemSettings, loadAdminProfile, type GeneralSettings, type ContactInfo, type AdminProfile } from '@/lib/supabase/admin-settings';
import { useAuth } from '@/hooks/useAuth';
import { GeneralSettingsTab } from './components/settings/GeneralSettingsTab';
import { SecuritySettingsTab } from './components/settings/SecuritySettingsTab';
import { NotificationsSettingsTab } from './components/settings/NotificationsSettingsTab';
import { SystemSettingsTab } from './components/settings/SystemSettingsTab';
import { UserProfileTab } from './components/settings/UserProfileTab';
import { PersonalSettingsTab } from './components/settings/PersonalSettingsTab';
import { ApiKeysTab } from './components/settings/ApiKeysTab';
import { ThemeSettingsTab } from './components/settings/ThemeSettingsTab';

const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<GeneralSettings>({
    siteName: 'LMI Property Search',
    siteDescription: 'Find LMI eligible properties and assistance programs',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    autoBackup: true,
    sessionTimeout: '24',
    maxFileSize: '10',
    apiRateLimit: '1000'
  });

  // Contact info state
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'info@lmicheck.com',
    phone: '(555) 123-4567',
    address: 'Suffolk, NY',
    supportEmail: 'support@lmicheck.com',
    businessHours: 'Monday - Friday: 9:00 AM - 5:00 PM EST'
  });

  // Admin profile state
  const [profile, setProfile] = useState<AdminProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    timezone: 'America/New_York',
    language: 'en'
  });
  const [originalEmail, setOriginalEmail] = useState('');

  // Mock personal settings state
  const [personalSettings, setPersonalSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    securityAlerts: true,
    marketingEmails: false,
    theme: 'system',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });

  // Mock API keys state
  const [apiKeys, setApiKeys] = useState({
    esriApiKey: '',
    mapboxApiKey: '',
    hudApiKey: ''
  });

  // Load settings and profile on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { general, contact } = await loadSystemSettings();
        setSettings(general);
        setContactInfo(contact);
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings. Using defaults.');
      } finally {
        setIsInitialLoading(false);
      }
    };

    const loadProfile = async () => {
      try {
        const profileData = await loadAdminProfile();
        setProfile(profileData);
        setOriginalEmail(profileData.email);
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile data.');
      }
    };

    loadSettings();
    loadProfile();
  }, []);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await saveSystemSettings(settings, contactInfo);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleContactInfoChange = (key: string, value: string) => {
    setContactInfo(prev => ({ ...prev, [key]: value }));
  };

  const handleProfileChange = (key: string, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handlePersonalSettingChange = (key: string, value: any) => {
    setPersonalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleApiKeyChange = (key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  if (isInitialLoading) {
    return (
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading settings...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="theme">Theme & Colors</TabsTrigger>
              <TabsTrigger value="apikeys">API Keys</TabsTrigger>
              <TabsTrigger value="profile">User Profile</TabsTrigger>
              <TabsTrigger value="personal">Personal Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <GeneralSettingsTab
                settings={settings}
                contactInfo={contactInfo}
                onSettingChange={handleSettingChange}
                onContactInfoChange={handleContactInfoChange}
              />
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <SecuritySettingsTab
                settings={settings}
                onSettingChange={handleSettingChange}
              />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <NotificationsSettingsTab
                settings={settings}
                onSettingChange={handleSettingChange}
              />
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <SystemSettingsTab
                settings={settings}
                onSettingChange={handleSettingChange}
              />
            </TabsContent>

            <TabsContent value="theme" className="space-y-4">
              <ThemeSettingsTab />
            </TabsContent>

            <TabsContent value="apikeys" className="space-y-4">
              <ApiKeysTab
                apiKeys={apiKeys}
                onApiKeyChange={handleApiKeyChange}
              />
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <UserProfileTab
                profile={profile}
                originalEmail={originalEmail}
                onProfileChange={handleProfileChange}
                isLoading={isProfileLoading}
                onSave={async (updatedProfile, password) => {
                  setIsProfileLoading(true);
                  try {
                    const { saveAdminProfile } = await import('@/lib/supabase/admin-settings');
                    const emailChanged = updatedProfile.email !== originalEmail;
                    const result = await saveAdminProfile(updatedProfile, originalEmail, password);
                    
                    if (result.success) {
                      if (emailChanged) {
                        toast.success('Profile saved. Check your new email inbox to confirm the email change.', {
                          duration: 6000
                        });
                      } else {
                        toast.success('Profile updated successfully!');
                      }
                      
                      // Reload profile to get latest data
                      const { loadAdminProfile } = await import('@/lib/supabase/admin-settings');
                      const updatedProfileData = await loadAdminProfile();
                      setProfile(updatedProfileData);
                      setOriginalEmail(updatedProfileData.email);
                      return { success: true };
                    } else {
                      toast.error('Failed to update profile', {
                        description: result.error?.message
                      });
                      return { success: false, error: result.error };
                    }
                  } catch (error) {
                    console.error('Failed to save profile:', error);
                    toast.error('Failed to update profile. Please try again.');
                    return { success: false, error: error as Error };
                  } finally {
                    setIsProfileLoading(false);
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="personal" className="space-y-4">
              <PersonalSettingsTab
                personalSettings={personalSettings}
                onPersonalSettingChange={handlePersonalSettingChange}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
