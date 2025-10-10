import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Briefcase, Users } from "lucide-react";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: "client" | "realtor" | "team") => void;
}

export function AddContactDialog({ open, onOpenChange, onSelectType }: AddContactDialogProps) {
  const handleSelect = (type: "client" | "realtor" | "team") => {
    onSelectType(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
          <DialogDescription>
            Choose the type of contact you want to add to your network
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="h-auto py-4 justify-start"
            onClick={() => handleSelect("client")}
          >
            <UserPlus className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Add Client</div>
              <div className="text-sm text-muted-foreground">
                Add a new client to your portfolio
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 justify-start"
            onClick={() => handleSelect("realtor")}
          >
            <Briefcase className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Add Realtor Partner</div>
              <div className="text-sm text-muted-foreground">
                Connect with a realtor for collaboration
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 justify-start"
            onClick={() => handleSelect("team")}
          >
            <Users className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Add Team Member</div>
              <div className="text-sm text-muted-foreground">
                Invite a team member to collaborate
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
