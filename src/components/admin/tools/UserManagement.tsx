
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import SignOutAllUsersButton from "@/components/admin/SignOutAllUsersButton";

export const UserManagement: React.FC = () => {
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
