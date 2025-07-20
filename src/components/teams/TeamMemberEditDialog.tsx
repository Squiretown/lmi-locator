
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';

interface TeamMember {
  id: string;
  realtor?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company: string;
    license_number: string;
  };
  status: string;
  notes?: string;
  created_at: string;
}

interface TeamMemberEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  onUpdate: () => void;
}

interface EditFormData {
  notes: string;
}

export const TeamMemberEditDialog: React.FC<TeamMemberEditDialogProps> = ({
  open,
  onOpenChange,
  member,
  onUpdate,
}) => {
  const { register, handleSubmit, reset } = useForm<EditFormData>({
    defaultValues: {
      notes: member.notes || '',
    },
  });

  const onSubmit = async (data: EditFormData) => {
    // Here you would typically call an API to update the team member
    console.log('Updating team member:', member.id, data);
    
    // For now, we'll just simulate the update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onUpdate();
  };

  React.useEffect(() => {
    if (open) {
      reset({
        notes: member.notes || '',
      });
    }
  }, [open, member, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Team Member
          </DialogTitle>
          <DialogDescription>
            Update information for {member.realtor?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Team Member Name</label>
            <Input
              value={member.realtor?.name || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Contact information is managed by the realtor
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Company</label>
            <Input
              value={member.realtor?.company || ''}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              {...register('notes')}
              placeholder="Add notes about this team member..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Private notes about your collaboration with this team member
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Update Team Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
