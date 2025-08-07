
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Send, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInvitedContacts } from '@/hooks/useInvitedContacts';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export const InviteContact: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  
  const { 
    contacts, 
    isLoading, 
    isCreatingInvitation, 
    createInvitation, 
    sendInvitation,
    deleteInvitation 
  } = useInvitedContacts();

  const handleCreate = async () => {
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      await createInvitation({ 
        email: email.trim(), 
        name: name.trim() || undefined,
        customMessage: customMessage.trim() || undefined
      });
      setEmail('');
      setName('');
      setCustomMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating invitation:', error);
    }
  };

  const handleSendInvitation = async (invitationId: string) => {
    try {
      await sendInvitation(invitationId, 'email');
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    if (confirm('Are you sure you want to delete this invitation?')) {
      try {
        await deleteInvitation(invitationId);
      } catch (error) {
        console.error('Error deleting invitation:', error);
      }
    }
  };

  const getStatusBadge = (contact: any) => {
    if (contact.email_sent) {
      return <Badge variant="default">Sent</Badge>;
    } else if (contact.status === 'pending') {
      return <Badge variant="secondary">Pending</Badge>;
    } else {
      return <Badge variant="outline">{contact.status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Invite Contact</CardTitle>
          <p className="text-sm text-muted-foreground">Send clients a link to check LMI property eligibility</p>
        </CardHeader>
        <CardContent>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create Invitation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    placeholder="client@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name (optional)</label>
                  <Input
                    placeholder="Client Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Message (optional)</label>
                  <Textarea
                    placeholder="Add a personal message to your invitation..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleCreate} 
                  className="w-full"
                  disabled={isCreatingInvitation}
                >
                  {isCreatingInvitation ? 'Creating...' : 'Create Invitation'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading invitations...</p>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invitations yet. Create your first invitation above.</p>
          ) : (
            <div className="space-y-3">
              {contacts.slice(0, 5).map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{contact.client_name}</span>
                      {getStatusBadge(contact)}
                    </div>
                    <p className="text-sm text-muted-foreground">{contact.client_email}</p>
                    {contact.sent_at && (
                      <p className="text-xs text-muted-foreground">
                        Sent: {new Date(contact.sent_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!contact.email_sent && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendInvitation(contact.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteInvitation(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
