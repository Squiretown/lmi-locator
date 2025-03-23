
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { geocodeAddress } from '@/lib/api/geocode';
import { getMedianIncome } from '@/lib/api/income';
import { checkLmiStatus } from '@/lib/api/lmi';
import { clearApiCache } from '@/lib/api/cache';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ApiTest = () => {
  const [address, setAddress] = useState('');
  const [tractId, setTractId] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const handleGeocodeTest = async () => {
    if (!address) {
      toast.error('Please enter an address');
      return;
    }
    
    setLoading(true);
    setResults(null);
    
    try {
      const result = await geocodeAddress(address);
      setResults(result);
      setTractId(result.geoid || '');
      toast.success('Geocoding successful');
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Geocoding failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleIncomeTest = async () => {
    if (!tractId) {
      toast.error('Please enter a census tract ID');
      return;
    }
    
    setLoading(true);
    setResults(null);
    
    try {
      const result = await getMedianIncome(tractId);
      setResults({ medianIncome: result, tractId });
      toast.success('Income data retrieved successfully');
    } catch (error) {
      console.error('Income retrieval error:', error);
      toast.error('Income data retrieval failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLmiTest = async () => {
    if (!address) {
      toast.error('Please enter an address');
      return;
    }
    
    setLoading(true);
    setResults(null);
    
    try {
      const result = await checkLmiStatus(address);
      setResults(result);
      toast.success('LMI check completed');
    } catch (error) {
      console.error('LMI check error:', error);
      toast.error('LMI check failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearCache = () => {
    clearApiCache();
    toast.success('API cache cleared');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API Testing Tool</h1>
      <p className="text-muted-foreground mb-6">
        Use this page to test the various Census API functionality in the application.
      </p>
      
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleClearCache}>
          Clear API Cache
        </Button>
      </div>
      
      <Tabs defaultValue="geocode" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geocode">Geocoding API</TabsTrigger>
          <TabsTrigger value="income">Income Data API</TabsTrigger>
          <TabsTrigger value="lmi">LMI Status Check</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geocode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Geocoding API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="geocode-address">Address</Label>
                <Input
                  id="geocode-address"
                  placeholder="Enter an address to geocode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleGeocodeTest} 
                disabled={loading || !address}
              >
                {loading ? 'Processing...' : 'Test Geocoding'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Income Data API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tract-id">Census Tract ID</Label>
                <Input
                  id="tract-id"
                  placeholder="Enter a census tract ID (e.g., 06075010800)"
                  value={tractId}
                  onChange={(e) => setTractId(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleIncomeTest} 
                disabled={loading || !tractId}
              >
                {loading ? 'Processing...' : 'Test Income Data'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lmi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test LMI Status Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lmi-address">Address</Label>
                <Input
                  id="lmi-address"
                  placeholder="Enter an address to check LMI status"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleLmiTest} 
                disabled={loading || !address}
              >
                {loading ? 'Processing...' : 'Test LMI Status'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {results && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={JSON.stringify(results, null, 2)} 
              className="font-mono h-64"
              readOnly
            />
          </CardContent>
        </Card>
      )}
      
      <div className="mt-8 text-center">
        <a href="/" className="text-blue-600 hover:underline">
          Return to Home Page
        </a>
      </div>
    </div>
  );
};

export default ApiTest;
