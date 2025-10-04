
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CensusTract, SearchParams, StatsData, SearchResults } from './types/census-tract';
import { fetchRealData } from './services/census-api';

export const useTractSearch = () => {
  const [tracts, setTracts] = useState<CensusTract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTracts, setSelectedTracts] = useState<CensusTract[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [statsData, setStatsData] = useState<StatsData | null>(null);

  // Perform the search using real data only
  const performSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Searching with params:', params);
      
      if (!params.state && !params.county && !params.zipCode) {
        toast.error("Search parameters required", {
          description: "Please enter at least one search parameter"
        });
        setLoading(false);
        return;
      }
      
      const realData = await fetchRealData(params);
      
      if (realData) {
        setTracts(realData.tracts);
        setStatsData(realData.stats);
        setSearchResults({
          params,
          resultCount: realData.tracts.length,
          dataSource: 'real'
        });
        
        // Check for missing geometry
        const tractsWithGeometry = realData.tracts.filter(t => t.geometry && t.geometry.coordinates);
        const missingGeometry = realData.tracts.length - tractsWithGeometry.length;
        
        if (missingGeometry > 0) {
          const pct = Math.round((missingGeometry / realData.tracts.length) * 100);
          toast.warning("Geometry data incomplete", {
            description: `${missingGeometry} tracts (${pct}%) missing geometry. Use the Geometry Update Panel to fetch boundary data.`
          });
        }
        
        toast.success("Search Complete", {
          description: `Found ${realData.tracts.length} census tracts (${tractsWithGeometry.length} have map boundaries)`
        });
      } else {
        throw new Error('No census tract data found for the specified criteria');
      }
      
    } catch (err) {
      console.error('Error searching tracts:', err);
      setError('Failed to search census tracts. Please try again.');
      toast.error('Search Error', {
        description: 'Failed to search census tracts. Please try again.'
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


  return {
    tracts,
    loading,
    error,
    selectedTracts,
    setSelectedTracts,
    searchResults,
    performSearch,
    exportSelectedTracts,
    statsData
  };
};
