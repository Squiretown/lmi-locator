import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Briefcase, UsersRound, Handshake, TrendingUp } from "lucide-react";

interface NetworkStatsProps {
  totalContacts: number;
  clientsCount: number;
  lmiEligibleCount: number;
  realtorPartnersCount: number;
  teamMembersCount: number;
  visibleTeamCount: number;
  sharedClientsCount: number;
  activeDealsCount: number;
  pipelineValue?: string;
}

export function NetworkStats({
  totalContacts,
  clientsCount,
  lmiEligibleCount,
  realtorPartnersCount,
  teamMembersCount,
  visibleTeamCount,
  sharedClientsCount,
  activeDealsCount,
  pipelineValue,
}: NetworkStatsProps) {
  const stats = [
    {
      title: "Total Contacts",
      value: totalContacts,
      icon: Users,
      subtitle: null,
    },
    {
      title: "Clients",
      value: clientsCount,
      icon: UserCheck,
      subtitle: `${lmiEligibleCount} LMI eligible`,
    },
    {
      title: "Realtor Partners",
      value: realtorPartnersCount,
      icon: Briefcase,
      subtitle: "Referrals YTD",
    },
    {
      title: "Team Members",
      value: teamMembersCount,
      icon: UsersRound,
      subtitle: `${visibleTeamCount} visible to clients`,
    },
    {
      title: "Shared Clients",
      value: sharedClientsCount,
      icon: Handshake,
      subtitle: "Collaborative cases",
    },
    {
      title: "Active Deals",
      value: activeDealsCount,
      icon: TrendingUp,
      subtitle: pipelineValue ? `$${pipelineValue}` : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {stat.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
