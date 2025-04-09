
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { signOutAllUsers } from '@/lib/auth/auth-operations';
import { toast } from 'sonner';
import { MoreHorizontal, Shield, Ban, UserCheck, Lock, LockOpen } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: {
    user_type?: string;
    first_name?: string;
    last_name?: string;
  };
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, you might need to use a Supabase Edge Function for this
        // as it requires admin privileges
        const { data, error } = await supabase.auth.admin.listUsers();
        
        if (error) throw error;
        
        setUsers(data.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. You may not have sufficient permissions.');
        toast.error('Failed to load users. You may not have sufficient permissions.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleResetPassword = async (userId: string) => {
    try {
      // This would typically be handled through an admin API or Edge Function
      toast.info('Password reset functionality will be available soon.');
    } catch (err) {
      console.error('Error resetting password:', err);
      toast.error('Failed to reset password');
    }
  };

  const handleDisableUser = async (userId: string) => {
    try {
      // This would typically be handled through an admin API or Edge Function
      toast.info('User disable functionality will be available soon.');
    } catch (err) {
      console.error('Error disabling user:', err);
      toast.error('Failed to disable user');
    }
  };

  const handleSignOutAllUsers = async () => {
    try {
      const result = await signOutAllUsers();
      
      if (result.success) {
        toast.success('All users have been signed out successfully');
      } else {
        toast.error(`Failed to sign out users: ${result.error?.message}`);
      }
    } catch (err) {
      console.error('Error signing out all users:', err);
      toast.error('Failed to sign out users');
    }
  };

  const getUserTypeBadge = (userType?: string) => {
    if (!userType) return <Badge variant="outline">Standard</Badge>;
    
    switch (userType) {
      case 'admin':
        return <Badge className="bg-purple-600">Admin</Badge>;
      case 'mortgage_professional':
        return <Badge className="bg-blue-600">Mortgage Pro</Badge>;
      case 'realtor':
        return <Badge className="bg-green-600">Realtor</Badge>;
      case 'client':
        return <Badge className="bg-orange-600">Client</Badge>;
      default:
        return <Badge variant="outline">{userType}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage users and their access permissions
          </CardDescription>
        </div>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleSignOutAllUsers}
        >
          <LockOpen className="mr-2 h-4 w-4" />
          Sign Out All Users
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getUserTypeBadge(user.user_metadata?.user_type)}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString() 
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleResetPassword(user.id)}
                          className="flex items-center"
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          <span>Reset Password</span>
                        </DropdownMenuItem>
                        {user.user_metadata?.user_type !== 'admin' && (
                          <DropdownMenuItem 
                            onClick={() => handleDisableUser(user.id)}
                            className="flex items-center text-red-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            <span>Disable User</span>
                          </DropdownMenuItem>
                        )}
                        {user.user_metadata?.user_type !== 'admin' && (
                          <DropdownMenuItem className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Change Role</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="flex items-center">
                          <UserCheck className="mr-2 h-4 w-4" />
                          <span>View Profile</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
