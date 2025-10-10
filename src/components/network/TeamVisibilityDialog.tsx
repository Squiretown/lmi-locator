import { useState, useEffect } from "react";
import { useUnifiedCRM } from "@/hooks/useUnifiedCRM";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Users } from "lucide-react";
import { toast } from "sonner";

interface TeamVisibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VisibilityUpdate {
  professionalId: string;
  settings: {
    visible_to_clients: boolean;
    showcase_role?: string;
    showcase_description?: string;
  };
}

export function TeamVisibilityDialog({
  open,
  onOpenChange,
}: TeamVisibilityDialogProps) {
  const { teamMembers, updateVisibility, isUpdatingVisibility } = useUnifiedCRM();
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, VisibilityUpdate>>(
    new Map()
  );
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());

  // Initialize from current data
  useEffect(() => {
    if (open && teamMembers.length > 0) {
      const updates = new Map();
      teamMembers.forEach((member) => {
        updates.set(member.id, {
          professionalId: member.id,
          settings: {
            visible_to_clients: member.visibility_settings?.visible_to_clients ?? false,
            showcase_role: member.visibility_settings?.showcase_role ?? "",
            showcase_description: member.visibility_settings?.showcase_description ?? "",
          },
        });
      });
      setPendingUpdates(updates);
    }
  }, [open, teamMembers]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleToggleVisibility = (memberId: string, visible: boolean) => {
    const current = pendingUpdates.get(memberId);
    if (current) {
      setPendingUpdates(
        new Map(
          pendingUpdates.set(memberId, {
            ...current,
            settings: {
              ...current.settings,
              visible_to_clients: visible,
            },
          })
        )
      );
    }
  };

  const handleUpdateField = (
    memberId: string,
    field: "showcase_role" | "showcase_description",
    value: string
  ) => {
    const current = pendingUpdates.get(memberId);
    if (current) {
      setPendingUpdates(
        new Map(
          pendingUpdates.set(memberId, {
            ...current,
            settings: {
              ...current.settings,
              [field]: value,
            },
          })
        )
      );
    }
  };

  const handleShowAll = () => {
    const updates = new Map(pendingUpdates);
    updates.forEach((update, key) => {
      updates.set(key, {
        ...update,
        settings: { ...update.settings, visible_to_clients: true },
      });
    });
    setPendingUpdates(updates);
  };

  const handleHideAll = () => {
    const updates = new Map(pendingUpdates);
    updates.forEach((update, key) => {
      updates.set(key, {
        ...update,
        settings: { ...update.settings, visible_to_clients: false },
      });
    });
    setPendingUpdates(updates);
  };

  const handleSaveAll = async () => {
    try {
      const promises = Array.from(pendingUpdates.values()).map((update) =>
        updateVisibility({
          professionalId: update.professionalId,
          settings: update.settings,
        })
      );

      await Promise.all(promises);
      toast.success(`Updated visibility for ${pendingUpdates.size} team members`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update visibility settings");
    }
  };

  const hasChanges = () => {
    return Array.from(pendingUpdates.values()).some((update) => {
      const member = teamMembers.find((m) => m.id === update.professionalId);
      if (!member) return false;
      
      return (
        member.visibility_settings?.visible_to_clients !== update.settings.visible_to_clients ||
        member.visibility_settings?.showcase_role !== update.settings.showcase_role ||
        member.visibility_settings?.showcase_description !== update.settings.showcase_description
      );
    });
  };

  const visibleCount = Array.from(pendingUpdates.values()).filter(
    (u) => u.settings.visible_to_clients
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Team Visibility Settings</DialogTitle>
          <DialogDescription>
            Control which team members appear on client invitations and customize their
            showcase information
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 border-y">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {visibleCount} of {teamMembers.length} visible to clients
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShowAll}>
              <Eye className="h-4 w-4 mr-1" />
              Show All
            </Button>
            <Button variant="outline" size="sm" onClick={handleHideAll}>
              <EyeOff className="h-4 w-4 mr-1" />
              Hide All
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {teamMembers.map((member) => {
              const update = pendingUpdates.get(member.id);
              const isVisible = update?.settings.visible_to_clients ?? false;
              const isExpanded = expandedMembers.has(member.id);

              return (
                <div
                  key={member.id}
                  className={`p-4 rounded-lg border ${
                    isVisible ? "bg-accent/50" : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h4 className="font-medium">{member.full_name}</h4>
                          {member.company && (
                            <p className="text-sm text-muted-foreground">
                              {member.company}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={isVisible ? "default" : "secondary"}>
                            {isVisible ? "Visible" : "Hidden"}
                          </Badge>
                          <Switch
                            checked={isVisible}
                            onCheckedChange={(checked) =>
                              handleToggleVisibility(member.id, checked)
                            }
                          />
                        </div>
                      </div>

                      {isVisible && (
                        <div className="mt-3 space-y-3">
                          <div>
                            <Label htmlFor={`role-${member.id}`} className="text-xs">
                              Showcase Role (max 50 chars)
                            </Label>
                            <Input
                              id={`role-${member.id}`}
                              value={update?.settings.showcase_role ?? ""}
                              onChange={(e) =>
                                handleUpdateField(
                                  member.id,
                                  "showcase_role",
                                  e.target.value.slice(0, 50)
                                )
                              }
                              placeholder="e.g., Senior Loan Officer"
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {update?.settings.showcase_role?.length ?? 0}/50
                            </p>
                          </div>

                          <div>
                            <Label
                              htmlFor={`description-${member.id}`}
                              className="text-xs"
                            >
                              Showcase Description (max 200 chars)
                            </Label>
                            <Textarea
                              id={`description-${member.id}`}
                              value={update?.settings.showcase_description ?? ""}
                              onChange={(e) =>
                                handleUpdateField(
                                  member.id,
                                  "showcase_description",
                                  e.target.value.slice(0, 200)
                                )
                              }
                              placeholder="Brief description of their role and expertise..."
                              className="mt-1 resize-none"
                              rows={3}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {update?.settings.showcase_description?.length ?? 0}/200
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={!hasChanges() || isUpdatingVisibility}
          >
            {isUpdatingVisibility ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
