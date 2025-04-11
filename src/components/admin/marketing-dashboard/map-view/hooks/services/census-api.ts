
import { supabase } from '@/integrations/supabase/client';
import { CensusTract, SearchParams, StatsData } from '../types/census-tract';

export async function fetchRealData(params: SearchParams): Promise<{
  tracts: CensusTract[],
  stats: StatsData
} | null> {
  try {
    // Check if we have a Supabase connection
    if (!supabase) {
      console.log('Supabase client not available, falling back to mock data');
      return null;
    }

    console.log('Attempting to fetch real tract data for:', params);
    
    // Call census-db edge function
    const { data, error } = await supabase.functions.invoke('census-db', {
      body: { 
        action: 'searchBatch',
        params: {
          state: params.state,
          county: params.county,
          zipCode: params.zipCode,
          radius: params.radius
        }
      }
    });

    if (error) {
      console.error('Error calling census-db function:', error);
      return null;
    }

    console.log('Real data response:', data);
    
    if (data && data.tracts && Array.isArray(data.tracts)) {
      return {
        tracts: data.tracts,
        stats: data.summary || {
          totalTracts: data.tracts.length,
          lmiTracts: data.tracts.filter((t: any) => t.isLmiEligible).length,
          propertyCount: data.tracts.reduce((sum: number, t: any) => sum + (t.propertyCount || 0), 0),
          lmiPercentage: Math.round((data.tracts.filter((t: any) => t.isLmiEligible).length / data.tracts.length) * 100)
        }
      };
    }
    return null;
  } catch (err) {
    console.error('Error fetching real data:', err);
    return null;
  }
}
