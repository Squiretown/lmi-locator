
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useMarketingSearch } from '@/hooks/useMarketingSearch';
import { SearchForm } from '@/components/marketing/SearchForm';
import { SearchResults } from '@/components/marketing/SearchResults';

const LmiMarketingList: React.FC = () => {
  const { user, userType } = useAuth();
  const { permissions, isLoading: permissionsLoading } = usePermissions([
    'marketing_list_search',
    'marketing_list_export',
    'admin_access'
  ]);
  
  const canSearch = permissions['marketing_list_search'] || userType === 'mortgage_professional';
  const canExport = permissions['marketing_list_export'];

  const {
    searchType,
    setSearchType,
    searchValue,
    setSearchValue,
    searchName,
    setSearchName,
    results,
    isLoading,
    handleSearch,
    handleExport
  } = useMarketingSearch();

  if (permissionsLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-muted-foreground">Loading permissions...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to access marketing lists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">LMI Marketing List Generator</h1>
      
      {!canSearch && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your account doesn't have permission to generate marketing lists. Please contact an administrator for access.
          </AlertDescription>
        </Alert>
      )}
      
      {canSearch && (
        <SearchForm
          searchType={searchType}
          onSearchTypeChange={setSearchType}
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          searchName={searchName}
          onSearchNameChange={setSearchName}
          onSearch={handleSearch}
          isLoading={isLoading}
          canSearch={canSearch}
        />
      )}

      <SearchResults
        results={results}
        onExport={handleExport}
        canExport={canExport}
      />
    </div>
  );
};

export default LmiMarketingList;
