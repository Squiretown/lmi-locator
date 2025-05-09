
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchResult } from "./types";

interface SearchResultsTableProps {
  results: SearchResult[];
  isLoading: boolean;
}

export const SearchResultsTable: React.FC<SearchResultsTableProps> = ({
  results,
  isLoading
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>City</TableHead>
            <TableHead>State</TableHead>
            <TableHead>ZIP</TableHead>
            <TableHead>LMI Eligible</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <span className="text-muted-foreground">No results found</span>
                )}
              </TableCell>
            </TableRow>
          ) : (
            <>
              {results.slice(0, 50).map((prop, index) => (
                <TableRow key={index}>
                  <TableCell>{prop.address}</TableCell>
                  <TableCell>{prop.city}</TableCell>
                  <TableCell>{prop.state}</TableCell>
                  <TableCell>{prop.zip_code}</TableCell>
                  <TableCell>
                    {prop.is_eligible === undefined ? (
                      <span className="text-yellow-500">Pending</span>
                    ) : prop.is_eligible ? (
                      <span className="text-green-500">Yes</span>
                    ) : (
                      <span className="text-red-500">No</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {results.length > 50 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Showing 50 of {results.length} results. Export to CSV to view all.
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
