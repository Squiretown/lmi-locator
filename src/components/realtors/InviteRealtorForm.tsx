
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInvitedContacts } from '@/hooks/useInvitedContacts';
import { Loader2 } from 'lucide-react';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(1, 'Name is required'),
  message: z.string().optional(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteRealtorFormProps {
  onSuccess: () => void;
}

export const InviteRealtorForm: React.FC<InviteRealtorFormProps> = ({
  onSuccess,
}) => {
  const { createInvitation, isCreatingInvitation } = useInvitedContacts();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
  });

  const onSubmit = async (data: InviteFormValues) => {
    try {
      await createInvitation({
        email: data.email,
        name: data.name,
      });
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Realtor Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter realtor's full name"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="Enter realtor's email address"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Personal Message (Optional)</Label>
        <Textarea
          id="message"
          {...register('message')}
          placeholder="Add a personal message to the invitation..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isCreatingInvitation}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isCreatingInvitation}>
          {isCreatingInvitation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Invitation
        </Button>
      </div>
    </form>
  );
};
