
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StateSelectorProps {
  selectedState: string;
  states: Array<{code: string, name: string}>;
  onStateChange: (value: string) => void;
}

export const StateSelector: React.FC<StateSelectorProps> = ({ 
  selectedState, 
  states, 
  onStateChange 
}) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">State</label>
      <Select
        value={selectedState}
        onValueChange={onStateChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a state" />
        </SelectTrigger>
        <SelectContent>
          {states.map(state => (
            <SelectItem key={state.code} value={state.code}>
              {state.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
