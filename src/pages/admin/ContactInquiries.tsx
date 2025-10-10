import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { InviteClientDialog } from '@/components/clients/InviteClientDialog';
import { ContactEmailDialog } from '@/components/admin/ContactEmailDialog';
import { useUnifiedInvitationSystem } from '@/hooks/useUnifiedInvitationSystem';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, ArrowLeft, Send, UserCheck, FileText } from 'lucide-react';

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  inquiry_type: string;
  location: string | null;
  subject: string;
  message: string;
  status: string;
  source: string;
  created_at: string;
  assigned_to: string | null;
  assigned_at: string | null;
  admin_notes: string | null;
}

const ContactInquiries: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const { sendInvitation, isSending } = useUnifiedInvitationSystem();

  // Fetch active professionals for assignment dropdown
  const { data: professionals = [] } = useQuery({
    queryKey: ['active-professionals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name, professional_type, email')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    // Check if user is admin
    const userType = user?.user_metadata?.user_type;
    if (userType !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/');
      return;
    }

    fetchInquiries();
  }, [user, navigate]);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setInquiries(inquiries.map(inq => 
        inq.id === id ? { ...inq, status: newStatus } : inq
      ));
      
      // Invalidate the count query to update the sidebar badge
      queryClient.invalidateQueries({ queryKey: ['contact_inquiries_count', 'new'] });
      
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getInquiryTypeLabel = (type: string) => {
    switch (type) {
      case 'find_professional': return 'Find Professional';
      case 'support': return 'Support';
      case 'partnership': return 'Partnership';
      case 'general': return 'General';
      default: return type;
    }
  };

  const handleSendInvitation = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setInviteDialogOpen(true);
  };

  const handleInviteSubmit = async (inviteData: any) => {
    if (!selectedInquiry) return;

    try {
      await sendInvitation({
        email: selectedInquiry.email,
        userType: 'client',
        firstName: selectedInquiry.name.split(' ')[0],
        lastName: selectedInquiry.name.split(' ').slice(1).join(' ') || undefined,
        phone: selectedInquiry.phone || undefined,
        sendVia: 'email',
        propertyInterest: 'buying',
        preferredContact: 'email',
        customMessage: inviteData.customMessage
      });

      // Update inquiry status to resolved
      await supabase
        .from('contact_inquiries')
        .update({ status: 'resolved' })
        .eq('id', selectedInquiry.id);

      setInviteDialogOpen(false);
      toast.success('Invitation sent successfully');
      fetchInquiries();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  const handleAssignToPro = async (inquiryId: string, professionalId: string) => {
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({
          assigned_to: professionalId,
          assigned_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .eq('id', inquiryId);

      if (error) throw error;

      const professional = professionals.find(p => p.id === professionalId);
      toast.success(`Assigned to ${professional?.name}`);
      
      fetchInquiries();
      queryClient.invalidateQueries({ queryKey: ['contact_inquiries_count', 'new'] });
    } catch (error) {
      console.error('Error assigning to professional:', error);
      toast.error('Failed to assign professional');
    }
  };

  const handleContactEmail = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setEmailDialogOpen(true);
  };

  const handleSendEmail = async (subject: string, message: string) => {
    if (!selectedInquiry) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('send-inquiry-email', {
        body: { 
          inquiryId: selectedInquiry.id,
          subject,
          message
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      toast.success(`Email sent to ${selectedInquiry.email}`);
      setEmailDialogOpen(false);
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    }
  };

  const handleUpdateNotes = async (inquiryId: string, notes: string) => {
    try {
      await supabase
        .from('contact_inquiries')
        .update({ admin_notes: notes })
        .eq('id', inquiryId);
      
      toast.success('Notes saved');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
          <h1 className="text-4xl font-bold mb-2">Contact Inquiries</h1>
          <p className="text-muted-foreground">
            Review and manage customer inquiries from the contact form
          </p>
        </div>

        <div className="grid gap-4">
          {inquiries.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No inquiries yet</p>
              </CardContent>
            </Card>
          ) : (
            inquiries.map((inquiry) => (
              <Card key={inquiry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{inquiry.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {inquiry.email}
                        </span>
                        {inquiry.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {inquiry.phone}
                          </span>
                        )}
                        {inquiry.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {inquiry.location}
                          </span>
                        )}
                      </CardDescription>
                      {inquiry.assigned_to && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <UserCheck className="h-4 w-4" />
                          <span>Assigned to: {professionals.find(p => p.id === inquiry.assigned_to)?.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(inquiry.status)}>
                        {inquiry.status}
                      </Badge>
                      <Badge variant="outline">
                        {getInquiryTypeLabel(inquiry.inquiry_type)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-1">Subject:</p>
                    <p className="text-muted-foreground">{inquiry.subject}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Message:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{inquiry.message}</p>
                  </div>

                  {/* Admin Notes Section */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:underline">
                      <FileText className="h-4 w-4" />
                      Admin Notes
                      {inquiry.admin_notes && <Badge variant="secondary">Has notes</Badge>}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <Textarea
                        placeholder="Add internal notes about this inquiry..."
                        defaultValue={inquiry.admin_notes || ''}
                        onBlur={(e) => handleUpdateNotes(inquiry.id, e.target.value)}
                        rows={3}
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Submitted: {format(new Date(inquiry.created_at), 'PPp')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Select
                        value={inquiry.status}
                        onValueChange={(value) => updateStatus(inquiry.id, value)}
                      >
                        <SelectTrigger className="w-[150px] bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      onClick={() => handleSendInvitation(inquiry)}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send Invitation
                    </Button>
                    
                    <Select
                      value={inquiry.assigned_to || ''}
                      onValueChange={(value) => handleAssignToPro(inquiry.id, value)}
                    >
                      <SelectTrigger className="w-[200px] bg-background">
                        <SelectValue placeholder="Assign to Professional" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {professionals.map((pro) => (
                          <SelectItem key={pro.id} value={pro.id}>
                            {pro.name} - {pro.professional_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleContactEmail(inquiry)}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Invitation Dialog */}
      {selectedInquiry && (
        <>
          <InviteClientDialog
            open={inviteDialogOpen}
            onOpenChange={setInviteDialogOpen}
          />
          
          <ContactEmailDialog
            open={emailDialogOpen}
            onOpenChange={setEmailDialogOpen}
            inquiry={selectedInquiry}
            onSend={handleSendEmail}
            isLoading={false}
          />
        </>
      )}
      </div>
    </div>
  );
};

export default ContactInquiries;
