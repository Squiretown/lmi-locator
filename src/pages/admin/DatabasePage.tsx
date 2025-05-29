import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, RefreshCw, AlertCircle, CheckCircle, Download, Upload, Activity, HardDrive } from "lucide-react";

const DatabasePage: React.FC = () => {
  const [isRunningBackup, setIsRunningBackup] = useState(false);
  const [isRunningMaintenance, setIsRunningMaintenance] = useState(false);

  // Mock database stats
  const dbStats = {
    totalSize: '3.7 GB',
    tableCount: 32,
    activeConnections: 12,
    lastBackup: '2 hours ago',
    uptime: '15 days, 6 hours',
    performance: 98
  };

  const tables = [
    { name: 'users', rows: 15420, size: '245 MB', lastModified: '5 minutes ago' },
    { name: 'properties', rows: 8932, size: '1.2 GB', lastModified: '12 minutes ago' },
    { name: 'searches', rows: 45123, size: '890 MB', lastModified: '2 minutes ago' },
    { name: 'contacts', rows: 3421, size: '156 MB', lastModified: '1 hour ago' },
    { name: 'marketing_jobs', rows: 234, size: '45 MB', lastModified: '3 hours ago' },
    { name: 'notifications', rows: 12654, size: '234 MB', lastModified: '8 minutes ago' },
  ];

  const recentBackups = [
    { id: '1', type: 'Automatic', status: 'completed', size: '3.7 GB', date: '2 hours ago' },
    { id: '2', type: 'Manual', status: 'completed', size: '3.6 GB', date: '1 day ago' },
    { id: '3', type: 'Automatic', status: 'completed', size: '3.5 GB', date: '2 days ago' },
    { id: '4', type: 'Automatic', status: 'failed', size: '-', date: '3 days ago' },
  ];

  const handleBackup = async () => {
    setIsRunningBackup(true);
    // Simulate backup process
    setTimeout(() => {
      setIsRunningBackup(false);
    }, 3000);
  };

  const handleMaintenance = async (task: string) => {
    setIsRunningMaintenance(true);
    // Simulate maintenance task
    setTimeout(() => {
      setIsRunningMaintenance(false);
    }, 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Monitor and manage database operations and maintenance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="backups">Backups</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-blue-500" />
                      <div className="text-sm font-medium">Database Size</div>
                    </div>
                    <div className="text-2xl font-bold">{dbStats.totalSize}</div>
                    <div className="text-xs text-muted-foreground">{dbStats.tableCount} tables</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <div className="text-sm font-medium">Performance</div>
                    </div>
                    <div className="text-2xl font-bold">{dbStats.performance}%</div>
                    <Progress value={dbStats.performance} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-orange-500" />
                      <div className="text-sm font-medium">Uptime</div>
                    </div>
                    <div className="text-2xl font-bold">{dbStats.uptime}</div>
                    <div className="text-xs text-muted-foreground">{dbStats.activeConnections} active connections</div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Database Status: Healthy</AlertTitle>
                <AlertDescription>
                  All systems are operating normally. Last backup: {dbStats.lastBackup}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={handleBackup}
                      disabled={isRunningBackup}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {isRunningBackup ? 'Creating Backup...' : 'Create Backup'}
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => handleMaintenance('Database optimization')}
                      disabled={isRunningMaintenance}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {isRunningMaintenance ? 'Running...' : 'Optimize Database'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Last query</span>
                        <span className="text-muted-foreground">2 seconds ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Peak connections today</span>
                        <span className="text-muted-foreground">24</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Queries today</span>
                        <span className="text-muted-foreground">1,234,567</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average response time</span>
                        <span className="text-muted-foreground">12ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tables">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Database Tables</h3>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table Name</TableHead>
                      <TableHead>Rows</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tables.map((table) => (
                      <TableRow key={table.name}>
                        <TableCell className="font-medium">{table.name}</TableCell>
                        <TableCell>{table.rows.toLocaleString()}</TableCell>
                        <TableCell>{table.size}</TableCell>
                        <TableCell>{table.lastModified}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Analyze
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="backups">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Database Backups</h3>
                  <Button onClick={handleBackup} disabled={isRunningBackup}>
                    <Download className="h-4 w-4 mr-2" />
                    {isRunningBackup ? 'Creating...' : 'Create Backup'}
                  </Button>
                </div>

                {isRunningBackup && (
                  <Alert>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <AlertTitle>Creating Backup</AlertTitle>
                    <AlertDescription>
                      Database backup is in progress. This may take a few minutes.
                    </AlertDescription>
                  </Alert>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBackups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell>{backup.type}</TableCell>
                        <TableCell>
                          <Badge variant={backup.status === 'completed' ? 'default' : 'destructive'}>
                            {backup.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{backup.size}</TableCell>
                        <TableCell>{backup.date}</TableCell>
                        <TableCell>
                          {backup.status === 'completed' && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="maintenance">
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Maintenance Operations</AlertTitle>
                  <AlertDescription>
                    These operations may temporarily affect database performance. Run during low-traffic periods.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Optimization</CardTitle>
                      <CardDescription>Improve database performance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => handleMaintenance('VACUUM')}
                        disabled={isRunningMaintenance}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        VACUUM Database
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => handleMaintenance('ANALYZE')}
                        disabled={isRunningMaintenance}
                      >
                        <Activity className="mr-2 h-4 w-4" />
                        Analyze Tables
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => handleMaintenance('REINDEX')}
                        disabled={isRunningMaintenance}
                      >
                        <Database className="mr-2 h-4 w-4" />
                        Rebuild Indexes
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Maintenance Schedule</CardTitle>
                      <CardDescription>Automated maintenance tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>Daily backup</span>
                          <Badge variant="outline">Enabled</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Weekly optimization</span>
                          <Badge variant="outline">Enabled</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly cleanup</span>
                          <Badge variant="outline">Enabled</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Next maintenance</span>
                          <span className="text-muted-foreground">Tonight at 2:00 AM</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabasePage;
