
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BulkAddressFormProps {
  searchName: string;
  bulkAddresses: string;
  onSearchNameChange: (value: string) => void;
  onBulkAddressesChange: (value: string) => void;
}

export const BulkAddressForm: React.FC<BulkAddressFormProps> = ({
  searchName,
  bulkAddresses,
  onSearchNameChange,
  onBulkAddressesChange
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="searchName">Search Name</Label>
        <Input 
          id="searchName"
          placeholder="Name this search for reference"
          value={searchName}
          onChange={(e) => onSearchNameChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bulkAddresses">Enter addresses (one per line)</Label>
        <Textarea 
          id="bulkAddresses"
          placeholder="123 Main St, Anytown, CA, 90210&#10;456 Oak Ave, Othertown, CA, 90211"
          value={bulkAddresses}
          onChange={(e) => onBulkAddressesChange(e.target.value)}
          className="min-h-[200px]"
        />
        <p className="text-sm text-muted-foreground">
          Format: Street Address, City, State, ZIP (comma separated)
        </p>
      </div>
    </div>
  );
};
