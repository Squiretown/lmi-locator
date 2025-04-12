
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Tract {
  tractId: string;
  isLmiEligible: boolean;
  amiPercentage: number;
  propertyCount: number;
}

interface CensusTractsTableProps {
  tracts: Tract[];
}

export const CensusTractsTable: React.FC<CensusTractsTableProps> = ({ tracts }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Census Tracts</h3>
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tract ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                LMI Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                AMI %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Properties
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {tracts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">
                  No tracts found for this search
                </td>
              </tr>
            ) : (
              tracts.map((tract, index) => (
                <tr key={index} className={tract.isLmiEligible ? "bg-green-50" : ""}>
                  <td className="px-4 py-3 text-sm font-medium">
                    {tract.tractId}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={tract.isLmiEligible ? "success" : "outline"}>
                      {tract.isLmiEligible ? "LMI" : "Non-LMI"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {tract.amiPercentage}%
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {tract.propertyCount.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
