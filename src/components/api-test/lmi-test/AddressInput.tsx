
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AddressInputProps {
  address: string;
  setAddress: (address: string) => void;
  searchType: 'address' | 'place';
}

const AddressInput: React.FC<AddressInputProps> = ({
  address,
  setAddress,
  searchType
}) => {
  const placeholderText = searchType === 'place' 
    ? 'Enter a place name (e.g., Boston, MA)' 
    : 'Enter an address to check LMI status';
    
  return (
    <div>
      <Label htmlFor="lmi-query">
        {searchType === 'place' ? 'Place Name' : 'Address'}
      </Label>
      <Input
        id="lmi-query"
        placeholder={placeholderText}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
    </div>
  );
};

export default AddressInput;
