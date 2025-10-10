import { useState, useMemo } from "react";
import { useUnifiedCRM } from "@/hooks/useUnifiedCRM";
import { NetworkStats } from "@/components/crm/NetworkStats";
import { ClientCard } from "@/components/crm/ClientCard";
import { TeamMemberCard } from "@/components/crm/TeamMemberCard";
import { PartnerCard } from "@/components/crm/PartnerCard";
import { AddContactDialog } from "@/components/crm/AddContactDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, Eye, ArrowUpDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NetworkDashboard() {
  const {
    allContacts,
    teamMembers,
    clients,
    partners,
    isLoading,
    searchContacts,
    updateVisibility,
  } = useUnifiedCRM();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "date" | "activity">("name");

  // Filter contacts based on search
  const filteredContacts = useMemo(() => {
    return searchContacts(searchQuery);
  }, [searchQuery, searchContacts]);

  // Filter by type
  const filteredClients = filteredContacts.filter(c => c.relationship_type === "client");
  const filteredTeam = filteredContacts.filter(c => c.relationship_type === "team_member");
  const pendingInvites = []; // TODO: Add pending invitations from useUnifiedCRM

  // Calculate stats
  const lmiEligibleCount = 0; // TODO: Calculate from client data
  const visibleTeamCount = teamMembers.filter(
    (m) => m.visibility_settings?.visible_to_clients
  ).length;
  const sharedClientsCount = 0; // TODO: Calculate from collaboration data
  const activeDealsCount = 0; // TODO: Calculate from deals data

  const handleAddContact = (type: "client" | "realtor" | "team") => {
    // TODO: Open appropriate form/dialog based on type
    console.log("Add contact:", type);
  };

  const handleToggleVisibility = async (id: string, visible: boolean) => {
    try {
      await updateVisibility({
        professionalId: id,
        settings: { visible_to_clients: visible },
      });
    } catch (error) {
      console.error("Failed to update visibility:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Network</h1>
          <p className="text-muted-foreground mt-1">
            Manage contacts, team visibility, and collaboration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Team Visibility
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAddContact("client")}>
                Add Client
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddContact("realtor")}>
                Add Realtor Partner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddContact("team")}>
                Add Team Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <NetworkStats
        totalContacts={allContacts.length}
        clientsCount={clients.length}
        lmiEligibleCount={lmiEligibleCount}
        realtorPartnersCount={partners.length}
        teamMembersCount={teamMembers.length}
        visibleTeamCount={visibleTeamCount}
        sharedClientsCount={sharedClientsCount}
        activeDealsCount={activeDealsCount}
      />

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search across all contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy("name")}>
              Sort by Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("date")}>
              Sort by Date Added
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("activity")}>
              Sort by Activity
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All Contacts ({filteredContacts.length})
          </TabsTrigger>
          <TabsTrigger value="clients">
            Clients ({filteredClients.length})
          </TabsTrigger>
          <TabsTrigger value="team">
            My Team ({filteredTeam.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingInvites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => {
                if (contact.relationship_type === "client") {
                  return <ClientCard key={contact.id} contact={contact} />;
                } else if (contact.relationship_type === "team_member") {
                  if (contact.contact_type === "professional") {
                    return (
                      <PartnerCard key={contact.id} contact={contact} />
                    );
                  }
                  return (
                    <TeamMemberCard
                      key={contact.id}
                      contact={contact}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  );
                }
                return null;
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((contact) => (
                <ClientCard key={contact.id} contact={contact} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeam.map((contact) => {
                if (contact.contact_type === "professional") {
                  return <PartnerCard key={contact.id} contact={contact} />;
                }
                return (
                  <TeamMemberCard
                    key={contact.id}
                    contact={contact}
                    onToggleVisibility={handleToggleVisibility}
                  />
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            No pending invitations
          </div>
        </TabsContent>
      </Tabs>

      <AddContactDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSelectType={handleAddContact}
      />
    </div>
  );
}
