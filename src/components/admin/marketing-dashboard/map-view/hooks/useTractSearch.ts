
import { useState, useEffect } from 'react';
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
  ]
};

// Sample geometric data for visualizing tracts
const sampleGeometries = [
  {
    // Miami-Dade sample tract
    coordinates: [[
      [-80.2, 25.8], [-80.1, 25.8], [-80.1, 25.9], [-80.2, 25.9], [-80.2, 25.8]
    ]],
    type: 'Polygon'
  },
  {
    // Another Miami-Dade tract
    coordinates: [[
      [-80.3, 25.7], [-80.2, 25.7], [-80.2, 25.8], [-80.3, 25.8], [-80.3, 25.7]
    ]],
    type: 'Polygon'
  },
  {
    // Broward County sample tract
    coordinates: [[
      [-80.4, 26.1], [-80.3, 26.1], [-80.3, 26.2], [-80.4, 26.2], [-80.4, 26.1]
    ]],
    type: 'Polygon'
  }
];

export const useTractSearch = () => {
  const { toast } = useToast();
  const [tracts, setTracts] = useState<CensusTract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTracts, setSelectedTracts] = useState<CensusTract[]>([]);
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [statsData, setStatsData] = useState<any | null>(null);

  // In a real implementation, this would call a Supabase function or API
  // For demo purposes, we'll use mock data
  const performSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Searching with params:', params);
      
      // In a real implementation, this would make an API call to get tract data
      // For demo, we'll create some sample data based on the search params
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
    statsData
  };
};
