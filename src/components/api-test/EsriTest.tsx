
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { geocodeAddressWithEsri } from '@/lib/api/esri-service';

interface EsriTestProps {
  setResults: (results: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const EsriTest = ({
  setResults,
  loading,
  setLoading
}: EsriTestProps) => {
  const [address, setAddress] = useState('');
  
  const handleEsriTest = async () => {
    if (!address) {
      toast.error('Please enter an address');
      return;
    }
    
    setLoading(true);
    setResults(null);
    
    try {
      const result = await geocodeAddressWithEsri(address);
      setResults({
        ...result,
        geocoding_service: 'ESRI',
        test_type: 'ESRI Geocoding'
      });
      toast.success('ESRI geocoding successful');
    } catch (error) {
      console.error('ESRI geocoding error:', error);
      toast.error('ESRI geocoding failed');
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        geocoding_service: 'ESRI',
        test_type: 'ESRI Geocoding (Failed)'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test ESRI Geocoding API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="esri-address">Address</Label>
          <Input
            id="esri-address"
            placeholder="Enter an address to geocode with ESRI"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleEsriTest} 
          disabled={loading || !address}
        >
          {loading ? 'Processing...' : 'Test ESRI Geocoding'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EsriTest;
