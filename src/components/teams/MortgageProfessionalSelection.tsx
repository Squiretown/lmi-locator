import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMortgageProfessionals } from '@/hooks/useMortgageProfessionals';

interface MortgageProfessionalSelectionProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const MortgageProfessionalSelection: React.FC<MortgageProfessionalSelectionProps> = ({
  value,
  onValueChange,
  placeholder = "Select mortgage professional (optional)"
}) => {
  const { mortgageProfessionals, isLoading } = useMortgageProfessionals();

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading mortgage professionals..." />
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
        <SelectItem value="none">No mortgage professional assigned</SelectItem>
        {mortgageProfessionals.map((professional) => (
          <SelectItem key={professional.id} value={professional.id}>
            {professional.name} - {professional.company}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};