
import React from 'react';
import { CheckCircle2Icon, XCircleIcon, MapPinIcon, DollarSignIcon, PercentIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface ResultProps {
  data: {
    address: string;
    tract_id: string;
    median_income: number | null | undefined;
    ami: number | null | undefined;
    income_category: string;
    percentage_of_ami: number | null | undefined;
    eligibility: string;
    approval_message: string;
    is_approved: boolean;
    lmi_status: string;
  };
}

const ResultCard: React.FC<ResultProps> = ({ data }) => {
  const isEligible = data.is_approved;
  
  // Guard against undefined/null values for numeric fields
  const medianIncome = data.median_income ?? 0;
  const ami = data.ami ?? 0;
  const percentageOfAmi = data.percentage_of_ami ?? 0;
  
  // Format address to avoid undefined values
  const formatAddress = () => {
    if (!data.address) return "Address unavailable";
    
    // Clean up the address to remove any UNDEFINED values that might be in the string
    return data.address
      .replace(/undefined/gi, "")
      .replace(/,\s*,/g, ",")
      .replace(/\s+/g, " ")
      .trim();
  };
  
  return (
    <div
      className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <Card className={`border-2 overflow-hidden ${isEligible ? 'border-green-600' : 'border-red-600'}`}>
        <div className={`${isEligible ? 'bg-green-100' : 'bg-red-100'} p-4 relative overflow-hidden`}>
          <div className="absolute right-0 top-0 p-4">
            {isEligible ? (
              <CheckCircle2Icon className="h-8 w-8 text-green-600" />
            ) : (
              <XCircleIcon className="h-8 w-8 text-red-600" />
            )}
          </div>
          
          <CardHeader className="p-0 space-y-1">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${isEligible ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'} rounded-md`}
              >
                {data.lmi_status || (isEligible ? 'LMI Eligible' : 'Not Eligible')}
              </Badge>
              {data.income_category && data.income_category !== 'Unknown' && (
                <Badge 
                  variant="outline" 
                  className="bg-primary/10 text-primary rounded-md"
                >
                  {data.income_category}
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl md:text-2xl font-semibold mt-2">
              {data.approval_message || (isEligible ? 'Property is in an LMI area' : 'Property is not in an LMI area')}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 mt-4">
            <div className="flex items-center text-muted-foreground">
              <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <p className="text-sm truncate">{formatAddress()}</p>
            </div>
          </CardContent>
        </div>
        
        <Separator />
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Census Tract</p>
            <p className="font-medium">{data.tract_id || 'Unknown'}</p>
          </div>
          
          {medianIncome > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSignIcon className="h-3.5 w-3.5" />
                <p>Median Income</p>
              </div>
              <p className="font-medium">${medianIncome.toLocaleString()}</p>
            </div>
          )}
          
          {percentageOfAmi > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <PercentIcon className="h-3.5 w-3.5" />
                <p>Percentage of AMI</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{percentageOfAmi}%</p>
                {ami > 0 && (
                  <span className="text-xs text-muted-foreground">
                    (AMI: ${ami.toLocaleString()})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ResultCard;
