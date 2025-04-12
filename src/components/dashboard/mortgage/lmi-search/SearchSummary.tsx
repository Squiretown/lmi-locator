
import React from 'react';

interface SearchSummaryProps {
  summary: {
    totalTracts: number;
    lmiTracts: number;
    propertyCount: number;
  };
}

export const SearchSummary: React.FC<SearchSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-muted rounded-md p-4">
      <h3 className="text-lg font-medium mb-4">Search Results Summary</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{summary.totalTracts}</div>
          <div className="text-sm text-muted-foreground">Total Tracts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{summary.lmiTracts}</div>
          <div className="text-sm text-muted-foreground">LMI Eligible Tracts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{summary.propertyCount.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Estimated Properties</div>
        </div>
      </div>
    </div>
  );
};
