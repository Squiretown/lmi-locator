import React from 'react';
import { Info, Clock, Database, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LmiResult } from '@/lib/api/lmi/types';

interface DataSourceInfoProps {
  result: LmiResult;
  compact?: boolean;
}

export const DataSourceInfo: React.FC<DataSourceInfoProps> = ({ result, compact = false }) => {
  const getDataAge = (lastUpdated?: string) => {
    if (!lastUpdated) return null;
    const updatedDate = new Date(lastUpdated);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 30) return 'Current';
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months old`;
    return `${Math.floor(diffInDays / 365)} years old`;
  };

  const isDataOld = (lastUpdated?: string) => {
    if (!lastUpdated) return false;
    const updatedDate = new Date(lastUpdated);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays > 730; // 2 years
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info size={14} />
              <span>Data: {result.data_vintage || 'Unknown'}</span>
              {isDataOld(result.data_last_updated) && (
                <Badge variant="secondary" className="text-xs">
                  Old Data
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="space-y-2">
              <div className="font-medium">Data Source Information</div>
              <div className="text-sm space-y-1">
                <div><strong>Source:</strong> {result.data_source || 'HUD LMI Summary Data'}</div>
                <div><strong>Vintage:</strong> {result.data_vintage || 'Unknown'}</div>
                <div><strong>Collection:</strong> {result.data_collection_period || 'Unknown'}</div>
                <div><strong>Provider:</strong> {result.data_provider || 'HUD via ArcGIS'}</div>
                {result.data_last_updated && (
                  <div><strong>Age:</strong> {getDataAge(result.data_last_updated)}</div>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
      <div className="flex items-center gap-2 font-medium text-sm">
        <Database size={16} />
        Data Source Information
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-muted-foreground" />
            <div>
              <div className="font-medium">Primary Source</div>
              <div className="text-muted-foreground">{result.data_source || 'HUD LMI Summary Data'}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground" />
            <div>
              <div className="font-medium">Data Vintage</div>
              <div className="text-muted-foreground flex items-center gap-2">
                {result.data_vintage || 'Unknown'}
                {isDataOld(result.data_last_updated) && (
                  <Badge variant="secondary" className="text-xs">
                    Old Data
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <div className="font-medium">Collection Period</div>
            <div className="text-muted-foreground">{result.data_collection_period || 'Unknown'}</div>
          </div>
          
          <div>
            <div className="font-medium">Provider</div>
            <div className="text-muted-foreground">{result.data_provider || 'HUD via ArcGIS'}</div>
          </div>
        </div>
      </div>
      
      {result.census_data_vintage && (
        <div className="pt-3 border-t">
          <div className="text-sm">
            <div className="font-medium mb-2">Additional Census Data</div>
            <div className="text-muted-foreground">
              Median income from {result.census_provider || 'U.S. Census Bureau'} 
              {result.census_data_vintage && ` (${result.census_data_vintage})`}
              {result.census_collection_period && ` - ${result.census_collection_period}`}
            </div>
          </div>
        </div>
      )}
      
      {result.data_methodology && (
        <div className="pt-3 border-t">
          <div className="text-sm">
            <div className="font-medium mb-1">Methodology</div>
            <div className="text-muted-foreground">{result.data_methodology}</div>
          </div>
        </div>
      )}
    </div>
  );
};