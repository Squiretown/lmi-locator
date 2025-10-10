import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, Phone, MoreVertical, User, Eye, EyeOff, Shield, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TeamMemberCardProps {
  contact: {
    id: string;
    full_name: string;
    first_name: string;
    email?: string;
    phone?: string;
    company?: string;
    status: string;
    professional_type?: string;
    visibility_settings?: any;
  };
  onViewProfile?: (id: string) => void;
  onToggleVisibility?: (id: string, visible: boolean) => void;
  onManagePermissions?: (id: string) => void;
  onViewClients?: (id: string) => void;
}

export function TeamMemberCard({
  contact,
  onViewProfile,
  onToggleVisibility,
  onManagePermissions,
  onViewClients,
}: TeamMemberCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isVisible = contact.visibility_settings?.visible_to_clients ?? false;

  // Mock metrics - in real implementation these would come from analytics
  const sharedClients = 5;
  const activeDeals = 3;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-secondary/10 text-secondary">
                {getInitials(contact.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-base">{contact.full_name}</h3>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Team Member
                </Badge>
                <Badge
                  variant={isVisible ? "default" : "outline"}
                  className="text-xs"
                >
                  {isVisible ? (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewProfile?.(contact.id)}>
                <User className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleVisibility?.(contact.id, !isVisible)}>
                {isVisible ? (
                  <EyeOff className="h-4 w-4 mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Toggle Visibility
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManagePermissions?.(contact.id)}>
                <Shield className="h-4 w-4 mr-2" />
                Manage Permissions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewClients?.(contact.id)}>
                <Users className="h-4 w-4 mr-2" />
                View Clients
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 mb-3">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.company && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{contact.company}</span>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">License:</span> #123456789
          </div>
        </div>

        <div className="pt-3 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Client Visibility</span>
            <Switch
              checked={isVisible}
              onCheckedChange={(checked) => onToggleVisibility?.(contact.id, checked)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Shared Clients</span>
              <p className="font-semibold">{sharedClients}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Active Deals</span>
              <p className="font-semibold">{activeDeals}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Edit
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Mail className="h-3 w-3 mr-1" />
              Send Comms
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
