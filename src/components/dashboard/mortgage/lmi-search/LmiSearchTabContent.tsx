
import React, { useState } from 'react';
import { useLmiSearch } from './hooks/useLmiSearch';
import { SearchTabContent } from './SearchTabContent';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface LmiSearchTabContentProps {
  onExportResults: (results: any[]) => void;
}

export const LmiSearchTabContent: React.FC<LmiSearchTabContentProps> = ({ onExportResults }) => {
  const {
    searchType,
    searchValue,
    isSearching,
    searchResults,
    counties,
    states,
    selectedState,
    setSearchType,
    setSearchValue,
    setSelectedState,
    handleSearch
  } = useLmiSearch();

  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async () => {
    if (!searchResults?.tracts?.length) {
      toast.error("Please perform a search first to generate results");
      return;
    }

    setExportLoading(true);
    try {
      // Process the data for export
      const processedResults = searchResults.tracts.map(tract => ({
        tractId: tract.tractId,
        isLmiEligible: tract.isLmiEligible,
        amiPercentage: tract.amiPercentage,
        medianIncome: tract.medianIncome,
        propertyCount: tract.propertyCount
      }));

      // Call the parent component's export function
      onExportResults(processedResults);
      
      toast.success(`Exported ${processedResults.length} census tracts`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Unable to export data. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleReportProblem = async () => {
    try {
      const searchParams = {
        searchType,
        searchValue,
        selectedState
      };
      
      await supabase.functions.invoke('census-db', {
        body: {
          action: 'reportSearchIssue',
          params: searchParams
        }
      });
      
      toast.success("Thank you for helping us improve our data. We'll investigate this issue.");
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error("There was a problem submitting your report. Please try again later.");
    }
  };

  return (
    <SearchTabContent
      searchType={searchType as 'county' | 'zip' | 'tract'}
      searchValue={searchValue}
      selectedState={selectedState}
      states={states}
      counties={counties}
      isSearching={isSearching}
      searchResults={searchResults}
      onSearchTypeChange={(type) => setSearchType(type)}
      onSearchValueChange={setSearchValue}
      onStateChange={setSelectedState}
      onSearch={handleSearch}
      onExport={handleExport}
      onReportProblem={handleReportProblem}
    />
  );
};
