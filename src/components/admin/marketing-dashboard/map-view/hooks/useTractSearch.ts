
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CensusTract, SearchParams, StatsData, SearchResults } from './types/census-tract';
import { COUNTIES_BY_STATE, STATES } from './data/mock-data';
import { fetchRealData } from './services/census-api';
import { generateMockTracts } from './services/mock-data-generator';

export const useTractSearch = () => {
  const { toast } = useToast();
  const [tracts, setTracts] = useState<CensusTract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTracts, setSelectedTracts] = useState<CensusTract[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [useRealData, setUseRealData] = useState(true);

  // Function to get counties for a state - safely handling potential undefined values
  const getCountiesForState = useCallback((stateCode: string) => {
    return COUNTIES_BY_STATE[stateCode] || [];
  }, []);

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
          variant: "default",
        });
      }
      
      // Fall back to mock data
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data
      const mockData = generateMockTracts(params);
      
      setTracts(mockData.tracts);
      setStatsData(mockData.stats);
      
      setSearchResults({
        params,
        resultCount: mockData.tracts.length
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
