
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download, Search } from "lucide-react";
import { format } from "date-fns";
import { DateRangeType } from '../types';

interface SearchHistoryFiltersProps {
  addressFilter: string;
  setAddressFilter: (value: string) => void;
  dateRange: DateRangeType;
  setDateRange: (value: DateRangeType) => void;
  handleExport: () => void;
}

export default function SearchHistoryFilters({
  addressFilter, 
  setAddressFilter,
  dateRange,
  setDateRange,
  handleExport
}: SearchHistoryFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filter by address or tract ID"
            className="pl-8 w-[250px] md:w-[300px]"
            value={addressFilter}
            onChange={(e) => setAddressFilter(e.target.value)}
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 gap-1">
              <CalendarIcon className="h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MM/dd/yyyy")} -{" "}
                    {format(dateRange.to, "MM/dd/yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MM/dd/yyyy")
                )
              ) : (
                "Date Range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                if (range) {
                  setDateRange(range);
                } else {
                  setDateRange({ from: undefined, to: undefined });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        
        {(addressFilter || dateRange.from) && (
          <Button variant="ghost" size="sm" onClick={() => {
            setAddressFilter('');
            setDateRange({ from: undefined, to: undefined });
          }}>
            Clear filters
          </Button>
        )}
      </div>
      
      <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
}
