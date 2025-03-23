
import React from 'react';
import { AlertTriangleIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TroubleshootingTipsProps {
  edgeFunctionStatus: 'idle' | 'testing' | 'success' | 'error';
  consecutiveErrors: number;
  errorMessage?: string;
}

const TroubleshootingTips: React.FC<TroubleshootingTipsProps> = ({ 
  edgeFunctionStatus, 
  consecutiveErrors,
  errorMessage
}) => {
  // Only show for error status or when there are multiple errors
  if (edgeFunctionStatus !== 'error' && consecutiveErrors === 0) return null;
  
  // Check if the error is a connection error
  const isConnectionError = errorMessage?.includes('Failed to fetch') || 
                            errorMessage?.includes('Failed to send a request');
  
  return (
    <div className="mt-4 p-3 bg-muted rounded-md text-sm">
      <h4 className="font-semibold mb-2 flex items-center">
        <AlertTriangleIcon className="h-4 w-4 mr-1 text-amber-500" />
        Troubleshooting Tips:
      </h4>
      
      {isConnectionError ? (
        <>
          <p className="text-red-500 font-medium mb-2">
            Connection Error Detected: Unable to reach the Edge Function
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Verify your Supabase project is up and running</li>
            <li>Check if the Edge Function is deployed in your Supabase project</li>
            <li>Make sure your development environment has network access to Supabase</li>
            <li>Confirm you're using the correct Supabase project URL and API key</li>
            <li>Try deploying the function: <code>npx supabase functions deploy lmi-check</code></li>
          </ul>
          <div className="mt-3 flex flex-col gap-2">
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline flex items-center"
            >
              Go to Supabase Dashboard <ExternalLinkIcon className="h-3 w-3 ml-1" />
            </a>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs mt-1"
              onClick={() => {
                // Open console to show developers how to debug
                console.info(
                  "%c Edge Function Debugging Tips:",
                  "color: white; background: blue; padding: 2px 4px; border-radius: 2px;",
                  "\n1. Check your Supabase URL and anon key",
                  "\n2. Use `npx supabase functions serve lmi-check` to test locally",
                  "\n3. View functions logs in Supabase Dashboard"
                );
              }}
            >
              Show Edge Function Debug Tips
            </Button>
          </div>
        </>
      ) : (
        <ul className="list-disc list-inside space-y-1">
          <li>Verify the edge function is deployed in your Supabase project</li>
          <li>Check the Supabase Edge Function Logs for errors</li>
          <li>Ensure your Supabase URL and API key are correct</li>
          <li>Try redeploying the function: <code>npx supabase functions deploy lmi-check</code></li>
          <li>Check that CORS is properly configured in the edge function</li>
          <li>If this is in an iframe, ensure the parent domain is allowed in CORS</li>
          {consecutiveErrors > 2 && (
            <li className="text-destructive font-semibold">
              After multiple failed attempts, you may need to check your Supabase project's region 
              and make sure there are no service disruptions
            </li>
          )}
        </ul>
      )}
      
      <p className="mt-2 text-xs text-muted-foreground">
        Tip: You can test this function directly in the Supabase dashboard or using the CLI:
        <br />
        <code className="bg-gray-800 text-green-400 px-1 rounded mt-1 inline-block">
          npx supabase functions serve lmi-check
        </code>
      </p>
    </div>
  );
};

export default TroubleshootingTips;
