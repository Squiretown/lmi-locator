
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AdminStatusFooterProps {
  onLogout: () => void;
}

const AdminStatusFooter: React.FC<AdminStatusFooterProps> = ({ onLogout }) => {
  const currentYear = new Date().getFullYear();
  const appVersion = "1.0.1"; // Increment version

  return (
    <div className="p-4 border-t">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start" 
        onClick={onLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        <span>Log Out</span>
      </Button>
      <div className="text-xs text-muted-foreground mt-4">
        <div>© {currentYear} LMI Check</div>
        <div>Version {appVersion}</div>
      </div>
    </div>
  );
};

export default AdminStatusFooter;
