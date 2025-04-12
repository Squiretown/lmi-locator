
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export const RecentSearches: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent LMI Property Searches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">123 Main St, Anytown, CA</p>
                <p className="text-sm text-muted-foreground">Tract: 06037154200 - {i % 2 === 0 ? 'Eligible' : 'Not Eligible'}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">{i % 2 === 0 ? 'LMI Eligible' : 'Not Eligible'}</span>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-4 w-full">
          <Search className="mr-2 h-4 w-4" />
          Search More Properties
        </Button>
      </CardContent>
    </Card>
  );
};
