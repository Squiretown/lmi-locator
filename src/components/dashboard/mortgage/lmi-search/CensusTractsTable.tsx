
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CensusTract } from './hooks/types/census-tract';
import { CheckCircle, XCircle, Search } from 'lucide-react';

interface CensusTractsTableProps {
  tracts: CensusTract[];
}

export const CensusTractsTable: React.FC<CensusTractsTableProps> = ({ tracts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTracts = tracts.filter(tract => 
    tract.tractId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by tract ID..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tract ID</TableHead>
              <TableHead>LMI Status</TableHead>
              <TableHead>AMI %</TableHead>
              <TableHead>Median Income</TableHead>
              <TableHead className="text-right">Properties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTracts.length > 0 ? (
              filteredTracts.map((tract, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{tract.tractId}</TableCell>
                  <TableCell>
                    <Badge variant={tract.isLmiEligible ? "success" : "destructive"} className="gap-1">
                      {tract.isLmiEligible ? 
                        <><CheckCircle className="h-3 w-3" /> Eligible</> : 
                        <><XCircle className="h-3 w-3" /> Not Eligible</>
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>{tract.amiPercentage}%</TableCell>
                  <TableCell>${tract.medianIncome.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{tract.propertyCount.toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  {searchQuery ? 'No matching tracts found' : 'No census tracts available'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Showing {filteredTracts.length} of {tracts.length} census tracts
      </div>
    </div>
  );
};
