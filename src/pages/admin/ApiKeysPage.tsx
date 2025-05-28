
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key } from "lucide-react";

const ApiKeysPage: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>API Keys Management</CardTitle>
          </div>
          <CardDescription>
            Manage API keys and external service integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Key className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">API Keys Management</h3>
            <p className="text-muted-foreground">
              This feature is coming soon. You'll be able to manage API keys here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeysPage;
