
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchType } from "./types";

interface SingleSearchFormProps {
  searchType: Exclude<SearchType, 'bulk'>;
  searchName: string;
  searchValue: string;
  onSearchNameChange: (value: string) => void;
  onSearchValueChange: (value: string) => void;
}

export const SingleSearchForm: React.FC<SingleSearchFormProps> = ({
  searchType,
  searchName,
  searchValue,
  onSearchNameChange,
  onSearchValueChange
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="searchName">Search Name</Label>
        <Input 
          id="searchName"
          placeholder="Name this search for reference"
          value={searchName}
          onChange={(e) => onSearchNameChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="searchValue">
          {searchType === 'zip_code' ? 'ZIP Code' : 
          searchType === 'city' ? 'City Name' :
          searchType === 'tract_id' ? 'Census Tract ID' : 'County Name'}
        </Label>
        <Input 
          id="searchValue"
          placeholder={`Enter ${searchType.replace('_', ' ')}`}
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
        />
      </div>
    </div>
  );
};
