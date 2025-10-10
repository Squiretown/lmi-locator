import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, Phone, MoreVertical, Users, MessageSquare, TrendingUp, Award } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PartnerCardProps {
  contact: {
    id: string;
    full_name: string;
    first_name: string;
    email?: string;
    phone?: string;
    company?: string;
    status: string;
    professional_type?: string;
  };
  onViewClients?: (id: string) => void;
  onMessage?: (id: string) => void;
  onViewPerformance?: (id: string) => void;
}

export function PartnerCard({
  contact,
  onViewClients,
  onMessage,
  onViewPerformance,
}: PartnerCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Mock metrics - in real implementation these would come from analytics
  const sharedClients = 8;
  const closeRate = 72;
  const pipelineValue = "1.2M";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-accent/10 text-accent">
                {getInitials(contact.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-base">{contact.full_name}</h3>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Realtor Partner
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
              <DropdownMenuItem onClick={() => onViewClients?.(contact.id)}>
                <Users className="h-4 w-4 mr-2" />
                View Shared Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMessage?.(contact.id)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewPerformance?.(contact.id)}>
                <TrendingUp className="h-4 w-4 mr-2" />
                View Performance
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
            <span className="font-medium">License:</span> #987654321
          </div>
        </div>

        <div className="pt-3 border-t space-y-3">
          <div className="text-sm font-medium">Partnership Metrics</div>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Shared</span>
              <p className="font-semibold">{sharedClients}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Close Rate</span>
              <p className="font-semibold">{closeRate}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Pipeline</span>
              <p className="font-semibold">${pipelineValue}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">Top Performer</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
