
import React from 'react';
import { Button } from "@/components/ui/button";
import { Filter } from 'lucide-react';

interface ResultsFilterProps {
  showOnlyEligible: boolean;
  onFilterChange: (eligibleOnly: boolean) => void;
  resultsCount: number;
  filteredCount: number;
}

export const ResultsFilter: React.FC<ResultsFilterProps> = ({
  showOnlyEligible,
  onFilterChange,
  resultsCount,
  filteredCount
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium">Search Results ({filteredCount} Properties)</h3>
      <div className="flex items-center gap-2">
        <Button 
          variant={showOnlyEligible ? "default" : "outline"} 
          size="sm"
          onClick={() => onFilterChange(true)}
        >
          <Filter className="mr-2 h-4 w-4" />
          LMI Eligible Only
        </Button>
        <Button 
          variant={!showOnlyEligible ? "default" : "outline"} 
          size="sm"
          onClick={() => onFilterChange(false)}
        >
          Show All
        </Button>
      </div>
    </div>
  );
};
