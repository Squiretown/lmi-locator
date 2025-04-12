
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      <label className="text-sm font-medium mb-2 block">Search Type</label>
      <Select 
        value={searchType} 
        onValueChange={(value: 'county' | 'zip' | 'tract') => onSearchTypeChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select search type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="county">County</SelectItem>
          <SelectItem value="zip">ZIP Code</SelectItem>
          <SelectItem value="tract">Tract ID</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
