import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { secureGeocodeWithEsri } from '@/lib/api/esri/secure-geocoding';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, CheckCircle, XCircle } from 'lucide-react';

interface EsriKeyTestProps {
  setResults: (results: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const EsriKeyTest = ({
  setResults,
  loading,
  setLoading
}: EsriKeyTestProps) => {
  const [testResult, setTestResult] = useState<null | {
    isValid: boolean;
    message: string;
  }>(null);
  
  const handleTest = async () => {
    setLoading(true);
    setResults(null);
    setTestResult(null);
    
    try {
      toast.info('Testing ESRI API access...');
      
      // Test with a simple address to verify ESRI API access
      const result = await secureGeocodeWithEsri('1600 Amphitheatre Parkway, Mountain View, CA');
      
      setTestResult({
        isValid: true,
        message: 'ESRI API access is working correctly'
      });
      
      toast.success('ESRI API access is working!');
      
      setResults({
        test_type: 'ESRI API Access Test',
        isValid: true,
        message: 'API access successful',
        candidates: result.candidates || [],
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to access ESRI API';
      
      setTestResult({
        isValid: false,
        message: errorMessage
      });
      
      toast.error(`API access failed: ${errorMessage}`);
      
      setResults({
        test_type: 'ESRI API Access Test (Failed)',
        isValid: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Test ESRI API Access
          {testResult && (
            <Badge variant={testResult.isValid ? 'default' : 'destructive'}>
              {testResult.isValid ? 'Working' : 'Failed'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <InfoIcon className="inline h-4 w-4 mr-2" />
          This tests secure access to ESRI geocoding services through our backend.
        </div>
        
        <Button 
          onClick={handleTest} 
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test ESRI API Access'}
        </Button>
        
        {testResult && (
          <>
            <Separator className="my-2" />
            
            <Alert variant={testResult.isValid ? 'default' : 'destructive'}>
              {testResult.isValid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription className="ml-2">
                {testResult.message}
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EsriKeyTest;