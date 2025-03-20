
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AssistanceProgram } from '@/lib/types';
import { ArrowUpRightIcon, DollarSignIcon, CalendarIcon, CheckCircleIcon, InfoIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProgramResultsProps {
  programs: AssistanceProgram[];
  address: string;
  onConnectSpecialist: () => void;
}

const ProgramResults: React.FC<ProgramResultsProps> = ({ 
  programs,
  address,
  onConnectSpecialist
}) => {
  const { toast } = useToast();
  
  if (!programs || programs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl mx-auto mt-8"
      >
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No Matching Programs Found</CardTitle>
            <CardDescription>
              We couldn't find any assistance programs matching your criteria for {address}.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <InfoIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              This doesn't mean you won't qualify for assistance. There may be other programs not in our database.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={onConnectSpecialist}>
              Connect with a Specialist
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }
  
  const saveProgramInfo = async (program: AssistanceProgram) => {
    try {
      // Get user session if available
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        // Create a lead if the user is logged in
        const { error } = await supabase
          .from('professional_leads')
          .insert({
            professional_id: null, // Will be assigned to an available professional
            client_name: 'Self-Generated Lead',
            source: 'program_info_request',
            property_address: address,
            status: 'new',
            eligible_programs: [program]
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Information Requested",
        description: `You've requested more information about ${program.name}. A specialist will contact you soon.`,
      });
    } catch (error) {
      console.error('Error saving program info request:', error);
      toast({
        title: "Error",
        description: "Failed to save your information request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto mt-8"
    >
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold">You may qualify for {programs.length} assistance program{programs.length !== 1 ? 's' : ''}!</h2>
        <p className="text-muted-foreground mt-1">
          These programs may help with your down payment or closing costs for {address}.
        </p>
      </div>
      
      <div className="space-y-4">
        {programs.map((program) => (
          <Card key={program.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{program.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {program.funding_source}
                  </CardDescription>
                </div>
                <Badge variant={program.benefit_type === 'grant' ? 'secondary' : 'outline'}>
                  {program.benefit_type === 'grant' ? 'Grant' : program.benefit_type === 'loan' ? 'Loan' : 'Assistance'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="flex items-center text-sm">
                    <DollarSignIcon className="h-4 w-4 mr-2 text-primary" />
                    <span>
                      {program.benefit_amount
                        ? typeof program.benefit_amount === 'number'
                          ? `$${program.benefit_amount.toLocaleString()}`
                          : program.benefit_amount
                        : 'Varies'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                    <span>Apply by {new Date().toLocaleDateString()}</span>
                  </div>
                  
                  {program.first_time_buyer_required && (
                    <div className="flex items-center text-sm col-span-2">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-primary" />
                      <span>First-Time Homebuyer Required</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Program Details</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{program.name}</DialogTitle>
                    <DialogDescription>
                      {program.funding_source}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1">Description</h4>
                      <p className="text-sm">{program.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Benefits</h4>
                      <p className="text-sm">
                        {program.benefit_type === 'grant' 
                          ? `Grant of $${program.benefit_amount?.toLocaleString() || 'Varies'}`
                          : program.benefit_type === 'loan'
                          ? `Loan of $${program.benefit_amount?.toLocaleString() || 'Varies'}`
                          : `${program.benefit_type} assistance of $${program.benefit_amount?.toLocaleString() || 'Varies'}`}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Requirements</h4>
                      <ul className="text-sm space-y-1">
                        {program.income_limit_percentage && (
                          <li>• Income must be below {program.income_limit_percentage}% of AMI</li>
                        )}
                        {program.first_time_buyer_required && (
                          <li>• Must be a first-time homebuyer</li>
                        )}
                        {program.min_credit_score && (
                          <li>• Minimum credit score: {program.min_credit_score}</li>
                        )}
                        {program.military_status_required && program.military_status_required !== 'none' && (
                          <li>• Military status: {program.military_status_required}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  <DialogFooter className="sm:justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => saveProgramInfo(program)}
                    >
                      Request Information
                    </Button>
                    
                    {program.application_url && (
                      <Button asChild>
                        <a href={program.application_url} target="_blank" rel="noopener noreferrer">
                          Apply Now <ArrowUpRightIcon className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {program.application_url && (
                <Button asChild>
                  <a href={program.application_url} target="_blank" rel="noopener noreferrer">
                    Apply Now <ArrowUpRightIcon className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <Button 
          variant="secondary" 
          className="mx-auto"
          onClick={onConnectSpecialist}
        >
          Connect with a Down Payment Assistance Specialist
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Our specialists can help determine your exact eligibility and guide you through the application process.
        </p>
      </div>
    </motion.div>
  );
};

export default ProgramResults;
