import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Briefcase, Users, Search, Plus, Loader2 } from "lucide-react";
import { useUnifiedCRM } from "@/hooks/useUnifiedCRM";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { UnifiedInvitationForm } from "@/components/invitations/UnifiedInvitationForm";
import { useUnifiedInvitationSystem } from "@/hooks/useUnifiedInvitationSystem";
import { ManualContactForm } from "@/components/network/ManualContactForm";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ContactTab = "client" | "realtor" | "team";
type AddMode = "search" | "invite" | "manual";

export function AddContactDialog({ open, onOpenChange }: AddContactDialogProps) {
  const [activeTab, setActiveTab] = useState<ContactTab>("client");
  const [addMode, setAddMode] = useState<AddMode>("search");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form states
  const [clientForm, setClientForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: ""
  });

  const {
    addExistingProfessional,
    isAddingProfessional,
    addClientManually,
    isAddingClient,
    addTeamMember,
    isAddingTeamMember,
    searchAvailableProfessionals,
    addManualContact,
    isAddingManualContact
  } = useUnifiedCRM();

  const { sendInvitation, isSending } = useUnifiedInvitationSystem();

  // Search available professionals
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['available-professionals', searchQuery, activeTab],
    queryFn: async () => {
      if (activeTab === 'client' || !searchQuery.trim()) return [];
      
      const type = activeTab === 'realtor' ? 'realtor' : 'mortgage_professional';
      return await searchAvailableProfessionals(searchQuery, type);
    },
    enabled: addMode === 'search' && activeTab !== 'client' && searchQuery.length > 0
  });

  const handleAddExisting = async (professionalId: string, professionalUserId: string) => {
    try {
      // For team members, add to internal team table
      if (activeTab === 'team') {
        await addTeamMember({ 
          memberId: professionalUserId,
          role: 'loan_officer', // Default role
          permissions: {
            view_clients: true,
            edit_clients: false,
            send_communications: false
          }
        });
      } else {
        // For realtors, add to professional_teams
        await addExistingProfessional({ professionalId });
      }
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add professional:', error);
    }
  };

  const handleAddClient = async () => {
    try {
      await addClientManually(clientForm);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add client:', error);
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setClientForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: ""
    });
    setAddMode("search");
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const isFormValid = clientForm.firstName.trim() && clientForm.lastName.trim();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
          <DialogDescription>
            Add a new contact to your network
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContactTab)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="client" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Client
            </TabsTrigger>
            <TabsTrigger value="realtor" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Realtor Partner
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team Member
            </TabsTrigger>
          </TabsList>

          <TabsContent value="client" className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={addMode === 'search' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddMode('search')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Manually
              </Button>
              <Button
                variant={addMode === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddMode('manual')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Supporting Professional
              </Button>
              <Button
                variant={addMode === 'invite' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddMode('invite')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Send Invitation
              </Button>
            </div>

            {addMode === 'search' ? (
              <div className="space-y-4 flex-1 overflow-auto">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={clientForm.firstName}
                        onChange={(e) => setClientForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={clientForm.lastName}
                        onChange={(e) => setClientForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={clientForm.notes}
                      onChange={(e) => setClientForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any relevant notes..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleAddClient}
                    disabled={!isFormValid || isAddingClient}
                  >
                    {isAddingClient ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Client
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : addMode === 'manual' ? (
              <div className="flex-1 overflow-auto">
                <ManualContactForm
                  onSubmit={async (data) => {
                    await addManualContact(data);
                    onOpenChange(false);
                  }}
                  isLoading={isAddingManualContact}
                />
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <UnifiedInvitationForm 
                  onSubmit={async (data) => {
                    await sendInvitation(data);
                    onOpenChange(false);
                  }}
                  isLoading={isSending}
                  defaultUserType="client"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="realtor" className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={addMode === 'search' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddMode('search')}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Search Existing
              </Button>
              <Button
                variant={addMode === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddMode('manual')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Manually
              </Button>
              <Button
                variant={addMode === 'invite' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddMode('invite')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Send Invitation
              </Button>
            </div>

            {addMode === 'search' ? (
              <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                <div className="space-y-2">
                  <Label>Search for Realtor</Label>
                  <Input
                    placeholder="Search by name, company, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <ScrollArea className="flex-1">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((professional) => (
                        <div
                          key={professional.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:border-purple-500 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{professional.name}</div>
                            <div className="text-sm text-muted-foreground">{professional.company}</div>
                            {professional.email && (
                              <div className="text-xs text-muted-foreground mt-1">{professional.email}</div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddExisting(professional.id, professional.user_id)}
                            disabled={isAddingProfessional}
                          >
                            {isAddingProfessional ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Add'
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.trim() ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No realtors found matching "{searchQuery}"
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Search for existing realtors to add to your network
                    </div>
                  )}
                </ScrollArea>
              </div>
            ) : addMode === 'manual' ? (
              <div className="flex-1 overflow-auto">
                <ManualContactForm
                  onSubmit={async (data) => {
                    await addManualContact(data);
                    onOpenChange(false);
                  }}
                  isLoading={isAddingManualContact}
                />
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <UnifiedInvitationForm 
                  onSubmit={async (data) => {
                    await sendInvitation(data);
                    onOpenChange(false);
                  }}
                  isLoading={isSending}
                  defaultUserType="realtor"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="team" className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={addMode === 'search' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddMode('search')}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Search Existing
              </Button>
              <Button
                variant={addMode === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddMode('manual')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Manually
              </Button>
              <Button
                variant={addMode === 'invite' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddMode('invite')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Send Invitation
              </Button>
            </div>

            {addMode === 'search' ? (
              <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                <div className="space-y-2">
                  <Label>Search for Team Member</Label>
                  <Input
                    placeholder="Search by name, company, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <ScrollArea className="flex-1">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((professional) => (
                        <div
                          key={professional.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:border-green-500 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{professional.name}</div>
                              <Badge variant="outline" className="text-xs">
                                {professional.professional_type === 'mortgage_professional' ? 'Mortgage' : 'Realtor'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">{professional.company}</div>
                            {professional.email && (
                              <div className="text-xs text-muted-foreground mt-1">{professional.email}</div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddExisting(professional.id, professional.user_id)}
                            disabled={isAddingTeamMember || isAddingProfessional}
                          >
                            {(isAddingTeamMember || isAddingProfessional) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Add'
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.trim() ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No professionals found matching "{searchQuery}"
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Search for existing professionals to add to your team
                    </div>
                  )}
                </ScrollArea>
              </div>
            ) : addMode === 'manual' ? (
              <div className="flex-1 overflow-auto">
                <ManualContactForm
                  onSubmit={async (data) => {
                    await addManualContact(data);
                    onOpenChange(false);
                  }}
                  isLoading={isAddingManualContact}
                />
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <UnifiedInvitationForm 
                  onSubmit={async (data) => {
                    await sendInvitation(data);
                    onOpenChange(false);
                  }}
                  isLoading={isSending}
                  defaultUserType="mortgage_professional"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
