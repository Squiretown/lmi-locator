
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Download, 
  Trash2, 
  Shield, 
  Clock, 
  Settings, 
  AlertTriangle, 
  FileText, 
  Database,
  Calendar,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface DataExportRequest {
  id: string;
  userId: string;
  userEmail: string;
  requestDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  exportType: 'full' | 'partial';
  completedDate?: string;
  downloadUrl?: string;
}

interface DataDeletionRequest {
  id: string;
  userId: string;
  userEmail: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  reason: string;
  approvedBy?: string;
  completedDate?: string;
}

interface RetentionPolicy {
  id: string;
  dataType: string;
  retentionPeriod: number;
  retentionUnit: 'days' | 'months' | 'years';
  isActive: boolean;
  lastUpdated: string;
  updatedBy: string;
}

export const DataProtection: React.FC = () => {
  const [searchUserId, setSearchUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');

  // Mock data for demonstration
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([
    {
      id: '1',
      userId: 'user123',
      userEmail: 'john@example.com',
      requestDate: '2024-01-20T10:00:00Z',
      status: 'completed',
      exportType: 'full',
      completedDate: '2024-01-20T10:30:00Z',
      downloadUrl: '/exports/user123-full-export.zip'
    },
    {
      id: '2',
      userId: 'user456',
      userEmail: 'jane@example.com',
      requestDate: '2024-01-19T14:00:00Z',
      status: 'processing',
      exportType: 'partial'
    }
  ]);

  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>([
    {
      id: '1',
      userId: 'user789',
      userEmail: 'deleted@example.com',
      requestDate: '2024-01-18T09:00:00Z',
      status: 'pending',
      reason: 'User requested account deletion via support'
    },
    {
      id: '2',
      userId: 'user101',
      userEmail: 'former@example.com',
      requestDate: '2024-01-15T16:00:00Z',
      status: 'completed',
      reason: 'GDPR right to be forgotten request',
      approvedBy: 'admin@company.com',
      completedDate: '2024-01-16T10:00:00Z'
    }
  ]);

  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([
    {
      id: '1',
      dataType: 'User Profiles',
      retentionPeriod: 7,
      retentionUnit: 'years',
      isActive: true,
      lastUpdated: '2024-01-01T00:00:00Z',
      updatedBy: 'admin@company.com'
    },
    {
      id: '2',
      dataType: 'Search History',
      retentionPeriod: 2,
      retentionUnit: 'years',
      isActive: true,
      lastUpdated: '2024-01-01T00:00:00Z',
      updatedBy: 'admin@company.com'
    },
    {
      id: '3',
      dataType: 'Activity Logs',
      retentionPeriod: 90,
      retentionUnit: 'days',
      isActive: true,
      lastUpdated: '2024-01-01T00:00:00Z',
      updatedBy: 'admin@company.com'
    }
  ]);

  const handleExportUserData = async (exportType: 'full' | 'partial') => {
    if (!searchUserId) {
      toast.error('Please enter a user ID or email');
      return;
    }

    try {
      setIsExporting(true);
      
      const newRequest: DataExportRequest = {
        id: Date.now().toString(),
        userId: searchUserId,
        userEmail: searchUserId.includes('@') ? searchUserId : `${searchUserId}@example.com`,
        requestDate: new Date().toISOString(),
        status: 'processing',
        exportType
      };

      setExportRequests([newRequest, ...exportRequests]);
      toast.success(`${exportType === 'full' ? 'Full' : 'Partial'} data export initiated for user ${searchUserId}`);
      
      // Simulate processing
      setTimeout(() => {
        setExportRequests(prev => prev.map(req => 
          req.id === newRequest.id 
            ? { ...req, status: 'completed', completedDate: new Date().toISOString(), downloadUrl: `/exports/${searchUserId}-${exportType}-export.zip` }
            : req
        ));
        toast.success('Data export completed and ready for download');
      }, 3000);
      
    } catch (error) {
      toast.error('Failed to initiate data export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteUserData = async () => {
    if (!searchUserId || !deletionReason) {
      toast.error('Please enter user ID and deletion reason');
      return;
    }

    try {
      setIsDeleting(true);
      
      const newRequest: DataDeletionRequest = {
        id: Date.now().toString(),
        userId: searchUserId,
        userEmail: searchUserId.includes('@') ? searchUserId : `${searchUserId}@example.com`,
        requestDate: new Date().toISOString(),
        status: 'pending',
        reason: deletionReason
      };

      setDeletionRequests([newRequest, ...deletionRequests]);
      toast.warning('Data deletion request submitted for admin review');
      setDeletionReason('');
      
    } catch (error) {
      toast.error('Failed to submit deletion request');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveDeletion = async (requestId: string) => {
    try {
      setDeletionRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved', approvedBy: 'current-admin@company.com' }
          : req
      ));
      toast.success('Deletion request approved');
    } catch (error) {
      toast.error('Failed to approve deletion request');
    }
  };

  const handleProcessDeletion = async (requestId: string) => {
    try {
      setDeletionRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'completed', completedDate: new Date().toISOString() }
          : req
      ));
      toast.success('User data deletion completed');
    } catch (error) {
      toast.error('Failed to process deletion');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
      case 'rejected':
        return 'destructive';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Data Protection & Compliance</CardTitle>
              <CardDescription>
                GDPR compliance tools for data export, deletion, and retention management
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="export" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="export">Data Export</TabsTrigger>
              <TabsTrigger value="deletion">Data Deletion</TabsTrigger>
              <TabsTrigger value="retention">Retention Policies</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Override</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Export User Data (GDPR Article 20)</h3>
                
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Data Portability Rights</AlertTitle>
                  <AlertDescription>
                    Users have the right to receive their personal data in a structured, commonly used format.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="userId">User ID or Email</Label>
                      <Input
                        id="userId"
                        value={searchUserId}
                        onChange={(e) => setSearchUserId(e.target.value)}
                        placeholder="Enter user ID or email address"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleExportUserData('full')}
                        disabled={isExporting || !searchUserId}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export All Data
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleExportUserData('partial')}
                        disabled={isExporting || !searchUserId}
                        className="flex-1"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export Profile Only
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Recent Export Requests</h4>
                  <div className="space-y-2">
                    {exportRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <div className="font-medium">{request.userEmail}</div>
                            <div className="text-sm text-muted-foreground">
                              {request.exportType === 'full' ? 'Full Export' : 'Profile Only'} • 
                              {new Date(request.requestDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          {request.status === 'completed' && request.downloadUrl && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deletion" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Delete User Data (GDPR Article 17)</h3>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Right to be Forgotten</AlertTitle>
                  <AlertDescription>
                    Permanently delete all user data. This action cannot be undone and requires approval.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="deleteUserId">User ID or Email</Label>
                      <Input
                        id="deleteUserId"
                        value={searchUserId}
                        onChange={(e) => setSearchUserId(e.target.value)}
                        placeholder="Enter user ID or email address"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="deletionReason">Deletion Reason</Label>
                      <Textarea
                        id="deletionReason"
                        value={deletionReason}
                        onChange={(e) => setDeletionReason(e.target.value)}
                        placeholder="Enter reason for data deletion request..."
                        rows={3}
                      />
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive"
                          disabled={isDeleting || !searchUserId || !deletionReason}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Request Data Deletion
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Data Deletion Request</DialogTitle>
                          <DialogDescription>
                            This will submit a request to permanently delete all data for user {searchUserId}. 
                            This action requires approval and cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button variant="destructive" onClick={handleDeleteUserData}>
                            Submit Request
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Deletion Requests</h4>
                  <div className="space-y-2">
                    {deletionRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <div className="font-medium">{request.userEmail}</div>
                            <div className="text-sm text-muted-foreground">
                              {request.reason}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Requested: {new Date(request.requestDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          {request.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveDeletion(request.id)}
                            >
                              Approve
                            </Button>
                          )}
                          {request.status === 'approved' && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleProcessDeletion(request.id)}
                            >
                              Execute
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="retention" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Retention Policies</h3>
                
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertTitle>Automated Data Lifecycle</AlertTitle>
                  <AlertDescription>
                    Configure how long different types of data are retained before automatic deletion.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {retentionPolicies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{policy.dataType}</div>
                          <div className="text-sm text-muted-foreground">
                            Retention: {policy.retentionPeriod} {policy.retentionUnit}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last updated: {new Date(policy.lastUpdated).toLocaleDateString()} by {policy.updatedBy}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                          {policy.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add New Retention Policy
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Privacy Settings Override</h3>
                
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertTitle>Administrative Access</AlertTitle>
                  <AlertDescription>
                    Override user privacy settings when legally required or for support purposes.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Temporary Access Override</CardTitle>
                      <CardDescription>
                        Grant temporary admin access to user data for support or legal purposes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="overrideUserId">User ID or Email</Label>
                        <Input
                          id="overrideUserId"
                          placeholder="Enter user ID or email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="overrideReason">Access Reason</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="legal">Legal Requirement</SelectItem>
                            <SelectItem value="support">Customer Support</SelectItem>
                            <SelectItem value="security">Security Investigation</SelectItem>
                            <SelectItem value="compliance">Compliance Audit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="accessDuration">Access Duration</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1hour">1 Hour</SelectItem>
                            <SelectItem value="4hours">4 Hours</SelectItem>
                            <SelectItem value="24hours">24 Hours</SelectItem>
                            <SelectItem value="7days">7 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full">
                        <User className="h-4 w-4 mr-2" />
                        Grant Temporary Access
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Active Overrides</CardTitle>
                      <CardDescription>
                        Currently active privacy setting overrides
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-muted-foreground py-8">
                        No active privacy overrides
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
