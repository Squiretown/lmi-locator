import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, Calculator, Search, Users, Calendar } from 'lucide-react';
import { CreateClientDialog } from '@/components/clients/CreateClientDialog';
import { InviteClientDialog } from '@/components/clients/InviteClientDialog';
import { useRealtorClientManagement } from '@/hooks/useRealtorClientManagement';
import { useUnifiedClientInvitations } from '@/hooks/useUnifiedClientInvitations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const QuickActions: React.FC = () => {
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [showInviteClient, setShowInviteClient] = useState(false);
  const [showLmiCalculator, setShowLmiCalculator] = useState(false);
  const [calculatorResult, setCalculatorResult] = useState<string>('');

  const { createClient, isCreating } = useRealtorClientManagement();
  const { createInvitation, isCreatingInvitation } = useUnifiedClientInvitations();

  const handleCreateClient = async (data: any) => {
    try {
      await createClient(data);
      setShowCreateClient(false);
      toast.success('Client created successfully');
    } catch (error) {
      toast.error('Failed to create client');
    }
  };

  const handleInviteClient = async (data: any) => {
    try {
      await createInvitation(data);
      setShowInviteClient(false);
      toast.success('Invitation sent successfully');
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  const calculateLmi = (income: number, householdSize: number) => {
    // Basic LMI calculation - this is a simplified version
    // In reality, this would use AMI data from your database
    const amiBase = 70000; // Example AMI for calculation
    const adjustedAmi = amiBase * (1 + (householdSize - 1) * 0.1);
    const lmiThreshold = adjustedAmi * 0.8;
    
    if (income <= lmiThreshold) {
      return `Likely LMI Eligible - Income $${income.toLocaleString()} is below threshold of $${lmiThreshold.toLocaleString()}`;
    } else {
      return `Likely Not LMI Eligible - Income $${income.toLocaleString()} exceeds threshold of $${lmiThreshold.toLocaleString()}`;
    }
  };

  const quickActions = [
    {
      title: 'Add Client',
      icon: UserPlus,
      onClick: () => setShowCreateClient(true),
      description: 'Create new client profile'
    },
    {
      title: 'LMI Calculator',
      icon: Calculator,
      onClick: () => setShowLmiCalculator(true),
      description: 'Quick eligibility estimate'
    },
    {
      title: 'Invite Contact',
      icon: Mail,
      onClick: () => setShowInviteClient(true),
      description: 'Send client invitation'
    },
    {
      title: 'Check Property',
      icon: Search,
      onClick: () => window.open('/property-checker', '_blank'),
      description: 'LMI property lookup'
    },
    {
      title: 'New Campaign',
      icon: Users,
      onClick: () => window.open('/dashboard/marketing', '_blank'),
      description: 'Create marketing campaign'
    },
    {
      title: 'Schedule Meet',
      icon: Calendar,
      onClick: () => toast.info('Scheduling feature coming soon'),
      description: 'Book appointment'
    }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={action.onClick}
              >
                <action.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Client Dialog */}
      <CreateClientDialog
        open={showCreateClient}
        onOpenChange={setShowCreateClient}
        onSubmit={handleCreateClient}
        isLoading={isCreating}
        userType="realtor"
      />

      {/* Invite Client Dialog */}
      <InviteClientDialog
        open={showInviteClient}
        onOpenChange={setShowInviteClient}
      />

      {/* LMI Calculator Dialog */}
      <Dialog open={showLmiCalculator} onOpenChange={setShowLmiCalculator}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick LMI Calculator</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const income = Number(formData.get('income'));
              const householdSize = Number(formData.get('householdSize'));
              
              if (income && householdSize) {
                const result = calculateLmi(income, householdSize);
                setCalculatorResult(result);
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="income">Annual Household Income</Label>
              <Input
                id="income"
                name="income"
                type="number"
                placeholder="e.g., 65000"
                required
              />
            </div>
            <div>
              <Label htmlFor="householdSize">Household Size</Label>
              <Input
                id="householdSize"
                name="householdSize"
                type="number"
                placeholder="e.g., 3"
                min="1"
                max="8"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Calculate Eligibility
            </Button>
            {calculatorResult && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{calculatorResult}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This is an estimate. Use property checker for accurate verification.
                </p>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};