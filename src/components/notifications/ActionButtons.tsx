
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Save, LogIn } from 'lucide-react';

interface ActionButtonsProps {
  onShare?: () => void;
  onSave?: () => void;
  onSignUp?: () => void;
  isLoggedIn?: boolean;
}

export const ActionButtons = ({ onShare, onSave, onSignUp, isLoggedIn }: ActionButtonsProps) => {
  console.log('ActionButtons - isLoggedIn:', isLoggedIn);
  
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {onShare && (
        <Button variant="outline" onClick={onShare} className="flex-1">
          <Share2 className="mr-2 h-4 w-4" />
          Share Results
        </Button>
      )}
      
      {!isLoggedIn && onSignUp && (
        <Button onClick={onSignUp} className="flex-1 bg-blue-600 hover:bg-blue-700">
          <LogIn className="mr-2 h-4 w-4" />
          Create Account
        </Button>
      )}
      
      {isLoggedIn && onSave && (
        <Button onClick={onSave} className="flex-1 bg-green-600 hover:bg-green-700">
          <Save className="mr-2 h-4 w-4" />
          Save Property
        </Button>
      )}
    </div>
  );
};
