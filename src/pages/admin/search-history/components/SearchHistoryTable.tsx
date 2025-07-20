
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { SearchHistory } from '../types';
import { SearchResultDetailModal } from '../../../../components/admin/search-history/SearchResultDetailModal';

interface SearchHistoryTableProps {
  filteredRecords: SearchHistory[];
  isLoading: boolean;
}

export default function SearchHistoryTable({ filteredRecords, isLoading }: SearchHistoryTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<SearchHistory | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (record: SearchHistory) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">Loading search history...</TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">No search history records found</TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow 
                  key={record.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleViewDetails(record)}
                >
                  <TableCell>{record.address}</TableCell>
                  <TableCell>{new Date(record.searched_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {record.is_eligible === null ? (
                      <Badge variant="outline">Unknown</Badge>
                    ) : record.is_eligible ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">Eligible</Badge>
                    ) : (
                      <Badge variant="destructive">Not Eligible</Badge>
                    )}
                  </TableCell>
                  <TableCell>{record.tract_id || '-'}</TableCell>
                  <TableCell>{record.income_category || '-'}</TableCell>
                  <TableCell>{record.result_count}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(record);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SearchResultDetailModal
        searchRecord={selectedRecord}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
