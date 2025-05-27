
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Moon, Sun, Monitor } from 'lucide-react';

const ThemeSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-3">Theme</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Choose how the interface looks for you.
        </p>
      </div>
      
      <RadioGroup value={theme} onValueChange={setTheme} className="space-y-3">
        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
          <RadioGroupItem value="light" id="light" />
          <Sun className="h-4 w-4" />
          <div className="flex-1">
            <Label htmlFor="light" className="cursor-pointer font-medium">
              Light
            </Label>
            <p className="text-sm text-muted-foreground">Light mode</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
          <RadioGroupItem value="dark" id="dark" />
          <Moon className="h-4 w-4" />
          <div className="flex-1">
            <Label htmlFor="dark" className="cursor-pointer font-medium">
              Dark
            </Label>
            <p className="text-sm text-muted-foreground">Dark mode</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
          <RadioGroupItem value="system" id="system" />
          <Monitor className="h-4 w-4" />
          <div className="flex-1">
            <Label htmlFor="system" className="cursor-pointer font-medium">
              System
            </Label>
            <p className="text-sm text-muted-foreground">Use system preference</p>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ThemeSettings;
