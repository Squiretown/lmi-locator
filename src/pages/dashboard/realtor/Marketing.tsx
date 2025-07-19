
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Users, Target, BarChart3 } from "lucide-react";

const RealtorMarketing: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Center</h1>
          <p className="text-muted-foreground">
            Create and manage marketing campaigns for LMI-eligible properties
          </p>
        </div>
        <Button>
          <Megaphone className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Generated</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.1%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Templates</CardTitle>
          <CardDescription>
            Pre-built marketing templates for LMI-eligible properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">First-Time Buyer Special</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Target first-time homebuyers with LMI assistance information
              </p>
              <Button variant="outline" size="sm">Use Template</Button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Property Showcase</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Highlight LMI-eligible properties with program details
              </p>
              <Button variant="outline" size="sm">Use Template</Button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Educational Content</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Educate clients about LMI programs and benefits
              </p>
              <Button variant="outline" size="sm">Use Template</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Downtown Properties Campaign</h4>
                <p className="text-sm text-muted-foreground">Running • 234 views • 12 leads</p>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">First-Time Buyer Workshop</h4>
                <p className="text-sm text-muted-foreground">Completed • 156 attendees • 23 leads</p>
              </div>
              <Button variant="outline" size="sm">View Report</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtorMarketing;
