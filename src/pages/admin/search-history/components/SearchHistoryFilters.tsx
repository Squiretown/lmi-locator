
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { DateRangeType } from '../types';

interface SearchHistoryFiltersProps {
  searchAddress: string;
  setSearchAddress: (value: string) => void;
  searchTractId: string;
  setSearchTractId: (value: string) => void;
  dateRange: DateRangeType;
  setDateRange: (value: DateRangeType) => void;
  showEligibleOnly: boolean;
  setShowEligibleOnly: (value: boolean) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

export default function SearchHistoryFilters({
  searchAddress,
  setSearchAddress,
  searchTractId,
  setSearchTractId,
  dateRange,
  setDateRange,
  showEligibleOnly,
  setShowEligibleOnly,
  applyFilters,
  resetFilters
}: SearchHistoryFiltersProps) {
  // Helper function to handle date range selection
  const handleDateRangeChange = (value: DateRangeType) => {
    setDateRange(value);
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Address</label>
            <Input
              placeholder="Search by address"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Tract ID</label>
            <Input
              placeholder="Search by tract ID"
              value={searchTractId}
              onChange={(e) => setSearchTractId(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                      </>
                    ) : (
                      dateRange.from.toLocaleDateString()
                    )
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to
                  }}
                  onSelect={(range: any) => {
                    handleDateRangeChange({
                      from: range?.from,
                      to: range?.to
                    });
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-end space-x-2">
            <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
            <Button variant="outline" onClick={resetFilters}>Reset</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
