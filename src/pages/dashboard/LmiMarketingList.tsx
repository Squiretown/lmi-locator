
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Download, FilePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SearchType = 'tract_id' | 'zip_code' | 'city';
type SearchResult = {
  address: string;
  city: string;
  state: string;
  zip_code: string;
};

const LmiMarketingList: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<SearchType>('tract_id');
  const [searchValue, setSearchValue] = useState('');
  const [searchName, setSearchName] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchId, setSearchId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('lmi-tract-search', {
        body: {
          search_type: searchType,
          search_value: searchValue,
          user_id: user.id,
          search_name: searchName || `${searchType} Search`
        }
      });

      if (error) throw error;

      setResults(data.results);
      setSearchId(data.searchId);
      
      toast({
        title: 'Search completed',
        description: `Found ${data.results.length} properties`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Unable to complete the search. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!searchId || !user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('census-db', {
        body: {
          action: 'exportSearchResults',
          params: {
            searchId,
            userId: user.id,
            format: 'csv'
          }
        }
      });

      if (error) throw error;
      
      // Create a download link for the CSV data
      const blob = new Blob([data.csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `${searchName || 'marketing-list'}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Update download count
      await supabase
        .from('census_tract_searches')
        .update({ download_count: data.downloadCount })
        .eq('id', searchId);
        
      toast({
        title: 'Export successful',
        description: 'Your marketing list has been downloaded',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'Unable to export the data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">LMI Marketing List Generator</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={searchType} 
            onValueChange={(value) => setSearchType(value as SearchType)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tract_id">Census Tract</TabsTrigger>
              <TabsTrigger value="zip_code">ZIP Code</TabsTrigger>
              <TabsTrigger value="city">City</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="mt-4 space-y-4">
            <Input 
              placeholder={`Enter ${searchType.replace('_', ' ')}`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Input 
              placeholder="Optional: Name this search"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <Button 
              onClick={handleSearch} 
              disabled={!searchValue || isLoading}
              className="w-full"
            >
              {isLoading ? 'Searching...' : 'Search Properties'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Search Results ({results.length} Properties)</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={results.length === 0}
              >
                <Download className="mr-2 h-4 w-4" /> Export List
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Address</th>
                    <th className="p-3 text-left">City</th>
                    <th className="p-3 text-left">State</th>
                    <th className="p-3 text-left">ZIP</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((prop, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="p-3">{prop.address}</td>
                      <td className="p-3">{prop.city}</td>
                      <td className="p-3">{prop.state}</td>
                      <td className="p-3">{prop.zip_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LmiMarketingList;
