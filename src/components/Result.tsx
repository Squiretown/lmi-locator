
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2Icon, XCircleIcon, MapPinIcon, DollarSignIcon, PercentIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface ResultProps {
  data: {
    address: string;
    tract_id: string;
    median_income: number;
    ami: number;
    income_category: string;
    percentage_of_ami: number;
    eligibility: string;
    approval_message: string;
    is_approved: boolean;
    lmi_status: string;
  };
}

const ResultCard: React.FC<ResultProps> = ({ data }) => {
  const isEligible = data.is_approved;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      <Card className={`border-2 overflow-hidden ${isEligible ? 'border-eligible' : 'border-ineligible'}`}>
        <div className={`${isEligible ? 'bg-eligible/10' : 'bg-ineligible/10'} p-4 relative overflow-hidden`}>
          <div className="absolute right-0 top-0 p-4">
            {isEligible ? (
              <CheckCircle2Icon className="h-8 w-8 text-eligible" />
            ) : (
              <XCircleIcon className="h-8 w-8 text-ineligible" />
            )}
          </div>
          
          <CardHeader className="p-0 space-y-1">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${isEligible ? 'bg-eligible/20 text-eligible-dark' : 'bg-ineligible/20 text-ineligible-dark'} rounded-md`}
              >
                {data.lmi_status}
              </Badge>
              <Badge 
                variant="outline" 
                className="bg-primary/10 text-primary rounded-md"
              >
                {data.income_category}
              </Badge>
            </div>
            <CardTitle className="text-xl md:text-2xl font-semibold mt-2">{data.approval_message}</CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 mt-4">
            <div className="flex items-center text-muted-foreground">
              <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <p className="text-sm truncate">{data.address}</p>
            </div>
          </CardContent>
        </div>
        
        <Separator />
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Census Tract</p>
            <p className="font-medium">{data.tract_id}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSignIcon className="h-3.5 w-3.5" />
              <p>Median Income</p>
            </div>
            <p className="font-medium">${data.median_income.toLocaleString()}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <PercentIcon className="h-3.5 w-3.5" />
              <p>Percentage of AMI</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{data.percentage_of_ami}%</p>
              <span className="text-xs text-muted-foreground">
                (AMI: ${data.ami.toLocaleString()})
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ResultCard;
