
import React, { useState } from 'react';
import { MoreHorizontal, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchResultDetailModal } from "../search-history/SearchResultDetailModal";

interface Activity {
  id: string;
  address?: string;
  searched_at?: string;
  user_id?: string;
  is_eligible?: boolean;
}

interface RecentActivityProps {
  activities: Activity[];
  isLoading: boolean;
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedActivity(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-2">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No recent activity found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {activities.slice(0, 5).map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-center cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
            onClick={() => handleViewDetails(activity)}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="ml-4 flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {activity.address || 'Address search'}
              </p>
              <p className="text-sm text-muted-foreground">
                {activity.searched_at 
                  ? new Date(activity.searched_at).toLocaleString() 
                  : 'Unknown time'}
                {activity.is_eligible !== undefined && (
                  <span className={`ml-2 ${activity.is_eligible ? 'text-green-500' : 'text-red-500'}`}>
                    • {activity.is_eligible ? 'Eligible' : 'Not eligible'}
                  </span>
                )}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(activity);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">View Details</span>
            </Button>
          </div>
        ))}
      </div>

      <SearchResultDetailModal
        searchRecord={selectedActivity}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
