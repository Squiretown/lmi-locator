import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useThemeManager } from '@/hooks/useThemeManager';
import { Palette, Save, Download } from 'lucide-react';

export const ThemePresets: React.FC = () => {
  const { themePresets, applyThemePreset, saveThemePreset, themeSettings, isLoading } = useThemeManager();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');

  const handleApplyPreset = async (preset: any) => {
    await applyThemePreset(preset);
  };

  const handleSaveCurrentAsPreset = async () => {
    if (!newPresetName.trim()) return;

    const currentColors = themeSettings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.light_value; // Using light value for simplicity
      return acc;
    }, {} as Record<string, string>);

    try {
      await saveThemePreset(newPresetName, newPresetDescription, currentColors);
      setNewPresetName('');
      setNewPresetDescription('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save preset:', error);
    }
  };

  const getPresetColors = (colors: Record<string, string>) => {
    return [
      colors.primary || '#000000',
      colors.secondary || '#f1f5f9',
      colors.accent || '#f1f5f9',
      colors.destructive || '#ef4444'
    ];
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading presets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Theme Presets</h3>
          <p className="text-sm text-muted-foreground">
            Quick-apply predefined color themes or save your current settings
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Current</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Current Theme</DialogTitle>
              <DialogDescription>
                Save your current color settings as a new theme preset
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="preset-name">Preset Name</Label>
                <Input
                  id="preset-name"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="My Custom Theme"
                />
              </div>
              <div>
                <Label htmlFor="preset-description">Description</Label>
                <Textarea
                  id="preset-description"
                  value={newPresetDescription}
                  onChange={(e) => setNewPresetDescription(e.target.value)}
                  placeholder="Describe your theme..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCurrentAsPreset} disabled={!newPresetName.trim()}>
                Save Preset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themePresets.map((preset) => (
          <Card key={preset.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{preset.name}</CardTitle>
                {preset.is_default && (
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                )}
                {preset.is_custom && (
                  <Badge variant="outline" className="text-xs">Custom</Badge>
                )}
              </div>
              {preset.description && (
                <CardDescription className="text-sm">
                  {preset.description}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Color palette preview */}
              <div className="flex space-x-1">
                {getPresetColors(preset.colors).map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded border border-border"
                    style={{ backgroundColor: color }}
                    title={`Color ${index + 1}: ${color}`}
                  />
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyPreset(preset)}
                  className="flex-1"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Apply
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const dataStr = JSON.stringify(preset.colors, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${preset.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  title="Export preset"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};