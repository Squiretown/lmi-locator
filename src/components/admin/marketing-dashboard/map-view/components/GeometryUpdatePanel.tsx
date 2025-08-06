import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, MapPin, Database } from 'lucide-react';

interface UpdateProgress {
  state: string;
  processed: number;
  updated: number;
  failed: number;
  hasMore: boolean;
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
              <span>Updating {progress.state}...</span>
              <span>{progress.processed} processed, {progress.updated} updated</span>
            </div>
            <Progress value={overallProgress} className="w-full" />
          </div>
        )}

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
              {isUpdating && progress?.state === state ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Update {state}
            </Button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          Updates are performed in small batches to avoid rate limiting. 
          This process may take several minutes per state.
        </div>
      </CardContent>
    </Card>
  );
};