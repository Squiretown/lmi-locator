
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { SearchHistory, DateRangeType } from '../types';

export const useSearchHistoryFilters = (searchRecords: SearchHistory[]) => {
  const [filteredRecords, setFilteredRecords] = useState<SearchHistory[]>([]);
  const [addressFilter, setAddressFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeType>({ 
    from: undefined, 
    to: undefined 
  });

  useEffect(() => {
    // Apply filters
    let filtered = searchRecords;

    if (addressFilter) {
      const lowercaseFilter = addressFilter.toLowerCase();
      filtered = filtered.filter(record => 
        record.address.toLowerCase().includes(lowercaseFilter) ||
        (record.tract_id && record.tract_id.toLowerCase().includes(lowercaseFilter))
      );
    }

    if (dateRange.from) {
      filtered = filtered.filter(record => 
        new Date(record.searched_at) >= dateRange.from!
      );
    }

    if (dateRange.to) {
      const toDateWithEndOfDay = new Date(dateRange.to);
      toDateWithEndOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(record => 
        new Date(record.searched_at) <= toDateWithEndOfDay
      );
    }

    setFilteredRecords(filtered);
  }, [addressFilter, dateRange, searchRecords]);

  const handleExport = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Address,Date,Eligible,Tract ID,Income Category,Result Count\n";
    
    filteredRecords.forEach(record => {
      const row = [
        `"${record.address}"`,
        new Date(record.searched_at).toLocaleString(),
        record.is_eligible ? 'Yes' : 'No',
        record.tract_id || '',
        record.income_category || '',
        record.result_count
      ].join(',');
      csvContent += row + "\n";
    });
    
    // Create download link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `search-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    filteredRecords,
    addressFilter,
    setAddressFilter,
    dateRange,
    setDateRange,
    handleExport
  };
};
