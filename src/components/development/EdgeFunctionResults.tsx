
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

  return (
    <div className="bg-muted p-3 rounded">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2Icon className="h-5 w-5 text-green-600" />
        <p className="text-sm font-medium">
          Response time: {edgeFunctionResponse.responseTime}ms
        </p>
      </div>
      <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
        {JSON.stringify(edgeFunctionResponse.data, null, 2)}
      </pre>
    </div>
  );
};

export default EdgeFunctionResults;
