
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobStatus } from "./types";

interface SearchProgressProps {
  jobStatus: JobStatus;
  progress: number;
  statusMessage: string;
  onCancel: () => void;
}

export const SearchProgress: React.FC<SearchProgressProps> = ({
  jobStatus,
  progress,
  statusMessage,
  onCancel
}) => {
  return (
    <div className="my-6 space-y-2">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">{statusMessage}</div>
        <Badge variant={
          jobStatus === 'completed' ? 'default' : 
          jobStatus === 'processing' ? 'secondary' : 
          jobStatus === 'error' ? 'destructive' : 
          'outline'
        }>
          {jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)}
        </Badge>
      </div>
      <Progress value={progress} className="h-2" />
      {jobStatus === 'processing' && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
