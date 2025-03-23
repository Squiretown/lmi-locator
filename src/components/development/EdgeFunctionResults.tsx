
import React from 'react';
import { AlertTriangleIcon, CheckCircle2Icon, ExternalLinkIcon } from 'lucide-react';
import TroubleshootingTips from './TroubleshootingTips';
import { Button } from '@/components/ui/button';

interface EdgeFunctionResultsProps {
  edgeFunctionResponse: any;
  edgeFunctionStatus: 'idle' | 'testing' | 'success' | 'error';
  consecutiveErrors: number;
}

const EdgeFunctionResults: React.FC<EdgeFunctionResultsProps> = ({
  edgeFunctionResponse,
  edgeFunctionStatus,
  consecutiveErrors
}) => {
  if (!edgeFunctionResponse) {
    return <p className="text-sm text-muted-foreground">No test run yet</p>;
  }

  const errorMessage = edgeFunctionResponse.error || 
                       edgeFunctionResponse.errorObject?.message || 
                       '';
  
  // Check if this is a deployment-related error
  const isDeploymentError = errorMessage.includes('Failed to fetch') || 
                          errorMessage.includes('Failed to send a request') ||
                          errorMessage.includes('NetworkError') ||
                          errorMessage.includes('network request failed');
  
  // Check if this is a function execution error vs a connection error
  const isFunctionError = edgeFunctionResponse.error && !isDeploymentError;

  if (edgeFunctionResponse.error) {
    return (
      <div className="text-red-500 flex items-start gap-2">
        <AlertTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">
            {isDeploymentError ? 'Connection Error:' : 'Function Error:'}
          </p>
          <p className="text-sm">{errorMessage}</p>
          {isDeploymentError && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-700 text-xs font-medium">
                This appears to be a deployment or connection issue, not a code error.
                The Edge Function might not be deployed or accessible.
              </p>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    window.open('https://supabase.com/dashboard/project/llhofjbijjxkfezidxyi/functions', '_blank');
                  }}
                >
                  View Edge Functions <ExternalLinkIcon className="h-3 w-3 ml-1" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    window.open('https://supabase.com/dashboard/project/llhofjbijjxkfezidxyi/functions/lmi-check/logs', '_blank');
                  }}
                >
                  View Logs <ExternalLinkIcon className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          )}
          <TroubleshootingTips 
            edgeFunctionStatus={edgeFunctionStatus} 
            consecutiveErrors={consecutiveErrors}
            errorMessage={errorMessage}
          />
        </div>
      </div>
    );
  }

  // Safe display of JSON data
  const renderSafeJson = () => {
    try {
      // Only show data if it exists
      if (!edgeFunctionResponse.data) {
        return <p className="text-sm">Response contains no data</p>;
      }
      
      // Safely stringify the JSON
      const seen = new Set();
      const jsonString = JSON.stringify(edgeFunctionResponse.data, (key, value) => {
        // Handle circular references
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular Reference]';
          }
          seen.add(value);
        }
        return value;
      }, 2);
      
      return (
        <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
          {jsonString}
        </pre>
      );
    } catch (error) {
      console.error("Error rendering JSON:", error);
      return (
        <p className="text-sm text-red-500">
          Error rendering JSON data. Response may contain circular references or invalid JSON.
        </p>
      );
    }
  };

  return (
    <div className="bg-muted p-3 rounded">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2Icon className="h-5 w-5 text-green-600" />
        <p className="text-sm font-medium">
          Response time: {edgeFunctionResponse.responseTime}ms
        </p>
      </div>
      {renderSafeJson()}
    </div>
  );
};

export default EdgeFunctionResults;
