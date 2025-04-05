
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building, Users, Search, DollarSign, ListFilter, Plus } from 'lucide-react';

const RealtorDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  
  const propertyData = [
    { name: 'Jan', searches: 4 },
    { name: 'Feb', searches: 7 },
    { name: 'Mar', searches: 5 },
    { name: 'Apr', searches: 12 },
    { name: 'May', searches: 9 },
    { name: 'Jun', searches: 14 },
  ];
  
  const eligibilityData = [
    { name: 'Eligible', value: 18 },
    { name: 'Not Eligible', value: 7 },
  ];
  
  const COLORS = ['#4ade80', '#f87171'];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Real Estate Agent Dashboard</h1>
        <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">25</span>
              <Building className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">18</span>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Property Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">42</span>
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Est. Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">$46K</span>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Property Search Activity</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={propertyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="searches" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>LMI Eligibility</CardTitle>
            <CardDescription>Properties checked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eligibilityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {eligibilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Client List</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <ListFilter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Client
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Property Interest</th>
                  <th className="p-3 text-left font-medium">LMI Eligible</th>
                  <th className="p-3 text-left font-medium">Last Contact</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Sarah Johnson', status: 'Active', interest: 'Single Family', eligible: true, contact: '2 days ago' },
                  { name: 'Michael Brown', status: 'New Lead', interest: 'Condo', eligible: true, contact: 'Today' },
                  { name: 'Emily Davis', status: 'Active', interest: 'Townhouse', eligible: false, contact: '1 week ago' },
                  { name: 'Robert Wilson', status: 'Closing', interest: 'Single Family', eligible: true, contact: 'Yesterday' },
                  { name: 'Lisa Martinez', status: 'Searching', interest: 'Multi-Family', eligible: true, contact: '3 days ago' },
                ].map((client, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3 font-medium">{client.name}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        client.status === 'Active' ? 'bg-green-100 text-green-800' :
                        client.status === 'New Lead' ? 'bg-blue-100 text-blue-800' :
                        client.status === 'Closing' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="p-3">{client.interest}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full w-2 h-2 ${
                        client.eligible ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span className="ml-1.5">{client.eligible ? 'Yes' : 'No'}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">{client.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtorDashboard;
