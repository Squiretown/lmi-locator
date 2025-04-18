
import React from 'react';
import { Mail, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  onShare?: () => void;
  onSave?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onShare,
  onSave
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {onShare && (
        <Button variant="outline" onClick={onShare} className="flex-1">
          <Mail className="mr-2 h-4 w-4" />
          Share via Email
        </Button>
      )}
      
      {onSave && (
        <Button 
          variant="outline"
          onClick={onSave} 
          className="flex-1"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Property
        </Button>
      )}
    </div>
  );
};
