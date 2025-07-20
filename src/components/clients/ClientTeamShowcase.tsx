import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Globe } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  type: string;
  company: string;
  email?: string;
  phone?: string;
  website?: string;
  photo_url?: string;
  visibility_settings: {
    visible_to_clients: boolean;
    showcase_role?: string;
    showcase_description?: string;
  };
}

interface ClientTeamShowcaseProps {
  teamMembers: TeamMember[];
  title?: string;
  compact?: boolean;
}

export const ClientTeamShowcase: React.FC<ClientTeamShowcaseProps> = ({ 
  teamMembers, 
  title = "Your Professional Team",
  compact = false 
}) => {
  const visibleMembers = teamMembers.filter(member => member.visibility_settings.visible_to_clients);

  if (visibleMembers.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Meet the professionals working on your behalf
        </p>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {visibleMembers.map((member) => (
            <div key={member.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                {member.photo_url ? (
                  <img 
                    src={member.photo_url} 
                    alt={member.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {member.name.split(' ').map(n => n.charAt(0)).join('')}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">{member.name}</h4>
                  <p className="text-sm font-medium text-primary">
                    {member.visibility_settings.showcase_role || member.type}
                  </p>
                  <p className="text-sm text-muted-foreground">{member.company}</p>
                </div>
              </div>

              {member.visibility_settings.showcase_description && (
                <p className="text-sm text-muted-foreground">
                  {member.visibility_settings.showcase_description}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {member.type === 'mortgage_broker' ? 'Mortgage Professional' : 'Realtor'}
                </Badge>
              </div>

              {!compact && (
                <div className="flex gap-2 pt-2 border-t">
                  {member.email && (
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="h-3 w-3" />
                      Contact
                    </button>
                  )}
                  {member.phone && (
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="h-3 w-3" />
                      Call
                    </button>
                  )}
                  {member.website && (
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Globe className="h-3 w-3" />
                      Website
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};