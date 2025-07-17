import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileTextIcon, DownloadIcon, TrashIcon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';

interface TestLog {
  id: string;
  timestamp: Date;
  testType: 'connectivity' | 'email' | 'admin';
  testName: string;
  status: 'success' | 'error' | 'warning';
  responseTime?: number;
  details?: any;
  error?: string;
}

const TestLogger: React.FC = () => {
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'warning'>('all');

  // Load logs from localStorage on component mount
  useEffect(() => {
    const savedLogs = localStorage.getItem('test-logs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        setLogs(parsedLogs);
      } catch (error) {
        console.error('Error loading test logs:', error);
      }
    }
  }, []);

  // Save logs to localStorage whenever logs change
  useEffect(() => {
    localStorage.setItem('test-logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = (log: Omit<TestLog, 'id' | 'timestamp'>) => {
    const newLog: TestLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep only last 100 logs
  };

  const clearLogs = () => {
    setLogs([]);
    toast.success('Test logs cleared');
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `test-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Test logs exported');
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.status === filter);

  const getStatusColor = (status: TestLog['status']) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const getTestTypeIcon = (testType: TestLog['testType']) => {
    switch (testType) {
      case 'connectivity': return '🔗';
      case 'email': return '📧';
      case 'admin': return '👑';
      default: return '🔍';
    }
  };

  // Expose addLog function globally for other components to use
  useEffect(() => {
    (window as any).addTestLog = addLog;
    return () => {
      delete (window as any).addTestLog;
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileTextIcon className="h-5 w-5" />
          Test Execution Logs
        </CardTitle>
        <CardDescription>
          Comprehensive logging of all test executions and results
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({logs.length})
            </Button>
            <Button
              variant={filter === 'success' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('success')}
            >
              Success ({logs.filter(l => l.status === 'success').length})
            </Button>
            <Button
              variant={filter === 'error' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('error')}
            >
              Errors ({logs.filter(l => l.status === 'error').length})
            </Button>
            <Button
              variant={filter === 'warning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('warning')}
            >
              Warnings ({logs.filter(l => l.status === 'warning').length})
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              disabled={logs.length === 0}
            >
              <DownloadIcon className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              disabled={logs.length === 0}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Logs Display */}
        <ScrollArea className="h-96 w-full border rounded-md p-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {filter === 'all' ? 'No test logs yet' : `No ${filter} logs found`}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log, index) => (
                <div key={log.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-lg">{getTestTypeIcon(log.testType)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getStatusColor(log.status)}>
                            {log.status.toUpperCase()}
                          </Badge>
                          <span className="font-medium text-sm">{log.testName}</span>
                          {log.responseTime && (
                            <span className="text-xs text-muted-foreground">
                              {log.responseTime}ms
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.timestamp.toLocaleString()}
                        </div>
                        {log.error && (
                          <div className="text-xs text-destructive mt-1 font-mono">
                            Error: {log.error}
                          </div>
                        )}
                        {log.details && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                              View Details
                            </summary>
                            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < filteredLogs.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Summary Stats */}
        {logs.length > 0 && (
          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">{logs.length}</div>
              <div className="text-xs text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {logs.filter(l => l.status === 'success').length}
              </div>
              <div className="text-xs text-muted-foreground">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(l => l.status === 'error').length}
              </div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {logs.filter(l => l.responseTime).length > 0
                  ? Math.round(
                      logs
                        .filter(l => l.responseTime)
                        .reduce((sum, l) => sum + (l.responseTime || 0), 0) /
                        logs.filter(l => l.responseTime).length
                    )
                  : 0}ms
              </div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestLogger;