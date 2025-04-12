
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SearchTypeSelectorProps {
  searchType: 'county' | 'zip' | 'tract';
  onSearchTypeChange: (value: 'county' | 'zip' | 'tract') => void;
}

export const SearchTypeSelector: React.FC<SearchTypeSelectorProps> = ({ 
  searchType, 
  onSearchTypeChange 
}) => {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <label className="text-sm font-medium">Search Type</label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Select how you want to search for LMI-eligible census tracts</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Select 
        value={searchType} 
        onValueChange={(value: 'county' | 'zip' | 'tract') => onSearchTypeChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select search type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="county">
            <div>
              <div className="font-medium">County</div>
              <div className="text-xs text-muted-foreground">Search all census tracts within a county</div>
            </div>
          </SelectItem>
          <SelectItem value="zip">
            <div>
              <div className="font-medium">ZIP Code</div>
              <div className="text-xs text-muted-foreground">Search census tracts within a specific ZIP code area</div>
            </div>
          </SelectItem>
          <SelectItem value="tract">
            <div>
              <div className="font-medium">Tract ID</div>
              <div className="text-xs text-muted-foreground">Directly search using a census tract ID (e.g. 06037234100)</div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      <div className="mt-2 text-xs text-muted-foreground">
        {searchType === 'county' && (
          <p>Search for all LMI-eligible census tracts within a specific county. This provides a comprehensive view of all opportunities in the area.</p>
        )}
        {searchType === 'zip' && (
          <p>Search for LMI-eligible census tracts within a ZIP code. Useful for targeting specific neighborhoods or postal areas.</p>
        )}
        {searchType === 'tract' && (
          <p>Search using a specific census tract ID. This is the most precise search when you already know the exact tract you're interested in.</p>
        )}
      </div>
    </div>
  );
};
