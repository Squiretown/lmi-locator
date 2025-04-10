
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SearchHistory } from '../types';

interface SearchHistoryTableProps {
  filteredRecords: SearchHistory[];
  isLoading: boolean;
}

export default function SearchHistoryTable({ filteredRecords, isLoading }: SearchHistoryTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Eligible</TableHead>
            <TableHead>Tract ID</TableHead>
            <TableHead>Income Category</TableHead>
            <TableHead>Results</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">Loading search history...</TableCell>
            </TableRow>
          ) : filteredRecords.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">No search history records found</TableCell>
            </TableRow>
          ) : (
            filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.address}</TableCell>
                <TableCell>{new Date(record.searched_at).toLocaleString()}</TableCell>
                <TableCell>
                  {record.is_eligible === null ? (
                    <Badge variant="outline">Unknown</Badge>
                  ) : record.is_eligible ? (
                    <Badge variant="success">Eligible</Badge>
                  ) : (
                    <Badge variant="destructive">Not Eligible</Badge>
                  )}
                </TableCell>
                <TableCell>{record.tract_id || '-'}</TableCell>
                <TableCell>{record.income_category || '-'}</TableCell>
                <TableCell>{record.result_count}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
