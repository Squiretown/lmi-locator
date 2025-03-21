
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/supabase-api";
import { SearchHistory } from '@/lib/types';
import { Chart } from "@/components/ui/chart";
import LoadingSpinner from "@/components/LoadingSpinner";
import { parseJsonData, parseSearchHistory } from '@/lib/supabase-utils';

// Define the interface for dashboard statistics
interface DashboardStats {
  totalSearches: number;
  lmiProperties: number;
  lmiPercentage: number;
  recentSearches: SearchHistory[];
  popularZipCodes: Array<{zipCode: string, count: number}>;
}

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSearches: 0,
    lmiProperties: 0,
    lmiPercentage: 0,
    recentSearches: [],
    popularZipCodes: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardStats();
        
        if (data?.searchHistory) {
          const totalSearches = data.searchHistory.length;
          const lmiProperties = data.searchHistory.filter(s => s.is_eligible).length;
          const lmiPercentage = totalSearches > 0 ? (lmiProperties / totalSearches) * 100 : 0;
          
          // Extract zip codes for visualization
          const zipCodeCounts: Record<string, number> = {};
          data.searchHistory.forEach(search => {
            try {
              // Try to extract zip code from address or result
              let zipCode = '';
              
              // Try to parse result if it's a string
              const result = parseJsonData(search.result);
              
              if (result && result.address) {
                const addressParts = result.address.split(',');
                if (addressParts.length > 0) {
                  const lastPart = addressParts[addressParts.length - 1].trim();
                  const zipMatch = lastPart.match(/\d{5}/);
                  if (zipMatch) {
                    zipCode = zipMatch[0];
                  }
                }
              }
              
              if (zipCode) {
                zipCodeCounts[zipCode] = (zipCodeCounts[zipCode] || 0) + 1;
              }
            } catch (e) {
              console.error('Error parsing search result:', e);
            }
          });
          
          // Convert to array for chart
          const popularZipCodes = Object.entries(zipCodeCounts)
            .map(([zipCode, count]) => ({ zipCode, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
          
          // Process search history data
          const parsedSearchHistory = data.searchHistory.map(search => 
            parseSearchHistory(search)
          ) as SearchHistory[];
          
          setStats({
            totalSearches,
            lmiProperties,
            lmiPercentage,
            recentSearches: parsedSearchHistory.slice(0, 10),
            popularZipCodes
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Prepare data for charts
  const zipCodeChartData = stats.popularZipCodes?.map(item => ({
    name: item.zipCode,
    data: item.count
  })) || [];

  const lmiStatusData = [
    { name: 'LMI Eligible', data: stats.lmiProperties },
    { name: 'Not Eligible', data: stats.totalSearches - stats.lmiProperties }
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSearches}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LMI Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lmiProperties}</div>
            <div className="text-xs text-muted-foreground">
              {stats.lmiPercentage.toFixed(1)}% of total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>LMI Status Distribution</CardTitle>
            <CardDescription>Proportion of LMI eligible properties</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-60 w-60">
              <Chart type="pie" data={lmiStatusData} />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Popular ZIP Codes</CardTitle>
            <CardDescription>Most searched ZIP codes</CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            <Chart type="bar" data={zipCodeChartData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Searches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentSearches.length > 0 ? (
              stats.recentSearches.map((search: SearchHistory) => (
                <div key={search.id} className="border-b pb-2">
                  <div className="font-medium">{search.address}</div>
                  <div className="text-sm text-gray-500">
                    {search.searched_at ? new Date(search.searched_at).toLocaleString() : 'Unknown date'}
                  </div>
                  <div className="text-sm">
                    <span className={search.is_eligible ? "text-green-500" : "text-red-500"}>
                      {search.is_eligible ? "LMI Eligible" : "Not Eligible"}
                    </span>
                    {search.income_category && <span className="ml-2">({search.income_category})</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No recent searches found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
