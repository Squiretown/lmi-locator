
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SignOutAllUsersButton from "@/components/admin/SignOutAllUsersButton";

const AdminTools: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Tools</CardTitle>
        <CardDescription>
          Administrative tools for managing users and system functions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">User Management</h3>
            <p className="text-sm text-muted-foreground">
              Global operations that affect all users in the system
            </p>
          </div>
          <Separator />
          <div className="grid gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Sign Out Users</h4>
              <p className="text-xs text-muted-foreground mb-4">
                This will force all users to log out and require them to sign in again.
              </p>
              <SignOutAllUsersButton />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        These operations require admin privileges and will be logged for security purposes.
      </CardFooter>
    </Card>
  );
};

export default AdminTools;
