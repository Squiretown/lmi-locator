import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';

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
}

const ContactInquiries: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
                    <div className="space-y-1">
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
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInquiries;
