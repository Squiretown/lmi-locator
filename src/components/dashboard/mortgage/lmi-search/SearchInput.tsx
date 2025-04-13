
import React from 'react';
import { Input } from '@/components/ui/input';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SearchInputProps {
  searchType: 'zip' | 'tract';
  searchValue: string;
  onSearchValueChange: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  searchType, 
  searchValue, 
  onSearchValueChange 
}) => {
  const getInputPattern = () => {
    if (searchType === 'zip') {
      return "\\d{5}";  // 5-digit number for ZIP codes
    } else if (searchType === 'tract') {
      return "[0-9]{11}";  // 11-digit number for census tract IDs
    }
    return undefined;
  };

  const getInputMaxLength = () => {
    if (searchType === 'zip') {
      return 5;
    } else if (searchType === 'tract') {
      return 11;
    }
    return undefined;
  };

  const getHelperText = () => {
    if (searchType === 'zip') {
      return "Enter a 5-digit ZIP code";
    } else if (searchType === 'tract') {
      return "Enter an 11-digit census tract ID (e.g., 36103169901)";
    }
    return "";
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium">
          {searchType === 'zip' ? 'ZIP Code' : 'Census Tract ID'}
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{getHelperText()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Input
        value={searchValue}
        onChange={(e) => onSearchValueChange(e.target.value)}
        placeholder={searchType === 'zip' ? 'Enter ZIP code (e.g., 90210)' : 'Enter census tract ID (e.g., 36103169901)'}
        pattern={getInputPattern()}
        maxLength={getInputMaxLength()}
      />
      
      <p className="text-xs text-muted-foreground mt-2">
        {getHelperText()}
      </p>
    </div>
  );
};
