import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/components/theme/ThemeProvider';

interface ThemeSetting {
  id: string;
  setting_key: string;
  light_value: string;
  dark_value: string;
  description?: string;
  category: string;
}

interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  colors: Record<string, string>;
  is_default: boolean;
  is_custom: boolean;
}

export const useThemeManager = () => {
  const { theme } = useTheme();
  const [themeSettings, setThemeSettings] = useState<ThemeSetting[]>([]);
  const [themePresets, setThemePresets] = useState<ThemePreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customThemesEnabled, setCustomThemesEnabled] = useState(false);

  // Load theme settings from database
  const loadThemeSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setThemeSettings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load theme settings');
    }
  };

  // Load theme presets from database
  const loadThemePresets = async () => {
    try {
      const { data, error } = await supabase
        .from('theme_presets')
        .select('*')
        .order('name');

      if (error) throw error;
      setThemePresets((data || []).map(item => ({
        ...item,
        colors: item.colors as Record<string, string>
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load theme presets');
    }
  };

  // Update a theme setting
  const updateThemeSetting = async (settingKey: string, lightValue: string, darkValue: string) => {
    try {
      const { error } = await supabase
        .from('theme_settings')
        .update({
          light_value: lightValue,
          dark_value: darkValue,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('setting_key', settingKey);

      if (error) throw error;
      
      // Update local state
      setThemeSettings(prev => 
        prev.map(setting => 
          setting.setting_key === settingKey 
            ? { ...setting, light_value: lightValue, dark_value: darkValue }
            : setting
        )
      );

      // Apply changes to CSS variables immediately
      applyThemeChanges(settingKey, theme === 'dark' ? darkValue : lightValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update theme setting');
    }
  };

  // Apply theme changes to CSS variables
  const applyThemeChanges = (settingKey: string, value: string) => {
    const root = document.documentElement;
    root.style.setProperty(`--${settingKey}`, value);
  };

  // Apply all current theme settings to CSS
  const applyAllThemeSettings = () => {
    const root = document.documentElement;
    themeSettings.forEach(setting => {
      const value = theme === 'dark' ? setting.dark_value : setting.light_value;
      root.style.setProperty(`--${setting.setting_key}`, value);
    });
  };

  // Save a new theme preset
  const saveThemePreset = async (name: string, description: string, colors: Record<string, string>) => {
    try {
      const { data, error } = await supabase
        .from('theme_presets')
        .insert({
          name,
          description,
          colors,
          is_custom: true,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setThemePresets(prev => [...prev, { ...data, colors: data.colors as Record<string, string> }]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save theme preset');
      throw err;
    }
  };

  // Apply a theme preset
  const applyThemePreset = async (preset: ThemePreset) => {
    try {
      const updates = Object.entries(preset.colors).map(([key, value]) => ({
        setting_key: key,
        light_value: value,
        dark_value: value // For simplicity, using same color for both modes
      }));

      // Update multiple settings
      for (const update of updates) {
        await updateThemeSetting(update.setting_key, update.light_value, update.dark_value);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply theme preset');
    }
  };

  // Reset to default theme
  const resetToDefault = async () => {
    const defaultPreset = themePresets.find(p => p.is_default && p.name === 'Default Theme');
    if (defaultPreset) {
      await applyThemePreset(defaultPreset);
    }
  };

  // Convert HSL string to hex for color picker
  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const lightness = l / 100;
    const saturation = s / 100;
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const huePrime = h / 60;
    const secondComponent = chroma * (1 - Math.abs(huePrime % 2 - 1));
    
    let red = 0, green = 0, blue = 0;
    
    if (huePrime >= 0 && huePrime < 1) {
      red = chroma; green = secondComponent; blue = 0;
    } else if (huePrime >= 1 && huePrime < 2) {
      red = secondComponent; green = chroma; blue = 0;
    } else if (huePrime >= 2 && huePrime < 3) {
      red = 0; green = chroma; blue = secondComponent;
    } else if (huePrime >= 3 && huePrime < 4) {
      red = 0; green = secondComponent; blue = chroma;
    } else if (huePrime >= 4 && huePrime < 5) {
      red = secondComponent; green = 0; blue = chroma;
    } else if (huePrime >= 5 && huePrime < 6) {
      red = chroma; green = 0; blue = secondComponent;
    }
    
    const lightnessAdjustment = lightness - chroma / 2;
    red = Math.round((red + lightnessAdjustment) * 255);
    green = Math.round((green + lightnessAdjustment) * 255);
    blue = Math.round((blue + lightnessAdjustment) * 255);
    
    return `#${[red, green, blue].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  };

  // Convert hex to HSL for storage
  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  // Load custom themes enabled setting
  const loadCustomThemesEnabled = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'custom_themes_enabled')
        .single();
      
      if (error) throw error;
      setCustomThemesEnabled(data?.value === 'true');
    } catch (err) {
      console.warn('Custom themes setting not found, defaulting to false');
      setCustomThemesEnabled(false);
    }
  };

  // Toggle custom themes
  const toggleCustomThemes = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ value: enabled.toString() })
        .eq('key', 'custom_themes_enabled');
      
      if (error) throw error;
      setCustomThemesEnabled(enabled);
      
      // If disabling, remove all custom CSS variables to revert to default
      if (!enabled) {
        const root = document.documentElement;
        themeSettings.forEach(setting => {
          root.style.removeProperty(`--${setting.setting_key}`);
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle custom themes');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadThemeSettings(), loadThemePresets(), loadCustomThemesEnabled()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (themeSettings.length > 0 && customThemesEnabled) {
      applyAllThemeSettings();
    }
  }, [theme, themeSettings, customThemesEnabled]);

  return {
    themeSettings,
    themePresets,
    isLoading,
    error,
    customThemesEnabled,
    updateThemeSetting,
    saveThemePreset,
    applyThemePreset,
    resetToDefault,
    toggleCustomThemes,
    hslToHex,
    hexToHsl,
    loadThemeSettings,
    loadThemePresets
  };
};