
import React from 'react';
import { 
  BarChart3, 
  Users, 
  Bell, 
  Clock, 
  FileText, 
  Search, 
  MapPin, 
  FileSpreadsheet, 
  List,
  Map
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center w-full space-x-2 px-4 py-2 text-sm rounded-md text-left transition-colors",
        active 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};

interface MarketingSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const MarketingSidebar: React.FC<MarketingSidebarProps> = ({ 
  activeSection, 
  setActiveSection 
}) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
    { id: 'search', label: 'Bulk Address Search', icon: Search },
    { id: 'map', label: 'LMI Tract Map', icon: Map },
    { id: 'jobs', label: 'Marketing Jobs', icon: Clock },
    { id: 'lists', label: 'Saved Lists', icon: FileSpreadsheet },
    { id: 'users', label: 'User Analysis', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'properties', label: 'Property Explorer', icon: MapPin },
    { id: 'content', label: 'Content Management', icon: FileText },
    { id: 'create', label: 'Create Content', icon: List },
  ];

  return (
    <div className="w-56 border-r bg-background h-full py-6 px-2 space-y-6">
      <div className="px-2">
        <h2 className="text-lg font-semibold">Marketing</h2>
        <p className="text-sm text-muted-foreground">Manage your marketing tools</p>
      </div>
      
      <div className="space-y-1">
        {menuItems.map(item => (
          <SidebarItem 
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeSection === item.id}
            onClick={() => setActiveSection(item.id)}
          />
        ))}
      </div>
    </div>
  );
};
