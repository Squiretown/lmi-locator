
import React from 'react';
import { Activity, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminStatusFooterProps {
  onLogout: () => Promise<void>;
}

const AdminStatusFooter: React.FC<AdminStatusFooterProps> = ({ onLogout }) => {
  return (
    <div className="p-2">
      <div className="rounded-md p-2 bg-muted/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs">System Status: Online</span>
        </div>
        <div className="flex justify-between">
          <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Activity className="h-3 w-3" />
            <span>View Details</span>
          </button>
          <Button
            variant="ghost" 
            size="sm"
            onClick={onLogout}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 h-auto p-0"
          >
            <LogOut className="h-3 w-3" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminStatusFooter;
