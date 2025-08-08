import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building, Mail, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLendingTeamManagement } from '@/hooks/useLendingTeamManagement';

interface AddExistingTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  professionalId: string;
  role: string;
}

const TEAM_ROLES = [
  { value: 'loan_officer', label: 'Loan Officer' },
  { value: 'loan_processor', label: 'Loan Processor' },
  { value: 'underwriter', label: 'Underwriter' },
  { value: 'team_member', label: 'Team Member' },
  { value: 'senior_loan_officer', label: 'Senior Loan Officer' },
];

export const AddExistingTeamMemberDialog: React.FC<AddExistingTeamMemberDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { availableProfessionals, addTeamMember, isAdding } = useLendingTeamManagement();
  
  const {
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      role: 'team_member',
    },
  });

  const selectedProfessionalId = watch('professionalId');
  const selectedRole = watch('role');
  const selectedProfessional = availableProfessionals.find(p => p.id === selectedProfessionalId);

  const onSubmit = (data: FormData) => {
    addTeamMember({
      professionalId: data.professionalId,
      role: data.role,
      permissions: {
        can_view_clients: true,
        can_edit_clients: data.role === 'senior_loan_officer' || data.role === 'loan_officer',
        can_manage_team: data.role === 'senior_loan_officer',
      },
    });
    
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Existing Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Professional</Label>
            <Select 
              value={selectedProfessionalId || ''} 
              onValueChange={(value) => setValue('professionalId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a mortgage professional" />
              </SelectTrigger>
              <SelectContent>
                {availableProfessionals.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {professional.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{professional.name}</div>
                        <div className="text-xs text-muted-foreground">{professional.company}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableProfessionals.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No available professionals to add. All mortgage professionals in the system are already on your team.
              </p>
            )}
          </div>

          {selectedProfessional && (
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedProfessional.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="font-medium">{selectedProfessional.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {selectedProfessional.company}
                    </div>
                    {selectedProfessional.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedProfessional.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Team Role</Label>
            <Select value={selectedRole} onValueChange={(value) => setValue('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isAdding || !selectedProfessionalId || availableProfessionals.length === 0}
            >
              {isAdding ? 'Adding...' : 'Add to Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};