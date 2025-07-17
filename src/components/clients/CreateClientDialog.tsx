import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { CreateClientData } from '@/hooks/useClientManagement';
import { CreateRealtorClientData } from '@/hooks/useRealtorClientManagement';
import { TeamSelection } from '@/components/teams/TeamSelection';
import { MortgageProfessionalSelection } from '@/components/teams/MortgageProfessionalSelection';

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<any>;
  isLoading?: boolean;
  userType?: 'mortgage_professional' | 'realtor';
}

export const CreateClientDialog: React.FC<CreateClientDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  userType = 'mortgage_professional',
}) => {
  const [assignedRealtorId, setAssignedRealtorId] = useState<string>('');
  const [assignedMortgageProfessionalId, setAssignedMortgageProfessionalId] = useState<string>('');
  const [sendInvitation, setSendInvitation] = useState<boolean>(false);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  const handleFormSubmit = async (data: any) => {
    try {
      const submitData = userType === 'realtor' 
        ? { 
            ...data, 
            assignedMortgageProfessionalId: assignedMortgageProfessionalId || undefined,
            sendInvitation,
            invitationType: data.invitationType,
            templateType: data.templateType,
            customMessage: data.customMessage
          }
        : { ...data, assignedRealtorId: assignedRealtorId || undefined };
      
      await onSubmit(submitData);
      reset();
      setAssignedRealtorId('');
      setAssignedMortgageProfessionalId('');
      setSendInvitation(false);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const firstTimeBuyer = watch('first_time_buyer');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Create a new client profile for mortgage services.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register('first_name', { required: 'First name is required' })}
                placeholder="John"
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{String(errors.first_name.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register('last_name', { required: 'Last name is required' })}
                placeholder="Smith"
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{String(errors.last_name.message)}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email {sendInvitation && '*'}</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: sendInvitation ? 'Email is required when sending invitation' : false 
                })}
                placeholder="john.smith@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{String(errors.email.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="income">Annual Income</Label>
              <Input
                id="income"
                type="number"
                {...register('income', { valueAsNumber: true })}
                placeholder="75000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="household_size">Household Size</Label>
              <Input
                id="household_size"
                type="number"
                {...register('household_size', { valueAsNumber: true })}
                placeholder="2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="military_status">Military Status</Label>
              <Select onValueChange={(value) => setValue('military_status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="active">Active Duty</SelectItem>
                  <SelectItem value="veteran">Veteran</SelectItem>
                  <SelectItem value="reserves">Reserves</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Purchase Timeline</Label>
              <Select onValueChange={(value) => setValue('timeline', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate (0-3 months)</SelectItem>
                  <SelectItem value="short">Short-term (3-6 months)</SelectItem>
                  <SelectItem value="medium">Medium-term (6-12 months)</SelectItem>
                  <SelectItem value="long">Long-term (12+ months)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="first_time_buyer"
              checked={firstTimeBuyer || false}
              onCheckedChange={(checked) => setValue('first_time_buyer', checked)}
            />
            <Label htmlFor="first_time_buyer">First-time home buyer</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about the client..."
              className="min-h-[80px]"
            />
          </div>

          {/* Team Assignment */}
          <div className="space-y-2">
            {userType === 'mortgage_professional' ? (
              <>
                <Label>Assign Realtor</Label>
                <TeamSelection 
                  value={assignedRealtorId}
                  onValueChange={setAssignedRealtorId}
                  placeholder="Select a realtor to assign to this client"
                />
              </>
            ) : (
              <>
                <Label>Assign Mortgage Professional</Label>
                <MortgageProfessionalSelection 
                  value={assignedMortgageProfessionalId}
                  onValueChange={setAssignedMortgageProfessionalId}
                  placeholder="Select a mortgage professional to assign to this client"
                />
              </>
            )}
          </div>

          {/* Send Invitation Section */}
          {userType === 'realtor' && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send_invitation"
                  checked={sendInvitation}
                  onCheckedChange={(checked) => setSendInvitation(checked === true)}
                />
                <Label htmlFor="send_invitation">Send invitation to client</Label>
              </div>

              {sendInvitation && (
                <div className="space-y-4 pl-6 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="invitation_type">Invitation Type</Label>
                    <Select onValueChange={(value) => setValue('invitationType', value)} defaultValue="email">
                      <SelectTrigger>
                        <SelectValue placeholder="Select invitation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="both">Both Email & SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template_type">Template</Label>
                    <Select onValueChange={(value) => setValue('templateType', value)} defaultValue="default">
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Template</SelectItem>
                        <SelectItem value="welcome">Welcome Template</SelectItem>
                        <SelectItem value="professional">Professional Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom_message">Custom Message (Optional)</Label>
                    <Textarea
                      id="custom_message"
                      {...register('customMessage')}
                      placeholder="Add a personal message to the invitation..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};