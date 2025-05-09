
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Info, Filter, Search, MapPin, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { SearchResult } from '@/hooks/useMarketingSearch';

interface SearchResultsProps {
  results: SearchResult[];
  onExport: () => void;
  canExport: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onExport,
  canExport
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>(results);

  // Filter results based on search input
  React.useEffect(() => {
    if (!searchFilter) {
      setFilteredResults(results);
      return;
    }
    
    const filtered = results.filter(prop => 
      prop.address.toLowerCase().includes(searchFilter.toLowerCase()) ||
      prop.city.toLowerCase().includes(searchFilter.toLowerCase()) ||
      prop.state.toLowerCase().includes(searchFilter.toLowerCase()) ||
      prop.zip_code.toLowerCase().includes(searchFilter.toLowerCase())
    );
    
    setFilteredResults(filtered);
  }, [searchFilter, results]);

  if (!results.length) {
    return null;
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/40">
        <CardTitle className="text-lg md:text-xl flex items-center">
          <List className="mr-2 h-5 w-5 text-muted-foreground" />
          Search Results ({results.length} Properties)
        </CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={onExport}
            disabled={!canExport}
            className="flex items-center"
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" /> Export List
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-5">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter results..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9 pr-4 py-2"
            />
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>ZIP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <MapPin className="h-8 w-8 mb-2 opacity-40" />
                      {searchFilter ? 
                        <p>No properties match your filter</p> : 
                        <p>No properties found</p>
                      }
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((prop, index) => (
                  <TableRow key={index} className="hover:bg-muted/30 cursor-default transition-colors">
                    <TableCell className="font-medium">{prop.address}</TableCell>
                    <TableCell>{prop.city}</TableCell>
                    <TableCell>{prop.state}</TableCell>
                    <TableCell>{prop.zip_code}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {!canExport && results.length > 0 && (
          <Alert className="mt-4 bg-muted border border-muted-foreground/20">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your account doesn't have permission to export search results. Please contact an administrator to upgrade your access.
            </AlertDescription>
          </Alert>
        )}
        
        {filteredResults.length !== results.length && (
          <p className="text-xs text-muted-foreground mt-4">
            Showing {filteredResults.length} of {results.length} properties
          </p>
        )}
      </CardContent>
    </Card>
  );
};
