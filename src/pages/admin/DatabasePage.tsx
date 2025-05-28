
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

const DatabasePage: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Database Management</CardTitle>
          </div>
          <CardDescription>
            Monitor and manage database operations and maintenance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Database Management</h3>
            <p className="text-muted-foreground">
              This feature is coming soon. You'll be able to manage database operations here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabasePage;
