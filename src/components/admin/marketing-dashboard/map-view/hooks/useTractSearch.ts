import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define a simple type for a census tract
interface CensusTract {
  tractId: string;
  isLmiEligible: boolean;
  amiPercentage: number;
  medianIncome: number;
  incomeCategory: string;
  propertyCount: number;
  geometry: any;
}

// Define search parameters
interface SearchParams {
  state?: string;
  county?: string;
  zipCode?: string;
  radius?: number;
}

// Mock state and county data for demo purposes
const STATES = [
  { code: 'FL', name: 'Florida' },
  { code: 'CA', name: 'California' },
  { code: 'TX', name: 'Texas' },
  { code: 'NY', name: 'New York' },
  { code: 'IL', name: 'Illinois' },
];

const COUNTIES_BY_STATE: Record<string, Array<{fips: string, name: string}>> = {
  'FL': [
    { fips: '12086', name: 'Miami-Dade County' },
    { fips: '12011', name: 'Broward County' },
    { fips: '12099', name: 'Palm Beach County' },
    { fips: '12057', name: 'Hillsborough County' },
    { fips: '12095', name: 'Orange County' },
  ],
  'CA': [
    { fips: '06037', name: 'Los Angeles County' },
    { fips: '06073', name: 'San Diego County' },
    { fips: '06059', name: 'Orange County' },
    { fips: '06085', name: 'Santa Clara County' },
  ],
  'TX': [
    { fips: '48201', name: 'Harris County' },
    { fips: '48113', name: 'Dallas County' },
    { fips: '48029', name: 'Bexar County' },
    { fips: '48439', name: 'Tarrant County' },
  ],
  'NY': [
    { fips: '36061', name: 'New York County' },
    { fips: '36047', name: 'Kings County' },
    { fips: '36059', name: 'Nassau County' },
    { fips: '36103', name: 'Suffolk County' },
  ],
  'IL': [
    { fips: '17031', name: 'Cook County' },
    { fips: '17043', name: 'DuPage County' },
    { fips: '17089', name: 'Kane County' },
    { fips: '17097', name: 'Lake County' },
  ]
};

export const useTractSearch = () => {
  const { toast } = useToast();
  const [tracts, setTracts] = useState<CensusTract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTracts, setSelectedTracts] = useState<CensusTract[]>([]);
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [statsData, setStatsData] = useState<any | null>(null);
  const [useRealData, setUseRealData] = useState(true);

  // Function to get counties for a state - safely handling potential undefined values
  const getCountiesForState = useCallback((stateCode: string) => {
    return COUNTIES_BY_STATE[stateCode] || [];
  }, []);

  // Fetch real data from Supabase
  const fetchRealData = async (params: SearchParams) => {
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
  };

  // Generate a random geometry near the state's approximate location
  const generateRandomGeometry = (stateCode: string) => {
    // Approximate center points for states
    const stateCenters: Record<string, [number, number]> = {
      'FL': [-81.5, 28.1],
      'CA': [-119.4, 37.8],
      'TX': [-99.3, 31.4],
      'NY': [-75.5, 42.9],
      'IL': [-89.3, 40.0]
    };

    const center = stateCenters[stateCode] || [-95.7, 39.8]; // Default to center of US
    
    // Generate random polygon near center
    const offsetX = (Math.random() - 0.5) * 0.4;
    const offsetY = (Math.random() - 0.5) * 0.4;
    
    return {
      type: 'Polygon',
      coordinates: [[
        [center[0] + offsetX - 0.05, center[1] + offsetY - 0.05],
        [center[0] + offsetX + 0.05, center[1] + offsetY - 0.05],
        [center[0] + offsetX + 0.05, center[1] + offsetY + 0.05],
        [center[0] + offsetX - 0.05, center[1] + offsetY + 0.05],
        [center[0] + offsetX - 0.05, center[1] + offsetY - 0.05]
      ]]
    };
  };

  // Perform the search using real or mock data
  const performSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Searching with params:', params);
      
      // Always try to get real data first regardless of useRealData flag
      const realData = await fetchRealData(params);
      
      if (realData) {
        // If we got real data, use it
        setTracts(realData.tracts);
        setStatsData(realData.stats);
        setSearchResults({
          params,
          resultCount: realData.tracts.length,
          dataSource: 'real'
        });
        
        toast({
          title: "Search Complete",
          description: `Found ${realData.tracts.length} census tracts using real data`,
        });
        
        setLoading(false);
        return;
      } else if (useRealData) {
        // If we want real data but didn't get any, show an error
        console.warn('No real data available, falling back to mock data');
        
        if (!params.state && !params.county && !params.zipCode) {
          toast({
            title: "Search parameters required",
            description: "Please enter at least one search parameter",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        toast({
          title: "Using mock data",
          description: "Couldn't retrieve real data, using simulated results instead",
          variant: "warning",
        });
      }
      
      // Fall back to mock data
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate some random tracts based on search parameters
      const mockTracts: CensusTract[] = [];
      
      // Create 20 mock tracts
      for (let i = 0; i < 20; i++) {
        const tractId = `${params.county || '12086'}${100000 + i}`;
        const isLmiEligible = Math.random() > 0.4; // 60% are LMI eligible
        const amiPercentage = isLmiEligible 
          ? Math.floor(Math.random() * 30) + 50 // 50-80% for eligible
          : Math.floor(Math.random() * 40) + 81; // 81-120% for non-eligible
        
        const medianIncome = amiPercentage * 1000;
        
        let incomeCategory;
        if (amiPercentage <= 30) incomeCategory = 'Extremely Low';
        else if (amiPercentage <= 50) incomeCategory = 'Very Low';
        else if (amiPercentage <= 80) incomeCategory = 'Low';
        else if (amiPercentage <= 120) incomeCategory = 'Moderate';
        else incomeCategory = 'Above Moderate';
        
        const propertyCount = Math.floor(Math.random() * 5000) + 1000;
        
        // Use one of our sample geometries, adding small random offset
        const baseGeometry = sampleGeometries[i % sampleGeometries.length];
        const offsetX = (Math.random() - 0.5) * 0.2;
        const offsetY = (Math.random() - 0.5) * 0.2;
        
        const geometry = {
          type: baseGeometry.type,
          coordinates: baseGeometry.coordinates.map(ring => 
            ring.map(([x, y]) => [x + offsetX, y + offsetY])
          )
        };
        
        mockTracts.push({
          tractId,
          isLmiEligible,
          amiPercentage,
          medianIncome,
          incomeCategory,
          propertyCount,
          geometry
        });
      }
      
      setTracts(mockTracts);
      
      // Calculate statistics
      const lmiTracts = mockTracts.filter(t => t.isLmiEligible).length;
      const totalPropertyCount = mockTracts.reduce((sum, t) => sum + t.propertyCount, 0);
      
      setStatsData({
        totalTracts: mockTracts.length,
        lmiTracts,
        propertyCount: totalPropertyCount,
        lmiPercentage: Math.round((lmiTracts / mockTracts.length) * 100)
      });
      
      setSearchResults({
        params,
        resultCount: mockTracts.length
      });
      
    } catch (err) {
      console.error('Error searching tracts:', err);
      setError('Failed to search census tracts. Please try again.');
      toast({
        title: 'Search Error',
        description: 'Failed to search census tracts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Export selected tracts for marketing
  const exportSelectedTracts = async () => {
    // In a real implementation, this would save to the database
    // For demo, we'll just return the selected tracts
    
    if (selectedTracts.length === 0) {
      throw new Error('No tracts selected for export');
    }
    
    try {
      // In a real implementation, this would call a Supabase function
      console.log('Exporting tracts:', selectedTracts);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return selectedTracts;
    } catch (err) {
      console.error('Error exporting tracts:', err);
      throw new Error('Failed to export selected tracts');
    }
  };

  // Toggle between real and mock data sources
  const toggleDataSource = () => {
    setUseRealData(!useRealData);
    toast({
      title: `Using ${!useRealData ? 'Real' : 'Mock'} Data`,
      description: `Switched to ${!useRealData ? 'real' : 'mock'} data source for tract searches.`,
    });
  };

  return {
    tracts,
    loading,
    error,
    counties: COUNTIES_BY_STATE,
    states: STATES,
    selectedTracts,
    setSelectedTracts,
    searchResults,
    performSearch,
    exportSelectedTracts,
    statsData,
    getCountiesForState,
    useRealData,
    toggleDataSource
  };
};
