import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useThemeManager } from '@/hooks/useThemeManager';
import { useTheme } from '@/components/theme/ThemeProvider';
import { ColorPicker } from '@/components/admin/ColorPicker';
import { ThemePreview } from '@/components/admin/ThemePreview';
import { ThemePresets } from '@/components/admin/ThemePresets';
import { RefreshCw, Palette, Save, RotateCcw } from 'lucide-react';
import { toast } from "sonner";

export const ThemeSettingsTab: React.FC = () => {
  const { theme } = useTheme();
  const {
    themeSettings,
    isLoading,
    error,
    updateThemeSetting,
    resetToDefault,
    hslToHex,
    hexToHsl,
    loadThemeSettings
  } = useThemeManager();
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localChanges, setLocalChanges] = useState<Record<string, { light: string; dark: string }>>({});

  const handleColorChange = (settingKey: string, mode: 'light' | 'dark', hexValue: string) => {
    const hslValue = hexToHsl(hexValue);
    
    setLocalChanges(prev => ({
      ...prev,
      [settingKey]: {
        ...prev[settingKey],
        [mode]: hslValue
      }
    }));
    
    setHasUnsavedChanges(true);
  };

  const saveChanges = async () => {
    try {
      for (const [settingKey, values] of Object.entries(localChanges)) {
        const setting = themeSettings.find(s => s.setting_key === settingKey);
        if (setting) {
          await updateThemeSetting(
            settingKey,
            values.light || setting.light_value,
            values.dark || setting.dark_value
          );
        }
      }
      
      setLocalChanges({});
      setHasUnsavedChanges(false);
      
      toast.success("Theme Updated", {
        description: "Your color changes have been saved successfully.",
      });
    } catch (err) {
      toast.error("Error", {
        description: "Failed to save theme changes. Please try again.",
      });
    }
  };

  const discardChanges = () => {
    setLocalChanges({});
    setHasUnsavedChanges(false);
    loadThemeSettings();
  };

  const handleResetToDefault = async () => {
    try {
      await resetToDefault();
      setLocalChanges({});
      setHasUnsavedChanges(false);
      
      toast.success("Theme Reset", {
        description: "Theme has been reset to default colors.",
      });
    } catch (err) {
      toast.error("Error", {
        description: "Failed to reset theme. Please try again.",
      });
    }
  };

  const getCurrentValue = (setting: any, mode: 'light' | 'dark') => {
    const localValue = localChanges[setting.setting_key]?.[mode];
    if (localValue) return hslToHex(localValue);
    
    const dbValue = mode === 'light' ? setting.light_value : setting.dark_value;
    return hslToHex(dbValue);
  };

  const colorCategories = {
    primary: themeSettings.filter(s => s.setting_key.includes('primary')),
    secondary: themeSettings.filter(s => s.setting_key.includes('secondary')),
    accent: themeSettings.filter(s => s.setting_key.includes('accent')),
    muted: themeSettings.filter(s => s.setting_key.includes('muted')),
    background: themeSettings.filter(s => s.setting_key.includes('background') || s.setting_key.includes('foreground')),
    borders: themeSettings.filter(s => s.setting_key.includes('border') || s.setting_key.includes('input') || s.setting_key.includes('ring')),
    destructive: themeSettings.filter(s => s.setting_key.includes('destructive'))
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Loading theme settings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/10">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Theme & Colors</h3>
          <p className="text-sm text-muted-foreground">
            Customize the application's color scheme and visual appearance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <>
              <Button variant="outline" onClick={discardChanges}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Discard
              </Button>
              <Button onClick={saveChanges}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
          <Button variant="destructive" onClick={handleResetToDefault}>
            Reset to Default
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="colors">
            <Palette className="w-4 h-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {Object.entries(colorCategories).map(([category, settings]) => {
                if (settings.length === 0) return null;
                
                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-base capitalize">{category} Colors</CardTitle>
                      <CardDescription>
                        Configure {category} color variations for light and dark themes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {settings.map((setting) => (
                        <div key={setting.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium capitalize">
                              {setting.setting_key.replace(/-/g, ' ')}
                            </h4>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <ColorPicker
                              label="Light Mode"
                              value={getCurrentValue(setting, 'light')}
                              onChange={(hex) => handleColorChange(setting.setting_key, 'light', hex)}
                              description={setting.description}
                            />
                            <ColorPicker
                              label="Dark Mode"
                              value={getCurrentValue(setting, 'dark')}
                              onChange={(hex) => handleColorChange(setting.setting_key, 'dark', hex)}
                            />
                          </div>
                          
                          <Separator />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="lg:sticky lg:top-4">
              <ThemePreview />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <ThemePresets />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ThemePreview />
            <Card>
              <CardHeader>
                <CardTitle>Theme Information</CardTitle>
                <CardDescription>
                  Current theme mode: <strong className="capitalize">{theme}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>• Colors automatically adapt to light/dark mode</p>
                  <p>• Changes are applied in real-time</p>
                  <p>• All changes are saved per theme mode</p>
                  <p>• Export and import theme presets available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};