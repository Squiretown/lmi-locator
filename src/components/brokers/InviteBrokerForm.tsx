
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMortgageTeamManagement } from '@/hooks/useMortgageTeamManagement';
import { Loader2 } from 'lucide-react';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.string().min(1, 'Role is required'),
  message: z.string().optional(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteBrokerFormProps {
  onSuccess: () => void;
}

export const InviteBrokerForm: React.FC<InviteBrokerFormProps> = ({
  onSuccess,
}) => {
  const { inviteProfessional, isInviting } = useMortgageTeamManagement();

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
      await inviteProfessional({
        email: data.email,
        role: data.role,
        message: data.message,
        professionalType: 'mortgage_professional',
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
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="Enter broker's email address"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          {...register('role')}
          placeholder="Enter the broker's role"
        />
        {errors.role && (
          <p className="text-sm text-red-600">{errors.role.message}</p>
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
          disabled={isInviting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isInviting}>
          {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Invitation
        </Button>
      </div>
    </form>
  );
};
