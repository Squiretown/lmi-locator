import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Users, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface TeamAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
}

interface AssignmentChange {
  type: "add" | "remove";
  professionalId: string;
  role: string;
}

export function TeamAssignmentDialog({
  open,
  onOpenChange,
  clientId,
}: TeamAssignmentDialogProps) {
  const queryClient = useQueryClient();
  const { teamMembers, assignTeamMember, isAssigningTeamMember } = useUnifiedCRM();
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch client details
  const { data: client } = useQuery({
    queryKey: ["client-profile", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const { data } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("id", clientId)
        .single();
      return data;
    },
    enabled: !!clientId && open,
  });

  // Fetch current assignments
  const { data: currentAssignments = [] } = useQuery({
    queryKey: ["client-team-assignments", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data } = await supabase
        .from("client_team_assignments")
        .select("professional_id, professional_role")
        .eq("client_id", clientId)
        .eq("status", "active");
      return data || [];
    },
    enabled: !!clientId && open,
  });

  // Fetch workloads for all professionals
  const { data: workloads = new Map() } = useQuery({
    queryKey: ["team-workloads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("client_team_assignments")
        .select("professional_id")
        .eq("status", "active");

      const counts = new Map<string, number>();
      data?.forEach((a) => {
        counts.set(a.professional_id, (counts.get(a.professional_id) || 0) + 1);
      });
      return counts;
    },
    enabled: open,
  });

  // Initialize selected members from current assignments
  useEffect(() => {
    if (open && currentAssignments.length > 0) {
      setSelectedMembers(
        new Set(currentAssignments.map((a) => a.professional_id))
      );
    } else if (open) {
      setSelectedMembers(new Set());
    }
  }, [open, currentAssignments]);

  // Filter team members by search
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return teamMembers;
    const query = searchQuery.toLowerCase();
    return teamMembers.filter(
      (m) =>
        m.full_name.toLowerCase().includes(query) ||
        m.company?.toLowerCase().includes(query) ||
        m.professional_type?.toLowerCase().includes(query)
    );
  }, [teamMembers, searchQuery]);

  // Calculate changes
  const changes = useMemo((): AssignmentChange[] => {
    const result: AssignmentChange[] = [];

    // Find additions
    selectedMembers.forEach((memberId) => {
      if (!currentAssignments.some((a) => a.professional_id === memberId)) {
        const member = teamMembers.find((m) => m.id === memberId);
        result.push({
          type: "add",
          professionalId: memberId,
          role: member?.professional_type || "team_member",
        });
      }
    });

    // Find removals
    currentAssignments.forEach((assignment) => {
      if (!selectedMembers.has(assignment.professional_id)) {
        result.push({
          type: "remove",
          professionalId: assignment.professional_id,
          role: assignment.professional_role,
        });
      }
    });

    return result;
  }, [selectedMembers, currentAssignments, teamMembers]);

  const removeAssignmentsMutation = useMutation({
    mutationFn: async (professionalId: string) => {
      const { error } = await supabase
        .from("client_team_assignments")
        .update({ status: "inactive" })
        .eq("client_id", clientId)
        .eq("professional_id", professionalId)
        .eq("status", "active");

      if (error) throw error;
    },
  });

  const handleToggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSaveAssignments = async () => {
    if (!clientId) return;

    try {
      // Process removals
      const removePromises = changes
        .filter((c) => c.type === "remove")
        .map((c) => removeAssignmentsMutation.mutateAsync(c.professionalId));

      // Process additions
      const addPromises = changes
        .filter((c) => c.type === "add")
        .map((c) =>
          assignTeamMember({
            clientId,
            professionalId: c.professionalId,
            role: c.role,
          })
        );

      await Promise.all([...removePromises, ...addPromises]);

      const addCount = changes.filter((c) => c.type === "add").length;
      const removeCount = changes.filter((c) => c.type === "remove").length;

      let message = "Team assignments updated";
      if (addCount > 0 && removeCount > 0) {
        message = `${addCount} members assigned, ${removeCount} removed`;
      } else if (addCount > 0) {
        message = `${addCount} members assigned`;
      } else if (removeCount > 0) {
        message = `${removeCount} members removed`;
      }

      toast.success(message);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["client-team-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["crm-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["team-workloads"] });

      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update team assignments");
      console.error(error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const addCount = changes.filter((c) => c.type === "add").length;
  const removeCount = changes.filter((c) => c.type === "remove").length;
  const hasChanges = changes.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>
            Assign Team to {client?.first_name} {client?.last_name}
          </DialogTitle>
          <DialogDescription>
            Select team members to work with this client
          </DialogDescription>
        </DialogHeader>

        {client && (
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">
                  {client.first_name} {client.last_name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {client.email || client.phone}
                </p>
              </div>
              <Badge>{client.status}</Badge>
            </div>
          </Card>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-2">
            {filteredMembers.map((member) => {
              const isSelected = selectedMembers.has(member.id);
              const isCurrentlyAssigned = currentAssignments.some(
                (a) => a.professional_id === member.id
              );
              const workload = workloads.get(member.id) || 0;

              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isSelected ? "bg-accent/50 border-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleMember(member.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{member.full_name}</h4>
                      {isCurrentlyAssigned && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {member.company && <span>{member.company}</span>}
                      {member.professional_type && (
                        <>
                          <span>•</span>
                          <span className="capitalize">
                            {member.professional_type.replace("_", " ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{workload}</div>
                    <div className="text-xs text-muted-foreground">clients</div>
                  </div>
                </div>
              );
            })}

            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No team members found
              </div>
            )}
          </div>
        </ScrollArea>

        {hasChanges && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 text-sm">
              {addCount > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  <Plus className="h-3 w-3" />
                  {addCount} to add
                </span>
              )}
              {removeCount > 0 && (
                <span className="flex items-center gap-1 text-orange-600">
                  <Minus className="h-3 w-3" />
                  {removeCount} to remove
                </span>
              )}
            </div>
            <span className="text-sm font-medium">
              {selectedMembers.size} selected
            </span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveAssignments}
            disabled={!hasChanges || isAssigningTeamMember}
          >
            {isAssigningTeamMember ? "Saving..." : `Save Team (${changes.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
