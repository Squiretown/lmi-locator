
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDashboardStats } from '@/lib/supabase-api';
import { DashboardStats } from '@/lib/types';
import MarketingDashboard from './MarketingDashboard';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        // Transform the data to match DashboardStats type
        const statsData: DashboardStats = {
          totalSearches: data.searchHistory?.length || 0,
          lmiProperties: data.searchHistory?.filter(item => item.is_eligible).length || 0,
          lmiPercentage: data.searchHistory?.length 
            ? (data.searchHistory.filter(item => item.is_eligible).length / data.searchHistory.length) * 100 
            : 0,
          recentSearches: data.searchHistory?.map(item => ({
            ...item,
            income_category: item.income_category || '',
            is_eligible: !!item.is_eligible,
          })) || [],
          totalUsers: data.userCount || 0,
          totalProperties: data.propertyCount || 0,
          totalRealtors: data.realtorCount || 0
        };
        setStats(statsData);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="p-6">
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="marketing">Marketing & Admin</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <h2 className="text-3xl font-bold">Dashboard Overview</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">Total Searches</h3>
                <p className="text-3xl font-bold">{stats?.totalSearches || 0}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">LMI Properties</h3>
                <p className="text-3xl font-bold">{stats?.lmiProperties || 0}</p>
                <p className="text-sm text-gray-500">{stats?.lmiPercentage?.toFixed(1) || 0}% of total</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">Total Realtors</h3>
                <p className="text-3xl font-bold">{stats?.totalRealtors || 0}</p>
              </div>
            </div>
          )}
          
          {!loading && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Recent Searches</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligible</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income Category</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats?.recentSearches?.map((search, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">{search.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(search.searched_at).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${search.is_eligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {search.is_eligible ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{search.income_category || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="marketing">
          <MarketingDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
