
import React from 'react';
import { Search } from 'lucide-react';

interface RealtorSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const RealtorSearch: React.FC<RealtorSearchProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="mb-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search realtors..."
          className="pl-8 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export default RealtorSearch;
