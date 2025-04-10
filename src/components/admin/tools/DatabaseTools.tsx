
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertCircle, Database, RefreshCw, Terminal } from "lucide-react";

interface DbStatus {
  tables: number;
  size: string;
  lastBackup: string;
}

export const DatabaseTools: React.FC = () => {
  // State for Database Maintenance
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  useEffect(() => {
    // Simulating database status fetch
    const mockStatus = {
      tables: 32,
      size: '3.7 GB',
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    };
    setDbStatus(mockStatus);
  }, []);

  // Run database maintenance task
  const runDatabaseMaintenance = (task: string) => {
    toast.success(`${task} task initiated`);
    // In a real app, this would call an API to run the maintenance task
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Database Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Database Status</CardTitle>
        </CardHeader>
        <CardContent>
          {dbStatus ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tables:</span>
                <span className="font-medium">{dbStatus.tables}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Size:</span>
                <span className="font-medium">{dbStatus.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Backup:</span>
                <span className="font-medium">{new Date(dbStatus.lastBackup).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">Loading...</div>
          )}
        </CardContent>
      </Card>

      {/* Database Maintenance Tools Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Maintenance Tasks</CardTitle>
          <CardDescription>Run database maintenance operations</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => runDatabaseMaintenance('Backup')}
          >
            <Database className="mr-2 h-4 w-4" />
            Create Backup
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => runDatabaseMaintenance('Vacuum')}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Vacuum Database
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => runDatabaseMaintenance('Analyze')}
          >
            <Terminal className="mr-2 h-4 w-4" />
            Analyze Tables
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => runDatabaseMaintenance('Reindex')}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reindex Tables
          </Button>
        </CardContent>
      </Card>

      {/* Error Reporting Card */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">Error Reporting</CardTitle>
          <CardDescription>
            View and manage system error reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>System is operating normally</AlertTitle>
            <AlertDescription>
              No critical errors have been reported in the last 24 hours.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <Button variant="outline" onClick={() => toast.success("Redirecting to error logs page")}>
              View Detailed Error Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
