
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, Building, Calendar, FileText } from 'lucide-react';

interface TeamMember {
  id: string;
  realtor?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company: string;
    license_number: string;
  };
  status: string;
  notes?: string;
  created_at: string;
}

interface TeamMemberDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
}

export const TeamMemberDetailsDialog: React.FC<TeamMemberDetailsDialogProps> = ({
  open,
  onOpenChange,
  member,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Team Member Details
          </DialogTitle>
          <DialogDescription>
            Complete information for {member.realtor?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="font-medium">{member.realtor?.name || 'N/A'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant="secondary">{member.status}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {member.realtor?.phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="font-medium">{member.realtor.phone}</p>
                </div>
              )}
              
              {member.realtor?.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{member.realtor.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Building className="h-4 w-4" />
              Professional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company</label>
                <p className="font-medium">{member.realtor?.company || 'N/A'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">License Number</label>
                <p className="font-medium">{member.realtor?.license_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Team Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Added to Team</label>
                <p className="font-medium">{new Date(member.created_at).toLocaleDateString()}</p>
              </div>
              
              {member.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Notes
                  </label>
                  <p className="font-medium bg-muted p-3 rounded-md mt-1">
                    {member.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
