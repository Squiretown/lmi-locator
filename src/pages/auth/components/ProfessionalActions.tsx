
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  FileText, 
  TrendingUp,
  UserCheck,
  Building,
  CreditCard
} from 'lucide-react';
import type { AdminUser } from '../types/admin-user';

interface ProfessionalActionsProps {
  user: AdminUser;
  onAction: (action: string, user: AdminUser) => void;
}

export const ProfessionalActions: React.FC<ProfessionalActionsProps> = ({
  user,
  onAction,
}) => {
  const userType = user.user_metadata?.user_type || 'client';
  const isProfessional = ['mortgage_professional', 'realtor', 'business'].includes(userType);

  if (!isProfessional) {
    return null;
  }

  const getProfessionalIcon = () => {
    switch (userType) {
      case 'mortgage_professional':
        return <CreditCard className="mr-2 h-4 w-4" />;
      case 'realtor':
        return <Building className="mr-2 h-4 w-4" />;
      case 'business':
        return <Users className="mr-2 h-4 w-4" />;
      default:
        return <UserCheck className="mr-2 h-4 w-4" />;
    }
  };

  const getProfessionalLabel = () => {
    switch (userType) {
      case 'mortgage_professional':
        return 'Mortgage Professional';
      case 'realtor':
        return 'Realtor';
      case 'business':
        return 'Business User';
      default:
        return 'Professional';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          {getProfessionalIcon()}
          {getProfessionalLabel()} Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Shield className="mr-2 h-4 w-4" />
            License & Verification
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onAction('verifyLicense', user)}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Verify Professional License
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onAction('viewCredentials', user)}>
              <FileText className="mr-2 h-4 w-4" />
              View Credentials
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onAction('updateLicense', user)}>
              <Shield className="mr-2 h-4 w-4" />
              Update License Info
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Users className="mr-2 h-4 w-4" />
            Client Management
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onAction('viewClients', user)}>
              <Users className="mr-2 h-4 w-4" />
              View Client List
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onAction('manageReferrals', user)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Manage Referrals
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onAction('clientActivity', user)}>
              <FileText className="mr-2 h-4 w-4" />
              Client Activity Report
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <TrendingUp className="mr-2 h-4 w-4" />
            Marketing & Campaigns
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onAction('reviewMarketing', user)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Review Marketing Campaigns
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onAction('marketingStats', user)}>
              <FileText className="mr-2 h-4 w-4" />
              Marketing Statistics
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onAction('campaignHistory', user)}>
              <FileText className="mr-2 h-4 w-4" />
              Campaign History
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CheckCircle className="mr-2 h-4 w-4" />
            Applications & Requests
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem 
              onClick={() => onAction('approveApplication', user)}
              className="text-green-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Application
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onAction('rejectApplication', user)}
              className="text-red-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Application
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onAction('reviewApplication', user)}>
              <FileText className="mr-2 h-4 w-4" />
              Review Application Details
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
