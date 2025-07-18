import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const LMIListings: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // This could be expanded to filter saved addresses or search properties
      console.log('Searching for LMI listings:', searchQuery);
      // For now, we'll just show a message
      alert(`Searching for LMI listings with: ${searchQuery}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check New LMI Area Listings</CardTitle>
        <p className="text-sm text-muted-foreground">Find new listings that are located in an LMI Tract</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};