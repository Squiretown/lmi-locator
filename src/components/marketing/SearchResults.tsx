
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Info } from 'lucide-react';
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
  if (!results.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Search Results ({results.length} Properties)</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={onExport}
            disabled={!canExport}
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
  );
};
