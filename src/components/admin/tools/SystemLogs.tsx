
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Trash2, Download } from "lucide-react";

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  context: string;
  details: any;
}

export const SystemLogs: React.FC = () => {
  // State for System Logs
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      level: 'info',
      message: 'User authentication successful',
      context: 'auth',
      details: { userId: 'user-123', method: 'email' }
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      level: 'warn',
      message: 'Rate limit reached for API endpoint',
      context: 'api',
      details: { endpoint: '/api/data', ip: '192.168.1.1' }
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      level: 'error',
      message: 'Database connection timeout',
      context: 'database',
      details: { attempt: 3, retryIn: '30s' }
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      level: 'info',
      message: 'Scheduled backup completed',
      context: 'database',
      details: { size: '2.3GB', duration: '127s' }
    }
  ]);
  const [logLevel, setLogLevel] = useState<string>('all');
  const [logContext, setLogContext] = useState<string>('all');

  // Filter logs based on selected level and context
  const filteredLogs = systemLogs.filter(log => {
    if (logLevel !== 'all' && log.level !== logLevel) return false;
    if (logContext !== 'all' && log.context !== logContext) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Level:</label>
            <select
              className="border rounded p-1 text-sm"
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
            >
              <option value="all">All</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Context:</label>
            <select
              className="border rounded p-1 text-sm"
              value={logContext}
              onChange={(e) => setLogContext(e.target.value)}
            >
              <option value="all">All</option>
              <option value="auth">Authentication</option>
              <option value="api">API</option>
              <option value="database">Database</option>
            </select>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Logs refreshed")}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[100px]">Level</TableHead>
              <TableHead className="w-[100px]">Context</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No logs found matching the selected filters
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.level === 'error' ? 'destructive' : 
                        log.level === 'warn' ? 'default' : 
                        'outline'
                      }
                      className={
                        log.level === 'error' ? 'bg-red-100' :
                        log.level === 'warn' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }
                    >
                      {log.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {log.context}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs">{log.message}</div>
                    <div className="mt-1 text-xs text-muted-foreground overflow-hidden text-ellipsis">
                      {JSON.stringify(log.details)}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => toast.success("Log file downloaded")}>
          <Download className="h-4 w-4 mr-1" />
          Export Logs
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.success("Logs cleared")}>
          <Trash2 className="h-4 w-4 mr-1" />
          Clear Logs
        </Button>
      </div>
    </div>
  );
};
