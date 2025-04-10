
import React from 'react';
import { Search } from 'lucide-react';

interface BrokerSearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BrokerSearch: React.FC<BrokerSearchProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search brokers..."
          className="pl-8 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background w-full"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default BrokerSearch;
