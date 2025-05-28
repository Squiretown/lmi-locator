
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const PermissionsPage: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Permissions Management</CardTitle>
          </div>
          <CardDescription>
            Manage user roles and permissions across the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Permissions Management</h3>
            <p className="text-muted-foreground">
              This feature is coming soon. You'll be able to manage user roles and permissions here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsPage;
