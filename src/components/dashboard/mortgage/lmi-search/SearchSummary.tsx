
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface SearchSummaryProps {
  summary: {
    totalTracts: number;
    lmiTracts: number;
    propertyCount: number;
    lmiPercentage?: number;
  };
  searchType: string;
  searchValue: string;
}

export const SearchSummary: React.FC<SearchSummaryProps> = ({ 
  summary, 
  searchType,
  searchValue
}) => {
  const { totalTracts, lmiTracts, propertyCount, lmiPercentage = 0 } = summary;
  const formattedPercentage = lmiPercentage ? 
    (typeof lmiPercentage === 'number' ? lmiPercentage.toFixed(1) : lmiPercentage) : 
    ((lmiTracts / totalTracts) * 100).toFixed(1);
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Search Results Summary</h3>
          <p className="text-sm text-gray-500">
            {searchType === 'county' ? 'County' : searchType === 'zip' ? 'ZIP Code' : 'Census Tract'}: <span className="font-medium text-gray-700">{searchValue}</span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Total Tracts</div>
              <div className="text-2xl font-bold">{totalTracts}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-500">LMI Tracts</div>
              <div className="text-2xl font-bold text-blue-600">{lmiTracts}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-500">LMI Percentage</div>
              <div className="text-2xl font-bold text-green-600">{formattedPercentage}%</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm text-purple-500">Properties</div>
              <div className="text-2xl font-bold text-purple-600">{propertyCount}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
