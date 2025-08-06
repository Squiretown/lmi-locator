import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Search, Download, CheckCircle, XCircle, MapPin } from 'lucide-react';

interface CensusTract {
  tractId: string;
  state: string;
  county: string;
  tractName?: string;
  isLmiEligible: boolean;
  amiPercentage: number;
  incomeCategory: string;
  population?: number;
  propertyCount: number;
  medianIncome: number;
  dataYear: number;
}

interface SearchSummary {
  totalTracts: number;
  lmiTracts: number;
  propertyCount: number;
  lmiPercentage: number;
}

export const CensusTractSearch: React.FC = () => {
  const [searchType, setSearchType] = useState<'state' | 'county' | 'tract'>('state');
  const [searchValue, setSearchValue] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CensusTract[]>([]);
  const [summary, setSummary] = useState<SearchSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
    'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
    'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
    'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
    'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const handleSearch = async () => {
    if (!searchValue && searchType !== 'state') {
      toast.error("Search value required", {
        description: "Please enter a search value"
      });
      return;
    }

    if (searchType === 'county' && !selectedState) {
      toast.error("State selection required", {
        description: "Please select a state for county search"
      });
      return;
    }

    setIsLoading(true);
    try {
      const searchParams: any = {};
      
      if (searchType === 'state') {
        searchParams.state = selectedState;
      } else if (searchType === 'county') {
        searchParams.state = selectedState;
        searchParams.county = searchValue;
      } else if (searchType === 'tract') {
        searchParams.tractId = searchValue.trim();
      }

      console.log('Searching with params:', searchParams);

      const { data, error } = await supabase.functions.invoke('census-db', {
        body: {
          action: 'searchBatch',
          params: searchParams
        }
      });

      if (error) {
        throw error;
      }

      if (data && data.success) {
        const tracts: CensusTract[] = data.tracts.map((tract: any) => ({
          tractId: tract.tractId,
          state: tract.state,
          county: tract.county,
          tractName: tract.tractName,
          isLmiEligible: tract.isLmiEligible,
          amiPercentage: tract.amiPercentage,
          incomeCategory: tract.incomeCategory,
          population: tract.population,
          propertyCount: tract.propertyCount,
          medianIncome: tract.medianIncome,
          dataYear: tract.dataYear
        }));

        setResults(tracts);
        setSummary(data.summary);

        toast.success("Search completed", {
          description: `Found ${tracts.length} census tracts (${data.summary.lmiTracts} LMI-eligible)`
        });
      } else {
        throw new Error(data?.error || "Search failed");
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Search failed", {
        description: error.message || "Unable to complete search. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (results.length === 0) {
      toast.error("No data to export", {
        description: "Please perform a search first"
      });
      return;
    }

    const headers = [
      "Tract ID", "State", "County", "LMI Eligible", "AMI %", 
      "Income Category", "Population", "Households", "Median Income", "Data Year"
    ];
    
    const csvRows = [
      headers.join(','),
      ...results.map(tract => [
        `"${tract.tractId}"`,
        `"${tract.state}"`,
        `"${tract.county}"`,
        tract.isLmiEligible ? "Yes" : "No",
        tract.amiPercentage?.toFixed(1) || "0.0",
        `"${tract.incomeCategory}"`,
        tract.population || "N/A",
        tract.propertyCount || "N/A",
        tract.medianIncome || "N/A",
        tract.dataYear || "2025"
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `census-tracts-${searchType}-${searchValue || selectedState}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success("Export successful", {
      description: "Census tract data has been downloaded"
    });
  };

  const filteredResults = results.filter(tract =>
    !searchQuery || tract.tractId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tract.county?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Census Tract Search
          </CardTitle>
          <CardDescription>
            Search and explore LMI-eligible census tracts using FFIEC data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="searchType">Search Type</Label>
              <Select value={searchType} onValueChange={(value: 'state' | 'county' | 'tract') => setSearchType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="state">By State</SelectItem>
                  <SelectItem value="county">By County</SelectItem>
                  <SelectItem value="tract">By Tract ID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchType === 'state' || searchType === 'county') && (
              <div>
                <Label htmlFor="state">State</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {searchType !== 'state' && (
              <div>
                <Label htmlFor="searchValue">
                  {searchType === 'county' ? 'County Name' : 'Census Tract ID'}
                </Label>
                <Input
                  id="searchValue"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchType === 'county' ? 'Enter county name' : 'e.g., 06037234100'}
                />
              </div>
            )}
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={isLoading || (searchType === 'county' && (!selectedState || !searchValue)) || (searchType === 'tract' && !searchValue)}
            className="w-full"
          >
            {isLoading ? 'Searching...' : 'Search Census Tracts'}
            {!isLoading && <Search className="ml-2 h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{summary.totalTracts.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Tracts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.lmiTracts.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">LMI Eligible</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{summary.propertyCount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Properties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{summary.lmiPercentage}%</div>
                <div className="text-sm text-muted-foreground">LMI Percentage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Search Results ({filteredResults.length})</CardTitle>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by tract ID or county..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tract ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>LMI Status</TableHead>
                    <TableHead>AMI %</TableHead>
                    <TableHead>Income Category</TableHead>
                    <TableHead className="text-right">Population</TableHead>
                    <TableHead className="text-right">Households</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((tract, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium font-mono text-sm">{tract.tractId}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{tract.county}</div>
                          <div className="text-muted-foreground">{tract.state}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tract.isLmiEligible ? "success" : "destructive"} className="gap-1">
                          {tract.isLmiEligible ? 
                            <><CheckCircle className="h-3 w-3" /> Eligible</> : 
                            <><XCircle className="h-3 w-3" /> Not Eligible</>
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{tract.amiPercentage?.toFixed(1) || '0.0'}%</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tract.incomeCategory}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {tract.population?.toLocaleString() || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {tract.propertyCount?.toLocaleString() || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};