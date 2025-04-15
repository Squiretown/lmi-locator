
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SearchSummaryProps {
  summary: {
    totalTracts: number;
    lmiTracts: number;
    propertyCount: number;
    lmiPercentage?: number;
  };
  searchType: string;
  searchValue: string;
}

export const SearchSummary: React.FC<SearchSummaryProps> = ({ summary, searchType, searchValue }) => {
  const lmiPercentage = summary.lmiPercentage || 
    (summary.totalTracts > 0 ? Math.round((summary.lmiTracts / summary.totalTracts) * 100) : 0);
  
  const formatSearchType = (type: string): string => {
    switch (type) {
      case 'county': return 'County';
      case 'zip': return 'ZIP Code';
      case 'tract': return 'Census Tract';
      default: return type;
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Search Results for {formatSearchType(searchType)}: <span className="font-medium text-foreground">{searchValue}</span></span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div className="bg-background p-4 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold">{summary.totalTracts.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Tracts</div>
              </div>
              
              <div className="bg-background p-4 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-green-600">{summary.lmiTracts.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">LMI Eligible Tracts</div>
              </div>
              
              <div className="bg-background p-4 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold">{summary.propertyCount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Properties</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">LMI Percentage</span>
              <span className="text-sm font-medium">{lmiPercentage}%</span>
            </div>
            <Progress value={lmiPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {lmiPercentage}% of census tracts in this area qualify as Low-to-Moderate Income
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
