import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, MapPin, Database } from 'lucide-react';

interface UpdateProgress {
  state: string;
  county?: string;
  processed: number;
  updated: number;
  failed: number;
  hasMore: boolean;
  totalExpected?: number;
  currentBatch?: number;
  totalBatches?: number;
  startTime?: number;
}

export const GeometryUpdatePanel: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  const updateGeometryForState = async (state: string) => {
    try {
      setIsUpdating(true);
      setProgress(null);
      
      let totalProcessed = 0;
      let totalUpdated = 0;
      let hasMore = true;
      
      while (hasMore) {
        const { data, error } = await supabase.functions.invoke('census-geometry', {
          body: {
            action: 'updateGeometry',
            state,
            batchSize: 25
          }
        });

        if (error) throw error;

        totalProcessed += data.processed;
        totalUpdated += data.updated;
        hasMore = data.hasMore;

        setProgress({
          state,
          processed: totalProcessed,
          updated: totalUpdated,
          failed: data.failed || 0,
          hasMore
        });

        // Update overall progress (rough estimate)
        setOverallProgress(Math.min((totalProcessed / 1000) * 100, 95));

        if (hasMore) {
          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setOverallProgress(100);
      toast.success(`Geometry update completed for ${state}`, {
        description: `Updated ${totalUpdated} tracts out of ${totalProcessed} processed`
      });

    } catch (error) {
      console.error('Error updating geometry:', error);
      toast.error('Failed to update geometry', {
        description: error.message
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateGeometryForCounty = async (state: string, county: string, totalExpected: number) => {
    try {
      setIsUpdating(true);
      setProgress(null);
      setOverallProgress(0);
      
      let totalProcessed = 0;
      let totalUpdated = 0;
      let hasMore = true;
      let batchNumber = 0;
      const batchSize = 25;
      const estimatedBatches = Math.ceil(totalExpected / batchSize);
      const startTime = Date.now();
      
      while (hasMore) {
        batchNumber++;
        
        const { data, error } = await supabase.functions.invoke('census-geometry', {
          body: {
            action: 'updateGeometry',
            state,
            county,
            batchSize
          }
        });

        if (error) throw error;

        totalProcessed += data.processed;
        totalUpdated += data.updated;
        hasMore = data.hasMore;

        const percentComplete = Math.min((totalProcessed / totalExpected) * 100, 100);
        setOverallProgress(percentComplete);

        setProgress({
          state,
          county,
          processed: totalProcessed,
          updated: totalUpdated,
          failed: data.failed || 0,
          hasMore,
          totalExpected,
          currentBatch: batchNumber,
          totalBatches: estimatedBatches,
          startTime
        });

        if (hasMore) {
          // 1 second delay between batches
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setOverallProgress(100);
      toast.success(`✅ Geometry update completed`, {
        description: `Updated ${totalUpdated}/${totalExpected} Suffolk County tracts`
      });

    } catch (error) {
      console.error('Error updating geometry:', error);
      toast.error('Failed to update geometry', {
        description: error.message
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const commonStates = ['CA', 'TX', 'FL', 'NY', 'PA'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Census Tract Geometry Updates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Census tracts need geometry data to display boundaries on the map. 
          Click below to fetch and populate geometry data from Census Bureau APIs.
        </div>

        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {progress.county ? `${progress.state} County ${progress.county}` : progress.state}
              </span>
              <span className="text-muted-foreground">
                {progress.totalExpected 
                  ? `${progress.updated}/${progress.totalExpected} tracts`
                  : `${progress.processed} processed`
                }
              </span>
            </div>
            
            {progress.currentBatch && progress.totalBatches && (
              <div className="text-xs text-muted-foreground">
                Batch {progress.currentBatch}/{progress.totalBatches}
                {progress.startTime && progress.currentBatch > 1 && (
                  (() => {
                    const elapsed = (Date.now() - progress.startTime) / 1000;
                    const avgTimePerBatch = elapsed / progress.currentBatch;
                    const remainingBatches = progress.totalBatches - progress.currentBatch;
                    const estimatedTimeLeft = Math.ceil(avgTimePerBatch * remainingBatches / 60);
                    return estimatedTimeLeft > 0 ? ` • ~${estimatedTimeLeft} min remaining` : '';
                  })()
                )}
              </div>
            )}
            
            <Progress value={overallProgress} className="w-full" />
            <div className="text-xs text-right text-muted-foreground">
              {Math.round(overallProgress)}%
            </div>
          </div>
        )}

        <div className="space-y-2">
          {/* Suffolk County Button */}
          <Button
            variant="default"
            size="sm"
            onClick={() => updateGeometryForCounty('NY', '103', 385)}
            disabled={isUpdating}
            className="w-full flex items-center gap-2"
          >
            {isUpdating && progress?.county === '103' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            Update NY Suffolk County (385 tracts)
          </Button>

          {/* State-wide Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {commonStates.map(state => (
              <Button
                key={state}
                variant="outline"
                size="sm"
                onClick={() => updateGeometryForState(state)}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                {isUpdating && progress?.state === state && !progress?.county ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Update {state}
              </Button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Updates are performed in small batches to avoid rate limiting. 
          County updates take ~8-10 minutes for 385 tracts.
        </div>
      </CardContent>
    </Card>
  );
};