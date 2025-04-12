
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CountySelectorProps {
  searchValue: string;
  counties: Array<{fips: string, name: string}>;
  onSearchValueChange: (value: string) => void;
}

export const CountySelector: React.FC<CountySelectorProps> = ({ 
  searchValue, 
  counties, 
  onSearchValueChange 
}) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">County</label>
      <Select
        value={searchValue}
        onValueChange={onSearchValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a county" />
        </SelectTrigger>
        <SelectContent>
          {counties.map(county => (
            <SelectItem key={county.fips} value={county.fips}>
              {county.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
