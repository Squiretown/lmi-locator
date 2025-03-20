
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4, Building, Users, Bell } from 'lucide-react';

// This is the Dashboard component that will be used in the AdminDashboard
const Dashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Properties" 
          value="2,547" 
          subtitle="+125 this month" 
          icon={<Building className="h-8 w-8 text-primary" />} 
        />
        <StatCard 
          title="LMI Properties" 
          value="964" 
          subtitle="37.8% of total" 
          icon={<BarChart4 className="h-8 w-8 text-green-500" />} 
        />
        <StatCard 
          title="Registered Users" 
          value="152" 
          subtitle="+12 this week" 
          icon={<Users className="h-8 w-8 text-blue-500" />} 
        />
        <StatCard 
          title="Active Alerts" 
          value="89" 
          subtitle="24 triggered today" 
          icon={<Bell className="h-8 w-8 text-amber-500" />} 
        />
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is where recent activity data will be displayed.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">API Status: Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Database: Connected</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper component for stat cards
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
