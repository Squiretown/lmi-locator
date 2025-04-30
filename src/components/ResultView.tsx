
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, MapPin, Home, Save, LogIn } from 'lucide-react';
import { CheckLmiStatusResponse } from '@/lib/types';
import ResultsMap from './map/ResultsMap';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ResultViewProps {
  data: CheckLmiStatusResponse;
  onContinue: () => void;
  onReset: () => void;
  onSaveProperty?: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ data, onContinue, onReset, onSaveProperty }) => {
  // Get authentication status
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Determine if the property is eligible
  const isEligible = data.is_approved;
  
  // Clean up address to remove UNDEFINED and extra commas
  const cleanAddress = data.address
    ? data.address
        .replace(/undefined/gi, '')
        .replace(/,\s*,/g, ',')
        .replace(/,\s*$/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    : 'Address not available';
  
  // Handler for save property button when user is not logged in
  const handleSaveClick = () => {
    if (!user && !onSaveProperty) {
      // Redirect to login/signup page
      navigate('/login');
      toast.info('Please sign in to save properties', {
        description: 'Create an account to save and track properties',
      });
      return;
    }
    
    if (onSaveProperty) {
      onSaveProperty();
    }
  };

  // Handler for account creation
  const handleCreateAccount = () => {
    navigate('/login');
  };

  // Extract lat/lon from the data - add compatibility for both formats
  const lat = data.lat !== undefined ? data.lat : undefined;
  const lon = data.lon !== undefined ? data.lon : undefined;
  
  return (
    <div className="space-y-6">
      <Card className={`border-l-4 ${isEligible ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEligible ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Property is LMI Eligible</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span>Property is Not LMI Eligible</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Property Address</p>
                <p className="text-sm text-muted-foreground">{cleanAddress}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Home className="h-4 w-4 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Census Tract</p>
                <p className="text-sm text-muted-foreground">{data.tract_id || 'Unknown'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Income Category</p>
                <p className="text-sm text-muted-foreground">{data.income_category || 'Unknown'}</p>
              </div>
              <div>
                <p className="font-medium">Median Income</p>
                <p className="text-sm text-muted-foreground">
                  ${(data.median_income || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="font-medium">AMI Percentage</p>
                <p className="text-sm text-muted-foreground">
                  {data.percentage_of_ami || 0}%
                </p>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground">{data.lmi_status || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={onReset} variant="outline" className="flex-1 sm:flex-auto">Start New Search</Button>
            
            {user ? (
              <Button onClick={handleSaveClick} className="gap-2 flex-1 sm:flex-auto">
                <Save className="h-4 w-4" />
                Save Property
              </Button>
            ) : (
              <Button onClick={handleCreateAccount} className="gap-2 flex-1 sm:flex-auto">
                <LogIn className="h-4 w-4" />
                Create Account
              </Button>
            )}
          </div>
          
          {isEligible && (
            <Button onClick={onContinue} className="w-full sm:w-auto mt-2 sm:mt-0">
              Continue to Eligibility
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {data.tract_id && (
        <Card>
          <CardHeader>
            <CardTitle>Tract Map</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-0">
            <ResultsMap 
              tractId={data.tract_id} 
              address={cleanAddress}
              lat={lat}
              lon={lon}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultView;
