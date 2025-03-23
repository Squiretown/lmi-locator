
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { geocodeAddress } from '@/lib/api/geocode';

interface GeocodeTestProps {
  address: string;
  setAddress: (address: string) => void;
  setTractId: (tractId: string) => void;
  setResults: (results: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const GeocodeTest = ({
  address,
  setAddress,
  setTractId,
  setResults,
  loading,
  setLoading
}: GeocodeTestProps) => {
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
  
  return (
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
  );
};

export default GeocodeTest;
