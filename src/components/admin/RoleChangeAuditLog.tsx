import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, Shield, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface RoleChangeRecord {
  id: string;
  user_id: string;
  old_role: string;
  new_role: string;
  reason: string;
  changed_by: string;
  changed_at: string;
  is_bulk_change?: boolean;
  user_email?: string;
  changed_by_email?: string;
}

export const RoleChangeAuditLog: React.FC = () => {
  const [records, setRecords] = useState<RoleChangeRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<RoleChangeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    fetchRoleChanges();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, searchQuery, roleFilter, timeFilter]);

  const fetchRoleChanges = async () => {
    try {
      const { data, error } = await supabase
        .from('user_role_changes')
        .select(`
          *,
          user_profiles!user_role_changes_user_id_fkey(user_id),
          changed_by_profile:user_profiles!user_role_changes_changed_by_fkey(user_id)
        `)
        .order('changed_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get user emails from auth.users (this would need an edge function in a real implementation)
      const enrichedRecords = data || [];
      setRecords(enrichedRecords);
    } catch (error) {
      console.error('Error fetching role changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.user_email?.toLowerCase().includes(query) ||
        record.changed_by_email?.toLowerCase().includes(query) ||
        record.reason.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(record => 
        record.old_role === roleFilter || record.new_role === roleFilter
      );
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case '24h':
          filterDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          filterDate.setDate(now.getDate() - 30);
          break;
      }
      
      filtered = filtered.filter(record => 
        new Date(record.changed_at) >= filterDate
      );
    }

    setFilteredRecords(filtered);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'realtor':
      case 'mortgage_professional':
        return 'default';
      case 'client':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Change Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Change Audit Log
        </CardTitle>
        <CardDescription>
          Track all user role modifications and administrative actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by user email, admin, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="realtor">Realtor</SelectItem>
              <SelectItem value="mortgage_professional">Mortgage Professional</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[140px]">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Records List */}
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No role changes found matching your filters.
              </div>
            ) : (
              filteredRecords.map((record) => (
                <Card key={record.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {record.user_email || `User ${record.user_id.slice(0, 8)}...`}
                          </span>
                          {record.is_bulk_change && (
                            <Badge variant="outline" className="text-xs">
                              Bulk Change
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleBadgeVariant(record.old_role)} className="capitalize">
                            {record.old_role.replace('_', ' ')}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant={getRoleBadgeVariant(record.new_role)} className="capitalize">
                            {record.new_role.replace('_', ' ')}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          <strong>Reason:</strong> {record.reason}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            By: {record.changed_by_email || `Admin ${record.changed_by?.slice(0, 8)}...`}
                          </span>
                          <span>
                            {formatDistanceToNow(new Date(record.changed_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={fetchRoleChanges}>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};