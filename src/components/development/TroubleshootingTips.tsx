
import React from 'react';
import { AlertTriangleIcon, ExternalLinkIcon, CommandIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
                            errorMessage?.includes('Failed to send a request') ||
                            errorMessage?.includes('NetworkError') ||
                            errorMessage?.includes('network request failed');
  
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
          
          <Accordion type="single" collapsible className="w-full border-none">
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className="py-2 text-xs font-medium">
                Deployment Status Check
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-1 ml-1 text-xs">
                  <li>Open the Supabase Dashboard</li>
                  <li>Navigate to Edge Functions</li>
                  <li>Check if the "lmi-check" function appears in the list</li>
                  <li>If it's not there, you need to deploy it using CLI</li>
                </ol>
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      window.open('https://supabase.com/dashboard/project/llhofjbijjxkfezidxyi/functions', '_blank');
                    }}
                  >
                    View Edge Functions <ExternalLinkIcon className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border-b-0">
              <AccordionTrigger className="py-2 text-xs font-medium">
                CLI Deployment Steps
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-xs">
                  <p>1. Install Supabase CLI (if not already installed):</p>
                  <code className="bg-gray-800 text-green-400 px-2 py-1 rounded block">
                    npm install -g supabase
                  </code>
                  
                  <p>2. Log in to Supabase CLI:</p>
                  <code className="bg-gray-800 text-green-400 px-2 py-1 rounded block">
                    npx supabase login
                  </code>
                  
                  <p>3. Deploy the Edge Function:</p>
                  <code className="bg-gray-800 text-green-400 px-2 py-1 rounded block">
                    npx supabase functions deploy lmi-check
                  </code>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border-b-0">
              <AccordionTrigger className="py-2 text-xs font-medium">
                Configuration Check
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside space-y-1 text-xs ml-1">
                  <li>Verify your Supabase project is up and running</li>
                  <li>Make sure your development environment has network access to Supabase</li>
                  <li>Check that you're using the correct Supabase project URL and API key</li>
                  <li>Inspect console logs for detailed error information</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-3 flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs mt-1 w-full flex items-center justify-center"
              onClick={() => {
                // Open console to show developers how to debug
                console.info(
                  "%c Edge Function Deployment Tips:",
                  "color: white; background: blue; padding: 2px 4px; border-radius: 2px;",
                  "\n1. Make sure Supabase CLI is installed: npm install -g supabase",
                  "\n2. Login to Supabase: npx supabase login",
                  "\n3. Deploy the function: npx supabase functions deploy lmi-check",
                  "\n4. Verify in the Supabase Dashboard that the function appears"
                );
              }}
            >
              <CommandIcon className="h-3 w-3 mr-1" /> Show Deployment Commands
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
