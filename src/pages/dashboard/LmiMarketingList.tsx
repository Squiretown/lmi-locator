
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Download, FilePlus, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checkUserPermission } from '@/lib/supabase/permissions';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

type SearchType = 'tract_id' | 'zip_code' | 'city';
type SearchResult = {
  address: string;
  city: string;
  state: string;
  zip_code: string;
};

const LmiMarketingList: React.FC = () => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<SearchType>('tract_id');
  const [searchValue, setSearchValue] = useState('');
  const [searchName, setSearchName] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchId, setSearchId] = useState<string | null>(null);
  
  // Permission states
  const [canSearch, setCanSearch] = useState(false);
  const [canExport, setCanExport] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load permissions when component mounts
  useEffect(() => {
    const loadPermissions = async () => {
      if (!user) return;
      
      try {
        // Check specific permissions
        const hasSearchPermission = await checkUserPermission('marketing_list_search');
        const hasExportPermission = await checkUserPermission('marketing_list_export');
        const hasAdminPermission = await checkUserPermission('admin_access');
        
        setCanSearch(hasSearchPermission);
        setCanExport(hasExportPermission);
        setIsAdmin(hasAdminPermission);
        
        // For mortgage professionals, we automatically grant search permission
        if (userType === 'mortgage_professional' && !hasSearchPermission) {
          setCanSearch(true);
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
        toast({
          title: 'Permission Error',
          description: 'Unable to verify your access permissions',
          variant: 'destructive',
        });
      }
    };

    loadPermissions();
  }, [user, userType, toast]);

  const handleSearch = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to search for properties',
        variant: 'destructive',
      });
      return;
    }
    
    if (!canSearch) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to perform this search',
        variant: 'destructive',
      });
      return;
    }

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
    if (!searchId || !user) {
      toast({
        title: 'Export Error',
        description: 'No search results to export',
        variant: 'destructive',
      });
      return;
    }
    
    if (!canExport) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to export data',
        variant: 'destructive',
      });
      return;
    }
    
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to access marketing lists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">LMI Marketing List Generator</h1>
      
      {!canSearch && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your account doesn't have permission to generate marketing lists. Please contact an administrator for access.
          </AlertDescription>
        </Alert>
      )}
      
      {canSearch && (
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
                disabled={!searchValue || isLoading || !canSearch}
                className="w-full"
              >
                {isLoading ? 'Searching...' : 'Search Properties'}
              </Button>
              
              {userType === 'client' && (
                <p className="text-sm text-muted-foreground italic">
                  Note: As a client, your searches may be limited.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Search Results ({results.length} Properties)</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={results.length === 0 || !canExport}
              >
                <Download className="mr-2 h-4 w-4" /> Export List
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>ZIP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((prop, index) => (
                    <TableRow key={index}>
                      <TableCell>{prop.address}</TableCell>
                      <TableCell>{prop.city}</TableCell>
                      <TableCell>{prop.state}</TableCell>
                      <TableCell>{prop.zip_code}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {!canExport && results.length > 0 && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your account doesn't have permission to export search results. Please contact an administrator to upgrade your access.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LmiMarketingList;
