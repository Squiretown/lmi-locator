import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, Phone, MoreVertical, Eye, Users, Share2, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ClientCardProps {
  contact: {
    id: string;
    full_name: string;
    first_name: string;
    email?: string;
    phone?: string;
    status: string;
    notes?: string;
  };
  onView?: (id: string) => void;
  onAssignTeam?: (id: string) => void;
  onShare?: (id: string) => void;
  onMessage?: (id: string) => void;
}

export function ClientCard({ contact, onView, onAssignTeam, onShare, onMessage }: ClientCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Mock tags - in real implementation these would come from contact data
  const tags = ["First-time buyer", "LMI eligible"];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(contact.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-base">{contact.full_name}</h3>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Client
                </Badge>
                <Badge 
                  variant={contact.status === "active" ? "default" : "outline"}
                  className="text-xs"
                >
                  {contact.status}
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
              <DropdownMenuItem onClick={() => onView?.(contact.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignTeam?.(contact.id)}>
                <Users className="h-4 w-4 mr-2" />
                Assign Team
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare?.(contact.id)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMessage?.(contact.id)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
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
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Assigned Team</span>
            <Button variant="outline" size="sm" onClick={() => onAssignTeam?.(contact.id)}>
              <Users className="h-4 w-4 mr-1" />
              Assign Team
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">John Smith</Badge>
            <Badge variant="secondary" className="text-xs">Sarah Johnson</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
