import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAdminErrorLogs } from '@/hooks/useAdminErrorLogs';
import { AlertCircle, CheckCircle, RotateCcw, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const ErrorLogs: React.FC = () => {
  const { 
    logs, 
    isLoading, 
    error, 
    fetchLogs, 
    resolveError, 
    unresolveError, 
    clearResolvedLogs 
  } = useAdminErrorLogs();

  const unresolved = logs.filter(log => !log.resolved);
  const resolved = logs.filter(log => log.resolved);

  const getErrorTypeColor = (errorType: string) => {
    switch (errorType) {
      case '42P17':
        return 'destructive';
      case 'PGRST116':
        return 'destructive';
      case 'auth':
        return 'secondary';
      case 'permission':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'delete_user':
        return 'destructive';
      case 'disable_user':
        return 'secondary';
      case 'fetch_users':
        return 'default';
      case 'reset_password':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Error loading logs: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Error Logs</h1>
          <p className="text-muted-foreground">
            Monitor and manage system errors and admin operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={clearResolvedLogs} 
            variant="destructive" 
            size="sm"
            disabled={resolved.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Resolved ({resolved.length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Unresolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{unresolved.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolved.length}</div>
          </CardContent>
        </Card>
      </div>

      {unresolved.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Unresolved Errors ({unresolved.length})
            </CardTitle>
            <CardDescription>
              These errors require attention and resolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {unresolved.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex gap-2">
                        <Badge variant={getErrorTypeColor(log.error_type)}>
                          {log.error_type}
                        </Badge>
                        <Badge variant={getOperationColor(log.operation)}>
                          {log.operation}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => resolveError(log.id)}
                        size="sm"
                        variant="outline"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    </div>
                    <p className="text-sm font-medium mb-1">{log.error_message}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {format(new Date(log.created_at), 'PPp')}
                    </p>
                    {log.target_user_id && (
                      <p className="text-xs text-muted-foreground">
                        Target User: {log.target_user_id}
                      </p>
                    )}
                    {log.error_details && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                          Error Details
                        </summary>
                        <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                          {JSON.stringify(log.error_details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {resolved.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resolved Errors ({resolved.length})
            </CardTitle>
            <CardDescription>
              Previously resolved errors for reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-4">
                {resolved.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 opacity-75">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex gap-2">
                        <Badge variant={getErrorTypeColor(log.error_type)}>
                          {log.error_type}
                        </Badge>
                        <Badge variant={getOperationColor(log.operation)}>
                          {log.operation}
                        </Badge>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Resolved
                        </Badge>
                      </div>
                      <Button
                        onClick={() => unresolveError(log.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Unresolve
                      </Button>
                    </div>
                    <p className="text-sm font-medium mb-1">{log.error_message}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Error: {format(new Date(log.created_at), 'PPp')}</span>
                      {log.resolved_at && (
                        <span>Resolved: {format(new Date(log.resolved_at), 'PPp')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {logs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold mb-2">No Errors Found</h3>
            <p className="text-muted-foreground">
              All admin operations are running smoothly!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ErrorLogs;