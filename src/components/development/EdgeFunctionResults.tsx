
import React from 'react';
import { AlertTriangleIcon, CheckCircle2Icon } from 'lucide-react';
import TroubleshootingTips from './TroubleshootingTips';

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

  if (edgeFunctionResponse.error) {
    return (
      <div className="text-red-500 flex items-start gap-2">
        <AlertTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Error:</p>
          <p className="text-sm">{edgeFunctionResponse.error}</p>
          <TroubleshootingTips 
            edgeFunctionStatus={edgeFunctionStatus} 
            consecutiveErrors={consecutiveErrors} 
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
  
  // Set for tracking circular references
  const seen = new Set();

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
