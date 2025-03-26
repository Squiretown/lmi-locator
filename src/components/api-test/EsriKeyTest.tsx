
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { validateEsriApiKey } from '@/lib/api/esri/api-key-validator';
import { ESRI_API_KEY } from '@/lib/api/esri/config';
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
  const [apiKey, setApiKey] = useState(ESRI_API_KEY || '');
  const [validationResult, setValidationResult] = useState<null | {
    isValid: boolean;
    message: string;
  }>(null);
  
  const handleKeyTest = async () => {
    if (!apiKey) {
      toast.error('Please enter an API key');
      return;
    }
    
    setLoading(true);
    setResults(null);
    setValidationResult(null);
    
    try {
      toast.info('Testing ESRI API key...');
      
      const result = await validateEsriApiKey(apiKey);
      
      setValidationResult({
        isValid: result.isValid,
        message: result.message
      });
      
      if (result.isValid) {
        toast.success('API key is valid');
      } else {
        toast.error(`API key is invalid: ${result.message}`);
      }
      
      setResults({
        test_type: 'ESRI API Key Validation',
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error testing API key:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setValidationResult({
        isValid: false,
        message: `Error testing key: ${errorMessage}`
      });
      
      toast.error('Error testing API key');
      
      setResults({
        test_type: 'ESRI API Key Validation (Failed)',
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
          Test ESRI API Key
          {validationResult && (
            <Badge variant={validationResult.isValid ? 'default' : 'destructive'}>
              {validationResult.isValid ? 'Valid' : 'Invalid'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="esri-key">ESRI API Key</Label>
          <Input
            id="esri-key"
            type="password"
            placeholder="Enter ESRI API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This is used to test geocoding services with the ESRI platform
          </p>
        </div>
        
        <Button 
          onClick={handleKeyTest} 
          disabled={loading || !apiKey}
        >
          {loading ? 'Testing...' : 'Test API Key'}
        </Button>
        
        {validationResult && (
          <>
            <Separator className="my-2" />
            
            <Alert variant={validationResult.isValid ? 'default' : 'destructive'}>
              {validationResult.isValid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription className="ml-2">
                {validationResult.message}
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EsriKeyTest;
