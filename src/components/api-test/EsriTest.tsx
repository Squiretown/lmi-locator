
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { geocodeAddressWithEsri, ESRI_GEOCODING_URL, ESRI_GEOCODING_API_URL } from '@/lib/api/esri/index';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

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
  const [diagnosticInfo, setDiagnosticInfo] = useState<{
    requestStartTime?: number;
    requestEndTime?: number;
    requestDuration?: number;
    apiUrl?: string;
    status?: 'success' | 'error' | 'idle';
    message?: string;
    approach?: string;
  }>({
    status: 'idle'
  });
  
  const handleEsriTest = async () => {
    if (!address) {
      toast.error('Please enter an address');
      return;
    }
    
    setLoading(true);
    setResults(null);
    setDiagnosticInfo({
      requestStartTime: Date.now(),
      apiUrl: ESRI_GEOCODING_URL,
      status: 'idle',
      message: 'Initiating ESRI API request...'
    });
    
    try {
      console.log(`[ESRI TEST] Starting geocoding request for address: ${address}`);
      const requestStartTime = Date.now();
      
      const result = await geocodeAddressWithEsri(address);
      
      const requestEndTime = Date.now();
      const requestDuration = requestEndTime - requestStartTime;
      
      console.log(`[ESRI TEST] Geocoding successful in ${requestDuration}ms:`, result);
      
      setResults({
        ...result,
        geocoding_service: 'ESRI',
        test_type: 'ESRI Geocoding',
        diagnostic: {
          duration_ms: requestDuration,
          timestamp: new Date().toISOString(),
          approach: result.request_info?.approach
        }
      });
      
      setDiagnosticInfo({
        requestStartTime,
        requestEndTime,
        requestDuration,
        apiUrl: result.request_info?.url || ESRI_GEOCODING_URL,
        status: 'success',
        message: `API call completed successfully in ${requestDuration}ms`,
        approach: result.request_info?.approach
      });
      
      toast.success('ESRI geocoding successful');
    } catch (error) {
      const requestEndTime = Date.now();
      const requestDuration = diagnosticInfo.requestStartTime 
        ? requestEndTime - diagnosticInfo.requestStartTime 
        : undefined;
      
      console.error('[ESRI TEST] Geocoding error:', error);
      
      // Try to extract more useful error information
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('[ESRI TEST] Error stack:', error.stack);
      }
      
      setDiagnosticInfo({
        ...diagnosticInfo,
        requestEndTime,
        requestDuration,
        status: 'error',
        message: `API call failed: ${errorMessage}`
      });
      
      toast.error('ESRI geocoding failed');
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        geocoding_service: 'ESRI',
        test_type: 'ESRI Geocoding (Failed)',
        diagnostic: {
          duration_ms: requestDuration,
          timestamp: new Date().toISOString(),
          error_details: error instanceof Error ? error.stack : String(error)
        }
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Test ESRI Geocoding API
          {diagnosticInfo.status && diagnosticInfo.status !== 'idle' && (
            <Badge variant={diagnosticInfo.status === 'success' ? 'default' : 'destructive'}>
              {diagnosticInfo.status === 'success' ? 'Success' : 'Error'}
            </Badge>
          )}
        </CardTitle>
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
        
        {diagnosticInfo.status !== 'idle' && (
          <>
            <Separator className="my-2" />
            
            <div className="text-sm">
              <Alert variant={diagnosticInfo.status === 'success' ? 'default' : 'destructive'}>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  {diagnosticInfo.message}
                </AlertDescription>
              </Alert>
              
              <div className="mt-2 space-y-1 text-muted-foreground">
                <p><strong>API URL:</strong> {diagnosticInfo.apiUrl}</p>
                {diagnosticInfo.approach && (
                  <p><strong>Successful Approach:</strong> {diagnosticInfo.approach}</p>
                )}
                {diagnosticInfo.requestDuration && (
                  <p><strong>Request Duration:</strong> {diagnosticInfo.requestDuration}ms</p>
                )}
                <p><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EsriTest;
