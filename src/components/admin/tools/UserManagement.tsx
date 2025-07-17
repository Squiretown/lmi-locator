
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Database } from "lucide-react";
import SignOutAllUsersButton from "@/components/admin/SignOutAllUsersButton";

export const UserManagement: React.FC = () => {
  const [isNormalizing, setIsNormalizing] = useState(false);

  const handleNormalizeUserData = async () => {
    try {
      setIsNormalizing(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('normalize-user-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Failed to normalize user data');
      }

      toast.success(`User data normalized! Fixed ${data.fixedCount} issues across ${data.totalUsers} users.`);
      
      if (data.issues && data.issues.length > 0) {
        console.warn('Normalization issues:', data.issues);
        toast.info(`${data.issues.length} issues encountered - check console for details`);
      }
    } catch (err) {
      console.error('Error normalizing user data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to normalize user data';
      toast.error(errorMessage);
    } finally {
      setIsNormalizing(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Global User Operations</h3>
      <div className="flex flex-col space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sign Out All Users</CardTitle>
            <CardDescription>
              This will force all users to log out and require them to sign in again.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <SignOutAllUsersButton />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Verify Pending Users</CardTitle>
            <CardDescription>
              Review and approve users awaiting verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <Button variant="outline" onClick={() => toast.success("Redirecting to user verification page")}>
              View Pending Verifications
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Normalize User Data</CardTitle>
            <CardDescription>
              Fix inconsistencies between early and recent users. Creates missing profiles and professional records.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <Button 
              variant="outline" 
              onClick={handleNormalizeUserData} 
              disabled={isNormalizing}
            >
              {isNormalizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Normalizing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Normalize User Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">User Authentication Settings</CardTitle>
            <CardDescription>
              Configure password policy, MFA requirements, and session duration.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <Button variant="outline" onClick={() => toast.success("Auth settings page not implemented")}>
              Edit Auth Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
