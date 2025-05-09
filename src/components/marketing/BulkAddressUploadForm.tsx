
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, AlertTriangle, Check, X, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { showSearchStarted, showSearchError } from '@/utils/toastUtils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface BulkAddressUploadFormProps {
  onSearchStarted: (jobId: string, addressCount: number) => void;
}

export const BulkAddressUploadForm: React.FC<BulkAddressUploadFormProps> = ({ onSearchStarted }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validatedAddresses, setValidatedAddresses] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationProgress, setValidationProgress] = useState<number>(0);

  const validateAddresses = () => {
    setIsValidating(true);
    const addressList = addresses
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (addressList.length === 0) {
      setValidationErrors(['Please enter at least one address']);
      setIsValidating(false);
      return;
    }

    const errors: string[] = [];
    const validAddresses: string[] = [];

    // Simple validation
    addressList.forEach((address, index) => {
      setValidationProgress(Math.round(((index + 1) / addressList.length) * 100));
      
      // Check if address has some minimal structure (not just a few characters)
      if (address.length < 5) {
        errors.push(`Line ${index + 1}: Address is too short`);
      } 
      // Check if it has at least a number and some text (basic address structure)
      else if (!/\d+/.test(address) || !/[a-zA-Z]+/.test(address)) {
        errors.push(`Line ${index + 1}: Address should contain numbers and text`);
      }
      else {
        validAddresses.push(address);
      }
    });

    setValidationErrors(errors);
    setValidatedAddresses(validAddresses);
    setIsValidating(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      showSearchError('You must be logged in to perform a bulk search');
      return;
    }

    if (validatedAddresses.length === 0) {
      validateAddresses();
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a marketing job for bulk processing
      const { data: jobData, error: jobError } = await supabase
        .from('marketing_jobs')
        .insert({
          user_id: user.id,
          campaign_name: searchName || 'Bulk Address Search',
          status: 'pending',
          total_addresses: validatedAddresses.length,
          eligible_addresses: 0
        })
        .select('marketing_id')
        .single();

      if (jobError) throw jobError;

      // Insert addresses for processing
      const addressInserts = validatedAddresses.map(address => ({
        marketing_id: jobData.marketing_id,
        address: address,
        status: 'pending'
      }));

      const { error: addressError } = await supabase
        .from('marketing_addresses')
        .insert(addressInserts);

      if (addressError) throw addressError;

      // Start processing job
      await supabase.functions.invoke('lmi-check', {
        body: {
          action: 'process_marketing_job',
          jobId: jobData.marketing_id
        }
      });

      showSearchStarted(validatedAddresses.length);
      onSearchStarted(jobData.marketing_id, validatedAddresses.length);

    } catch (error) {
      console.error('Error submitting bulk search:', error);
      showSearchError(error.message || 'Failed to start bulk search');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only accept text files or CSV files
    if (file.type !== 'text/plain' && file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setValidationErrors(['Only text or CSV files are supported']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setAddresses(content);
      setValidationErrors([]);
      setValidatedAddresses([]);
    };
    reader.readAsText(file);
  };

  const addressCount = addresses
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0).length;

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="border-b bg-muted/40">
        <CardTitle className="text-lg md:text-xl flex items-center">
          <Upload className="mr-2 h-5 w-5 text-muted-foreground" />
          Bulk Address Search
        </CardTitle>
        <CardDescription>
          Upload multiple addresses at once to check their LMI eligibility
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="searchName">Search Name</Label>
            <Input 
              id="searchName"
              placeholder="Name this search for reference"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="addresses">Enter addresses (one per line)</Label>
              <span className="text-xs text-muted-foreground">
                {addressCount} address{addressCount !== 1 ? 'es' : ''}
              </span>
            </div>
            <Textarea 
              id="addresses"
              placeholder="123 Main St, Anytown, CA 90210&#10;456 Oak Ave, Othertown, CA 90211"
              value={addresses}
              onChange={(e) => {
                setAddresses(e.target.value);
                setValidationErrors([]);
                setValidatedAddresses([]);
              }}
              className="mt-1 min-h-[200px] resize-y"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Format: One complete address per line including street, city, state, and ZIP
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="fileUpload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-md transition-colors">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Upload CSV/TXT
            </Label>
            <Input 
              id="fileUpload"
              type="file" 
              accept=".txt,.csv,text/plain,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="text-sm text-muted-foreground">or drag & drop file here</span>
          </div>
          
          {isValidating && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Validating addresses...</span>
                <span>{validationProgress}%</span>
              </div>
              <Progress value={validationProgress} className="h-1" />
            </div>
          )}
          
          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>
                <div>Please correct the following issues:</div>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {validationErrors.slice(0, 5).map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                  {validationErrors.length > 5 && (
                    <li className="text-sm">...and {validationErrors.length - 5} more errors</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {validatedAddresses.length > 0 && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              <AlertDescription>
                {validatedAddresses.length} valid addresses ready to search
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button 
          variant="outline" 
          onClick={() => {
            setAddresses('');
            setValidationErrors([]);
            setValidatedAddresses([]);
          }}
          disabled={isSubmitting || isValidating || addresses.length === 0}
        >
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
        
        <div className="space-x-2">
          {addresses && !validatedAddresses.length && !isValidating && (
            <Button
              variant="secondary"
              onClick={validateAddresses}
              disabled={isSubmitting || isValidating || addresses.length === 0}
            >
              <Check className="mr-2 h-4 w-4" />
              Validate
            </Button>
          )}
          
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || isValidating || (addressCount === 0 && validatedAddresses.length === 0)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit Search
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
