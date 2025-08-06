
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
              <TableHead>Location</TableHead>
              <TableHead>LMI Status</TableHead>
              <TableHead>AMI %</TableHead>
              <TableHead>Income Category</TableHead>
              <TableHead className="text-right">Population</TableHead>
              <TableHead className="text-right">Households</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTracts.length > 0 ? (
              filteredTracts.map((tract, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium font-mono text-sm">{tract.tractId}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{tract.county || 'Unknown County'}</div>
                      <div className="text-muted-foreground">{tract.state || 'Unknown State'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tract.isLmiEligible ? "success" : "destructive"} className="gap-1">
                      {tract.isLmiEligible ? 
                        <><CheckCircle className="h-3 w-3" /> Eligible</> : 
                        <><XCircle className="h-3 w-3" /> Not Eligible</>
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{tract.amiPercentage?.toFixed(1) || '0.0'}%</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tract.incomeCategory || 'Unknown'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {tract.population?.toLocaleString() || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {tract.propertyCount?.toLocaleString() || 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
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
