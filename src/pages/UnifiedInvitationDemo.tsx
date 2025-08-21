import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useUnifiedInvitationSystem } from '@/hooks/useUnifiedInvitationSystem';
import { useUnifiedClientInvitations } from '@/hooks/useUnifiedClientInvitations';
import { toast } from 'sonner';
import { CheckCircle, Users, Mail, Clock, X } from 'lucide-react';

const UnifiedInvitationDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'unified' | 'bridge'>('unified');
  
  // New unified system
  const {
    sendInvitation: sendUnified,
    invitations: unifiedInvitations,
    stats: unifiedStats,
    isSending: isSendingUnified,
    manageInvitation
  } = useUnifiedInvitationSystem();

  // Bridge system for backward compatibility
  const {
    createInvitation: createClient,
    invitations: bridgeInvitations,
    stats: bridgeStats,
    isCreatingInvitation: isCreatingBridge,
    revokeInvitation: revokeBridge
  } = useUnifiedClientInvitations();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    userType: 'client' as const,
    sendVia: 'email' as const,
    customMessage: ''
  });

  const handleUnifiedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendUnified({
        email: formData.email,
        userType: formData.userType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        sendVia: formData.sendVia,
        customMessage: formData.customMessage,
        // Required for client invitations
        propertyInterest: 'buying',
        preferredContact: 'email'
      });
      setFormData({ email: '', firstName: '', lastName: '', userType: 'client', sendVia: 'email', customMessage: '' });
    } catch (error) {
      console.error('Failed to send unified invitation:', error);
    }
  };

  const handleBridgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClient({
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        invitationType: formData.sendVia,
        customMessage: formData.customMessage
      });
      setFormData({ email: '', firstName: '', lastName: '', userType: 'client', sendVia: 'email', customMessage: '' });
    } catch (error) {
      console.error('Failed to send bridge invitation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyInvitationLink = (invitation: any) => {
    const baseUrl = window.location.origin;
    const acceptUrl = activeTab === 'unified' 
      ? `${baseUrl}/accept-invitation/${invitation.invite_token}`
      : `${baseUrl}/accept-invitation/${invitation.invitation_code}`;
    navigator.clipboard.writeText(acceptUrl);
    toast.success('Invitation link copied to clipboard!');
  };

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Unified Invitation System Demo</h1>
        <p className="text-muted-foreground">
          This demo shows both the new unified system and the backward-compatible bridge system.
        </p>
      </div>

      {/* System Toggle */}
      <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === 'unified' ? 'default' : 'outline'}
          onClick={() => setActiveTab('unified')}
        >
          Unified System
        </Button>
        <Button
          variant={activeTab === 'bridge' ? 'default' : 'outline'}
          onClick={() => setActiveTab('bridge')}
        >
          Bridge System (Backward Compatible)
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Send Invitation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send {activeTab === 'unified' ? 'Unified' : 'Bridge'} Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={activeTab === 'unified' ? handleUnifiedSubmit : handleBridgeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              {activeTab === 'unified' && (
                <div>
                  <Label>User Type</Label>
                  <RadioGroup
                    value={formData.userType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, userType: value as any }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="client" id="client" />
                      <Label htmlFor="client">Client</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="realtor" id="realtor" />
                      <Label htmlFor="realtor">Realtor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mortgage_professional" id="mortgage_professional" />
                      <Label htmlFor="mortgage_professional">Mortgage Professional</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <div>
                <Label>Send Via</Label>
                <RadioGroup
                  value={formData.sendVia}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sendVia: value as any }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email_send" />
                    <Label htmlFor="email_send">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="sms" />
                    <Label htmlFor="sms">SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Both</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="customMessage">Custom Message (Optional)</Label>
                <Input
                  id="customMessage"
                  value={formData.customMessage}
                  onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
                  placeholder="Add a personal message..."
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSendingUnified || isCreatingBridge}
                className="w-full"
              >
                {(isSendingUnified || isCreatingBridge) ? 'Sending...' : 'Send Invitation'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {activeTab === 'unified' ? 'Unified' : 'Bridge'} System Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {activeTab === 'unified' ? unifiedStats.total : bridgeStats.total}
                </div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {activeTab === 'unified' ? unifiedStats.sent : bridgeStats.sent}
                </div>
                <div className="text-sm text-green-600">Sent</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {activeTab === 'unified' ? unifiedStats.pending : bridgeStats.pending}
                </div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {activeTab === 'unified' ? unifiedStats.accepted : bridgeStats.accepted}
                </div>
                <div className="text-sm text-purple-600">Accepted</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent {activeTab === 'unified' ? 'Unified' : 'Bridge'} Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(activeTab === 'unified' ? unifiedInvitations : bridgeInvitations)
              .slice(0, 5)
              .map((invitation: any) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">
                        {activeTab === 'unified' 
                          ? `${invitation.first_name || ''} ${invitation.last_name || ''}`.trim() || invitation.email
                          : invitation.client_name || invitation.client_email
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activeTab === 'unified' ? invitation.email : invitation.client_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(invitation.status)}>
                      {invitation.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyInvitationLink(invitation)}
                    >
                      Copy Link
                    </Button>
                    {invitation.status === 'sent' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (activeTab === 'unified') {
                            manageInvitation({ invitationId: invitation.id, action: 'cancel' });
                          } else {
                            revokeBridge(invitation.id);
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

            {(activeTab === 'unified' ? unifiedInvitations : bridgeInvitations).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No invitations yet. Send your first invitation above!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            System Implementation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">✅ Completed Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• Unified user_invitations table with RLS</li>
                <li>• 4 robust edge functions with audit logging</li>
                <li>• Email integration with Resend</li>
                <li>• Backward compatibility bridge system</li>
                <li>• Public access for validation/accept flows</li>
                <li>• Token-based and code-based invitation support</li>
                <li>• Fixed revoke invitation issues</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🔧 Technical Architecture</h4>
              <ul className="space-y-1 text-sm">
                <li>• <code>user_invitations</code> - Main table</li>
                <li>• <code>send-user-invitation</code> - Creation</li>
                <li>• <code>validate-user-invitation</code> - Validation (public)</li>
                <li>• <code>accept-user-invitation</code> - Acceptance (public)</li>
                <li>• <code>manage-user-invitation</code> - Resend/Cancel</li>
                <li>• Bridge hook for legacy compatibility</li>
                <li>• Dual routing for codes and tokens</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedInvitationDemo;