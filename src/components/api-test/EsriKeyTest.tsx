
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validateEsriApiKey } from '@/lib/api/esri/index';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, KeyIcon } from 'lucide-react';

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
  const [validationState, setValidationState] = useState<{
    status: 'idle' | 'testing' | 'valid' | 'invalid';
    message?: string;
    details?: any;
  }>({
    status: 'idle'
  });
  
  const handleValidateKey = async () => {
    setLoading(true);
    setValidationState({
      status: 'testing',
      message: 'Testing ESRI API key...'
    });
    
    try {
      const validationResult = await validateEsriApiKey();
      
      if (validationResult.isValid) {
        setValidationState({
          status: 'valid',
          message: `API key is valid (Service version: ${validationResult.version})`,
          details: validationResult
        });
        
        setResults({
          api_key_valid: true,
          service_version: validationResult.version,
          test_type: 'ESRI API Key Validation',
          diagnostic: {
            status: validationResult.status,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        setValidationState({
          status: 'invalid',
          message: `API key is invalid: ${validationResult.error}`,
          details: validationResult
        });
        
        setResults({
          api_key_valid: false,
          error: validationResult.error,
          test_type: 'ESRI API Key Validation',
          diagnostic: {
            status: validationResult.status,
            timestamp: new Date().toISOString(),
            error_details: validationResult.error
          }
        });
      }
    } catch (error) {
      setValidationState({
        status: 'invalid',
        message: `Error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
      
      setResults({
        api_key_valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        test_type: 'ESRI API Key Validation (Failed)',
        diagnostic: {
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
          <div className="flex items-center gap-2">
            <KeyIcon className="h-5 w-5" />
            Test ESRI API Key
          </div>
          {validationState.status !== 'idle' && validationState.status !== 'testing' && (
            <Badge variant={validationState.status === 'valid' ? 'default' : 'destructive'}>
              {validationState.status === 'valid' ? 'Valid' : 'Invalid'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleValidateKey} 
          disabled={loading || validationState.status === 'testing'}
          variant="outline"
        >
          {validationState.status === 'testing' ? 'Validating...' : 'Validate ESRI API Key'}
        </Button>
        
        {validationState.status !== 'idle' && (
          <Alert variant={validationState.status === 'valid' ? 'default' : 'destructive'}>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="ml-2">
              {validationState.message}
            </AlertDescription>
          </Alert>
        )}
        
        {validationState.details && (
          <div className="text-sm mt-2 space-y-1 text-muted-foreground">
            {validationState.details.version && (
              <p><strong>Service Version:</strong> {validationState.details.version}</p>
            )}
            {validationState.details.status && (
              <p><strong>HTTP Status:</strong> {validationState.details.status}</p>
            )}
            <p><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EsriKeyTest;
