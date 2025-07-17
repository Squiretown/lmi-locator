import React, { useState } from 'react';
import { MoreHorizontal, UserX, UserCheck, Mail, MessageSquare, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClientProfile } from '@/lib/types/user-models';
import { StatusChangeDialog } from './StatusChangeDialog';
import { CommunicationDialog } from './CommunicationDialog';

interface ClientActionsDropdownProps {
  client: ClientProfile;
  onEdit: (client: ClientProfile) => void;
  onView: (client: ClientProfile) => void;
  onStatusChange: () => void;
}

export const ClientActionsDropdown: React.FC<ClientActionsDropdownProps> = ({
  client,
  onEdit,
  onView,
  onStatusChange,
}) => {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [communicationType, setCommunicationType] = useState<'email' | 'sms'>('email');

  const handleSendEmail = () => {
    setCommunicationType('email');
    setShowCommunicationDialog(true);
  };

  const handleSendSMS = () => {
    setCommunicationType('sms');
    setShowCommunicationDialog(true);
  };

  const handleStatusChangeComplete = () => {
    setShowStatusDialog(false);
    onStatusChange();
  };

  const isDeactivated = client.status === 'deactivated';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onView(client)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(client)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Client
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSendEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendSMS}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Send SMS
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowStatusDialog(true)}
            className={isDeactivated ? "text-green-600" : "text-red-600"}
          >
            {isDeactivated ? (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Reactivate Client
              </>
            ) : (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Deactivate Client
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StatusChangeDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        client={client}
        onComplete={handleStatusChangeComplete}
      />

      <CommunicationDialog
        open={showCommunicationDialog}
        onOpenChange={setShowCommunicationDialog}
        client={client}
        type={communicationType}
      />
    </>
  );
};