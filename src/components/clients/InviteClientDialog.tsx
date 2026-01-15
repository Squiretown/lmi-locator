import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { useUnifiedInvitationSystem } from '@/hooks/useUnifiedInvitationSystem';
import { useMortgageTeamManagement } from '@/hooks/useMortgageTeamManagement';
import { ClientTeamShowcase } from '@/components/clients/ClientTeamShowcase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare, Users, Eye } from 'lucide-react';

interface ClientInvitationData {
  name?: string;
  email: string;
  phone?: string;
  invitationType: 'email' | 'sms' | 'both';
  templateType?: string;
  customMessage?: string;
}

interface InviteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteClientDialog: React.FC<InviteClientDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [selectedPartnerId, setSelectedPartnerId] = React.useState<string>('none');
  const { currentProfessional, teamMembers, realtorPartners } = useMortgageTeamManagement();
  const { sendInvitation, isSending } = useUnifiedInvitationSystem();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ClientInvitationData>({
    defaultValues: {
      invitationType: 'email',
      templateType: 'default',
    }
  });

  // Determine if current user is a realtor or mortgage professional
  const isRealtor = currentProfessional?.professional_type === 'realtor';
  const partnerLabel = isRealtor ? 'Assign Mortgage Professional (Optional)' : 'Assign Realtor (Optional)';
  const partnerPlaceholder = isRealtor ? 'Select a mortgage professional for this client' : 'Select a realtor for this client';
  
  // Get available partners based on current user type
  const availablePartners = isRealtor 
    ? teamMembers.filter(m => m.type === 'mortgage_professional' && !m.isAccountOwner)
    : realtorPartners;

  const invitationType = watch('invitationType');

  const handleFormSubmit = async (data: ClientInvitationData) => {
    try {
      await sendInvitation({
        email: data.email,
        userType: 'client',
        firstName: data.name?.split(' ')[0],
        lastName: data.name?.split(' ').slice(1).join(' ') || undefined,
        phone: data.phone,
        sendVia: data.invitationType,
        customMessage: data.customMessage,
        // @ts-ignore - team_showcase is custom field
        team_showcase: selectedPartnerId !== 'none' ? {
          assignedPartnerId: selectedPartnerId
        } : undefined
      } as any);
      reset();
      setSelectedPartnerId('none');
      onOpenChange(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const getFilteredTeam = () => {
    const team = teamMembers.filter(m => m.type === 'mortgage_professional');
    
    if (selectedPartnerId && selectedPartnerId !== 'none') {
      // For mortgage professionals, find the realtor partner
      // For realtors, find the mortgage professional partner
      if (isRealtor) {
        const mortgagePro = teamMembers.find(m => m.id === selectedPartnerId && m.type === 'mortgage_professional');
        if (mortgagePro) {
          // Already in team array from filter above
        }
      } else {
        const realtor = realtorPartners?.find(r => r.realtor.id === selectedPartnerId);
        if (realtor) {
          team.push({
            id: realtor.realtor.id,
            name: realtor.realtor.name,
            company: realtor.realtor.company,
            email: realtor.realtor.email,
            phone: realtor.realtor.phone,
            type: 'realtor' as const,
            professional_type: 'realtor',
            source: 'explicit' as const,
            visibility_settings: {
              visible_to_clients: true,
              showcase_role: 'Realtor Partner',
              showcase_description: `Real Estate Agent at ${realtor.realtor.company}`
            }
          });
        }
      }
    }
    
    return team;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite New Client
          </DialogTitle>
          <DialogDescription>
            Send an invitation to a potential client via email or SMS with a unique code.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="invite" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invite">Client Details</TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Team Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invite">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required for all invitations'
                  })}
                  placeholder="john.smith@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Email is required (SMS-only coming soon)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone', {
                    validate: (value) => {
                      if (invitationType === 'sms' || invitationType === 'both') {
                        return (!!value || 'Phone number is required for SMS invitations');
                      }
                      return true;
                    },
                  })}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Required for SMS invitations
                </p>
              </div>

              {/* Partner Assignment - Dynamic based on user type */}
              <div className="space-y-2">
                <Label htmlFor="assignedPartner">{partnerLabel}</Label>
                <Select 
                  value={selectedPartnerId} 
                  onValueChange={setSelectedPartnerId}
                >
                  <SelectTrigger id="assignedPartner">
                    <SelectValue placeholder={partnerPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No partner assigned yet</SelectItem>
                    {isRealtor ? (
                      // For realtors, show mortgage professionals from team
                      availablePartners?.map((partner: any) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.name} - {partner.company}
                        </SelectItem>
                      ))
                    ) : (
                      // For mortgage professionals, show realtor partners
                      (availablePartners as any)?.map((partner: any) => (
                        <SelectItem key={partner.realtor.id} value={partner.realtor.id}>
                          {partner.realtor.name} - {partner.realtor.company}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Only the selected {isRealtor ? 'mortgage professional' : 'realtor'} will appear in this client's team
                </p>
              </div>

              <div className="space-y-3">
                <Label>Invitation Method</Label>
                <RadioGroup
                  value={invitationType}
                  onValueChange={(value) => setValue('invitationType', value as 'email' | 'sms' | 'both')}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email-option" />
                    <Label htmlFor="email-option" className="flex items-center gap-2 cursor-pointer">
                      <Mail className="h-4 w-4" />
                      Email only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="sms-option" />
                    <Label htmlFor="sms-option" className="flex items-center gap-2 cursor-pointer">
                      <MessageSquare className="h-4 w-4" />
                      SMS only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both-option" />
                    <Label htmlFor="both-option" className="flex items-center gap-2 cursor-pointer">
                      <Mail className="h-4 w-4" />
                      <MessageSquare className="h-4 w-4" />
                      Both Email & SMS
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateType">Template Type</Label>
                <Select onValueChange={(value) => setValue('templateType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Welcome</SelectItem>
                    <SelectItem value="mortgage">Mortgage Services</SelectItem>
                    <SelectItem value="realtor">Real Estate Services</SelectItem>
                    <SelectItem value="consultation">Consultation Invite</SelectItem>
                    <SelectItem value="custom">Custom Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customMessage">Custom Message (Optional)</Label>
                <Textarea
                  id="customMessage"
                  {...register('customMessage')}
                  placeholder="Add a personal message to your invitation..."
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  This message will be included with the invitation template
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="preview">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                This is how your team will appear to the client:
              </div>
              <ClientTeamShowcase 
                teamMembers={getFilteredTeam()} 
                title="Meet Your Professional Team"
                compact={true}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};