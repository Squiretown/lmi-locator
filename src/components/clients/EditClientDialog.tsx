
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { ClientProfile } from '@/hooks/useClientManagement';

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientProfile | null;
  onSubmit: (data: any) => Promise<any>;
  isLoading?: boolean;
}

export const EditClientDialog: React.FC<EditClientDialogProps> = ({
  open,
  onOpenChange,
  client,
  onSubmit,
  isLoading = false,
}) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (client && open) {
      reset({
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email || '',
        phone: client.phone || '',
        income: client.income || '',
        household_size: client.household_size || '',
        military_status: client.military_status || 'none',
        timeline: client.timeline || '',
        first_time_buyer: client.first_time_buyer || false,
        notes: client.notes || '',
      });
    }
  }, [client, open, reset]);

  const handleFormSubmit = async (data: any) => {
    if (!client) return;
    
    try {
      await onSubmit({ id: client.id, ...data });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const firstTimeBuyer = watch('first_time_buyer');

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Update client information for {client.first_name} {client.last_name}.
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john.smith@example.com"
              />
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
              <Select onValueChange={(value) => setValue('military_status', value)} defaultValue={client.military_status || 'none'}>
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
              <Select onValueChange={(value) => setValue('timeline', value)} defaultValue={client.timeline || ''}>
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
