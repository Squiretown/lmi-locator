
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createProfessionalLead } from '@/lib/assistance-programs-api';
import { AssistanceProgram } from '@/lib/types';

interface ProgramResultsProps {
  programs: AssistanceProgram[];
  address?: string;
}

const ProgramResults: React.FC<ProgramResultsProps> = ({ programs, address }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedProgram, setSelectedProgram] = useState<AssistanceProgram | null>(null);
  const [leadData, setLeadData] = useState({
    clientName: '',
    email: '',
    phone: '',
    notes: ''
  });
  
  const handleConnect = (program: AssistanceProgram) => {
    setSelectedProgram(program);
    setIsDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLeadData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitLead = async () => {
    if (!leadData.clientName) {
      toast({
        title: "Error",
        description: "Please enter your name to continue.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create the lead in the database
      const success = await createProfessionalLead({
        client_name: leadData.clientName,
        email: leadData.email,
        phone: leadData.phone,
        property_address: address,
        notes: leadData.notes,
        source: "program_results"
      });
      
      if (success) {
        toast({
          title: "Request Submitted",
          description: "A specialist will contact you soon about this program.",
        });
        
        setIsDialogOpen(false);
        setLeadData({
          clientName: '',
          email: '',
          phone: '',
          notes: ''
        });
      } else {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (!programs || programs.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto my-8">
        <CardHeader>
          <CardTitle className="text-2xl">Available Programs</CardTitle>
          <CardDescription>Programs you may be eligible for based on the property location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No assistance programs found for this location</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-center">Available Programs</h2>
      <p className="text-gray-500 text-center">The following programs may be available based on the property location</p>
      
      <div className="grid grid-cols-1 gap-6">
        {programs.map((program) => (
          <Card key={program.id} className="overflow-hidden">
            <CardHeader className="bg-blue-50">
              <CardTitle>{program.name}</CardTitle>
              <CardDescription>{program.funding_source}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="text-gray-700">{program.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">Benefit</h4>
                  <p className="font-medium">
                    {program.benefit_amount ? `$${program.benefit_amount.toLocaleString()}` : ''} {program.benefit_type}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">Requirements</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {program.first_time_buyer_required && <li>First-time homebuyer</li>}
                    {program.min_credit_score && <li>Min. credit score: {program.min_credit_score}</li>}
                    {program.income_limit_percentage && (
                      <li>Income limit: {program.income_limit_percentage}% of Area Median Income</li>
                    )}
                    {program.military_status_required && <li>Military status: {program.military_status_required}</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              {program.application_url ? (
                <Button variant="outline" onClick={() => window.open(program.application_url, '_blank')}>
                  Visit Program Website
                </Button>
              ) : <div />}
              
              <Button onClick={() => handleConnect(program)}>Connect with Specialist</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect with a Program Specialist</DialogTitle>
            <DialogDescription>
              Complete this form to be connected with a specialist who can help you with the{' '}
              {selectedProgram?.name} program.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">
                Name
              </Label>
              <Input
                id="clientName"
                name="clientName"
                value={leadData.clientName}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={leadData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={leadData.phone}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                name="notes"
                value={leadData.notes}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitLead}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgramResults;
