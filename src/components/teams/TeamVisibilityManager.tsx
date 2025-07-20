import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Edit2, Save, X } from 'lucide-react';
import { useMortgageTeamManagement } from '@/hooks/useMortgageTeamManagement';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  type: string;
  company: string;
  photo_url?: string;
  visibility_settings: {
    visible_to_clients: boolean;
    showcase_role?: string;
    showcase_description?: string;
  };
}

export const TeamVisibilityManager: React.FC = () => {
  const { teamMembers, isLoading, updateProfessionalVisibility } = useMortgageTeamManagement();
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ role: string; description: string }>({ role: '', description: '' });

  const handleVisibilityToggle = async (memberId: string, visible: boolean) => {
    try {
      await updateProfessionalVisibility({ 
        professionalId: memberId, 
        settings: { visible_to_clients: visible }
      });
      toast.success(`Team member visibility updated`);
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  const handleEditStart = (member: TeamMember) => {
    setEditingMember(member.id);
    setEditData({
      role: member.visibility_settings.showcase_role || member.type,
      description: member.visibility_settings.showcase_description || ''
    });
  };

  const handleEditSave = async (memberId: string) => {
    try {
      await updateProfessionalVisibility({ 
        professionalId: memberId, 
        settings: {
          showcase_role: editData.role,
          showcase_description: editData.description
        }
      });
      setEditingMember(null);
      toast.success('Team member showcase updated');
    } catch (error) {
      toast.error('Failed to update showcase');
    }
  };

  const handleEditCancel = () => {
    setEditingMember(null);
    setEditData({ role: '', description: '' });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Team Visibility Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading team members...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Team Visibility Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Control which team members are shown to clients during invitations
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No team members found. Invite team members to get started.
          </div>
        ) : (
          teamMembers.map((member) => (
            <div key={member.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">{member.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.visibility_settings.visible_to_clients ? 'default' : 'secondary'}>
                    {member.visibility_settings.visible_to_clients ? 'Visible' : 'Hidden'}
                  </Badge>
                  <Switch
                    checked={member.visibility_settings.visible_to_clients}
                    onCheckedChange={(checked) => handleVisibilityToggle(member.id, checked)}
                  />
                </div>
              </div>

              {member.visibility_settings.visible_to_clients && (
                <div className="space-y-3 border-t pt-3">
                  {editingMember === member.id ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`role-${member.id}`}>Display Role</Label>
                        <Input
                          id={`role-${member.id}`}
                          value={editData.role}
                          onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                          placeholder="e.g., Senior Loan Officer"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`description-${member.id}`}>Description</Label>
                        <Input
                          id={`description-${member.id}`}
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          placeholder="Brief description of their role or expertise"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEditSave(member.id)}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleEditCancel}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {member.visibility_settings.showcase_role || member.type}
                        </p>
                        {member.visibility_settings.showcase_description && (
                          <p className="text-sm text-muted-foreground">
                            {member.visibility_settings.showcase_description}
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleEditStart(member)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};