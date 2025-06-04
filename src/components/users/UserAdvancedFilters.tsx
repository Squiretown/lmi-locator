
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';

interface UserAdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  onBulkAction: (action: string, selectedUsers: string[]) => void;
  selectedUsers: string[];
  totalUsers: number;
}

interface FilterState {
  status: string;
  role: string;
  timeRange: string;
}

export const UserAdvancedFilters: React.FC<UserAdvancedFiltersProps> = ({
  onFiltersChange,
  onBulkAction,
  selectedUsers,
  totalUsers,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    role: 'all',
    timeRange: 'all',
  });
  const [bulkAction, setBulkAction] = useState('');

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleBulkActionApply = () => {
    if (bulkAction && selectedUsers.length > 0) {
      onBulkAction(bulkAction, selectedUsers);
      setBulkAction('');
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="realtor">Realtor</SelectItem>
                <SelectItem value="mortgage_professional">Mortgage Professional</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.timeRange} onValueChange={(value) => handleFilterChange('timeRange', value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Checkbox checked={true} />
                <span className="text-sm text-muted-foreground">
                  {selectedUsers.length} of {totalUsers} selected
                </span>
              </div>
              
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Bulk Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate Selected</SelectItem>
                  <SelectItem value="deactivate">Deactivate Selected</SelectItem>
                  <SelectItem value="send_email">Send Email</SelectItem>
                  <SelectItem value="export">Export Selected</SelectItem>
                  <SelectItem value="delete">Delete Selected</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBulkActionApply}
                disabled={!bulkAction}
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
