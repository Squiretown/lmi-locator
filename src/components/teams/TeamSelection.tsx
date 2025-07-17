import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeamManagement } from '@/hooks/useTeamManagement';

interface TeamSelectionProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({
  value,
  onValueChange,
  placeholder = "Select realtor (optional)"
}) => {
  const { teamMembers, isLoadingTeam } = useTeamManagement();

  if (isLoadingTeam) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading team members..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">No realtor assigned</SelectItem>
        {teamMembers.map((member) => (
          <SelectItem key={member.realtor_id} value={member.realtor_id}>
            {member.realtor?.name} - {member.realtor?.company}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};