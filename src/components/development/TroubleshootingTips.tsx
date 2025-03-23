
import React from 'react';

interface TroubleshootingTipsProps {
  edgeFunctionStatus: 'idle' | 'testing' | 'success' | 'error';
  consecutiveErrors: number;
}

const TroubleshootingTips: React.FC<TroubleshootingTipsProps> = ({ 
  edgeFunctionStatus, 
  consecutiveErrors 
}) => {
  if (edgeFunctionStatus !== 'error') return null;
  
  return (
    <div className="mt-4 p-3 bg-muted rounded-md text-sm">
      <h4 className="font-semibold mb-2">Troubleshooting Tips:</h4>
      <ul className="list-disc list-inside space-y-1">
        <li>Verify the edge function is deployed in your Supabase project</li>
        <li>Check the Supabase Edge Function Logs for errors</li>
        <li>Ensure your Supabase URL and API key are correct</li>
        <li>Try redeploying the function: <code>supabase functions deploy lmi-check</code></li>
        <li>Check that CORS is properly configured in the edge function</li>
        <li>If this is in an iframe, ensure the parent domain is allowed in CORS</li>
        {consecutiveErrors > 2 && (
          <li className="text-destructive font-semibold">
            After multiple failed attempts, you may need to check your Supabase project's region 
            and make sure there are no service disruptions
          </li>
        )}
      </ul>
    </div>
  );
};

export default TroubleshootingTips;
