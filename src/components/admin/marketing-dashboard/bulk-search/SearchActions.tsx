
import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, Download, RefreshCw } from 'lucide-react';

interface SearchActionsProps {
  onSearch: () => void;
  onExport: () => void;
  isLoading: boolean;
  disabled: boolean;
  canExport: boolean;
}

export const SearchActions: React.FC<SearchActionsProps> = ({
  onSearch,
  onExport,
  isLoading,
  disabled,
  canExport
}) => {
  return (
    <div className="flex justify-between mt-6 gap-2">
      <Button 
        onClick={onSearch} 
        disabled={isLoading || disabled}
        className="flex-1"
      >
        {isLoading ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Search Properties
          </>
        )}
      </Button>
      
      <Button 
        onClick={onExport} 
        disabled={!canExport}
        variant="outline"
      >
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
};
