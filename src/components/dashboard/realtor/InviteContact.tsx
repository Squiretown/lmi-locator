import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInvitedContacts } from '@/hooks/useInvitedContacts';
import { toast } from 'sonner';

export const InviteContact: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const { createInvitation, isCreatingInvitation } = useInvitedContacts();

  const handleCreate = async () => {
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      await createInvitation({ email: email.trim(), name: name.trim() || undefined });
      setEmail('');
      setName('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating invitation:', error);
    }
  };

  return (
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
              Create
            </Button>
          </DialogTrigger>
          <DialogContent>
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
              <Button 
                onClick={handleCreate} 
                className="w-full"
                disabled={isCreatingInvitation}
              >
                {isCreatingInvitation ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};