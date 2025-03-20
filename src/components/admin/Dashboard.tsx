
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart4, 
  Building, 
  CheckCircle, 
  Users, 
  Bell, 
  Eye, 
  Trash, 
  Filter, 
  PlusCircle,
  CalendarDays,
  Activity
} from "lucide-react";

const Dashboard = () => {
  const { toast } = useToast();
  
  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('census-db', {
        body: {
          action: 'getDashboardStats',
          params: {}
        }
      });
      
      if (error) {
        toast({
          title: "Error fetching dashboard stats",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data;
    }
  });

  // Fetch recent searches
  const { data: recentSearches, isLoading: searchesLoading } = useQuery({
    queryKey: ['recentSearches'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('census-db', {
        body: {
          action: 'getSearchHistory',
          params: { limit: 5 }
        }
      });
      
      if (error) {
        toast({
          title: "Error fetching recent searches",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data.data;
    }
  });

  // Mock data for demo
  const mockStats = {
    totalProperties: 2547,
    newProperties: 125,
    lmiProperties: 964,
    lmiPercentage: 37.8,
    registeredUsers: 152,
    newUsers: 12,
    activeAlerts: 89,
    triggeredAlerts: 24
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Today</span>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Properties" 
          value={mockStats.totalProperties.toLocaleString()}
          description={`+${mockStats.newProperties} this month`}
          icon={<Building className="h-8 w-8 text-muted-foreground/60" />}
          color="bg-blue-500"
          isLoading={statsLoading}
        />
        <StatCard 
          title="LMI Properties" 
          value={mockStats.lmiProperties.toLocaleString()}
          description={`${mockStats.lmiPercentage}% of total`}
          icon={<CheckCircle className="h-8 w-8 text-muted-foreground/60" />}
          color="bg-green-500"
          isLoading={statsLoading}
        />
        <StatCard 
          title="Registered Users" 
          value={mockStats.registeredUsers.toLocaleString()}
          description={`+${mockStats.newUsers} this week`}
          icon={<Users className="h-8 w-8 text-muted-foreground/60" />}
          color="bg-cyan-500"
          isLoading={statsLoading}
        />
        <StatCard 
          title="Active Alerts" 
          value={mockStats.activeAlerts.toLocaleString()}
          description={`${mockStats.triggeredAlerts} triggered today`}
          icon={<Bell className="h-8 w-8 text-muted-foreground/60" />}
          color="bg-yellow-500"
          isLoading={statsLoading}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Map Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>LMI Property Distribution</CardTitle>
                <CardDescription>Geographic distribution of properties</CardDescription>
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <div className="text-muted-foreground">
                  Map visualization placeholder
                </div>
              </div>
              <div className="grid grid-cols-4 mt-4 text-center">
                <LegendItem label="Low Income" value="412" color="bg-blue-500" />
                <LegendItem label="Moderate Income" value="552" color="bg-green-500" />
                <LegendItem label="Middle Income" value="734" color="bg-yellow-500" />
                <LegendItem label="Upper Income" value="849" color="bg-red-500" />
              </div>
            </CardContent>
          </Card>

          {/* Latest Properties Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Latest Properties</CardTitle>
                <CardDescription>Recently added properties</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-1" /> Add Property
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Income Category</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchesLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <>
                      <PropertyRow 
                        address="123 Elm St, Anytown, CA 90210"
                        status="LMI Eligible"
                        category="Low Income"
                        added="Today, 9:30 AM"
                      />
                      <PropertyRow 
                        address="456 Pine St, Somewhere, CA 94302"
                        status="LMI Eligible"
                        category="Moderate Income"
                        added="Today, 8:15 AM"
                      />
                      <PropertyRow 
                        address="789 Oak Ave, Elsewhere, CA 95023"
                        status="Not Eligible"
                        category="Upper Income"
                        added="Yesterday, 3:45 PM"
                        isEligible={false}
                      />
                      <PropertyRow 
                        address="101 Maple Dr, Anywhere, CA 91423"
                        status="LMI Eligible"
                        category="Low Income"
                        added="Yesterday, 11:20 AM"
                      />
                      <PropertyRow 
                        address="222 Willow Ln, Someplace, CA 92867"
                        status="Pending"
                        category="Middle Income"
                        added="Mar 18, 2:15 PM"
                        isPending={true}
                      />
                    </>
                  )}
                </TableBody>
              </Table>
              <div className="py-3 px-4 bg-muted/40 flex justify-between items-center text-sm">
                <div>Showing <strong>5</strong> of <strong>984</strong> properties</div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Activity Feed */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>System Activity</CardTitle>
                <CardDescription>Recent system events</CardDescription>
              </div>
              <Button variant="ghost" size="sm">View all</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem 
                  title="MLS Data Import Completed"
                  time="Today, 09:45 AM"
                  description="187 new properties added"
                  color="bg-green-500"
                />
                <ActivityItem 
                  title="User Alert Triggered"
                  time="Today, 08:30 AM"
                  description="24 users notified about new LMI properties"
                  color="bg-blue-500"
                />
                <ActivityItem 
                  title="AMI Thresholds Updated"
                  time="Yesterday, 04:15 PM"
                  description="HUD AMI values updated for 12 counties"
                  color="bg-yellow-500"
                />
                <ActivityItem 
                  title="API Rate Limit Exceeded"
                  time="Yesterday, 02:30 PM"
                  description="ESRI API rate limit reached"
                  color="bg-red-500"
                />
                <ActivityItem 
                  title="New User Registered"
                  time="Yesterday, 10:15 AM"
                  description="User account created for &quot;JohnDoe&quot;"
                  color="bg-blue-500"
                />
              </div>
              <div className="mt-4 text-center">
                <Button size="sm" variant="outline">View All Activity</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Search Trends</CardTitle>
                <CardDescription>Most popular searches</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))
                ) : (
                  <>
                    <SearchTrendItem address="Beverly Hills, CA 90210" count={143} />
                    <SearchTrendItem address="San Francisco, CA 94102" count={112} />
                    <SearchTrendItem address="Oakland, CA 94612" count={98} />
                    <SearchTrendItem address="San Jose, CA 95112" count={87} />
                    <SearchTrendItem address="Sacramento, CA 95814" count={76} />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  color,
  isLoading = false
}: { 
  title: string; 
  value: string | number; 
  description: string; 
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
}) => {
  return (
    <Card className="overflow-hidden">
      <div className={`h-1 ${color}`} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <h3 className="text-2xl font-bold mt-1">{value}</h3>
            )}
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

// Map Legend Item
const LegendItem = ({ label, value, color }: { label: string; value: string; color: string }) => {
  return (
    <div>
      <div className="flex items-center justify-center gap-1">
        <div className={`h-3 w-3 ${color} rounded-sm`}></div>
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
};

// Activity Item
const ActivityItem = ({ 
  title, 
  time, 
  description, 
  color = "bg-blue-500" 
}: { 
  title: string; 
  time: string; 
  description: string; 
  color?: string;
}) => {
  return (
    <div className="relative pl-5">
      <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ${color}`}></div>
      <div className="border-l border-muted pl-3 pb-3">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-xs text-muted-foreground">{time}</p>
        <p className="text-xs mt-1">{description}</p>
      </div>
    </div>
  );
};

// Property Row
const PropertyRow = ({ 
  address, 
  status, 
  category, 
  added,
  isEligible = true,
  isPending = false
}: {
  address: string;
  status: string;
  category: string;
  added: string;
  isEligible?: boolean;
  isPending?: boolean;
}) => {
  let statusColor = "bg-green-500 hover:bg-green-600";
  if (!isEligible) {
    statusColor = "bg-red-500 hover:bg-red-600";
  } else if (isPending) {
    statusColor = "bg-yellow-500 hover:bg-yellow-600";
  }

  return (
    <TableRow>
      <TableCell>{address}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 text-xs rounded-full ${statusColor} text-white`}>
          {status}
        </span>
      </TableCell>
      <TableCell>{category}</TableCell>
      <TableCell>{added}</TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button variant="outline" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Search Trend Item
const SearchTrendItem = ({ address, count }: { address: string; count: number }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm truncate max-w-[200px]">{address}</span>
      </div>
      <span className="text-sm font-medium">{count}</span>
    </div>
  );
};

export default Dashboard;
