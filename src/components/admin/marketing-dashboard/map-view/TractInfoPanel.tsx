
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Check, Home, Info } from 'lucide-react';

interface TractInfoPanelProps {
  tract: any;
  onClose: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
}

const TractInfoPanel: React.FC<TractInfoPanelProps> = ({
  tract,
  onClose,
  isSelected,
  onToggleSelect
}) => {
  return (
    <Card className="absolute bottom-4 right-4 w-80 shadow-lg z-10">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Census Tract {tract.tractId}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Badge 
            className={tract.isLmiEligible ? "bg-green-500" : "bg-red-500"}
          >
            {tract.isLmiEligible ? "LMI Eligible" : "Not Eligible"}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">AMI Percentage:</span>
            <span className="font-medium">{tract.amiPercentage}%</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Income Category:</span>
            <span className="font-medium">{tract.incomeCategory}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Median Income:</span>
            <span className="font-medium">${tract.medianIncome?.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Properties:</span>
            <span className="font-medium">{tract.propertyCount?.toLocaleString() || "Unknown"}</span>
          </div>
        </div>
        
        <Button 
          onClick={onToggleSelect}
          className="w-full"
          variant={isSelected ? "outline" : "default"}
        >
          {isSelected ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Selected
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add to Selection
            </>
          )}
        </Button>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            disabled={!tract.propertyCount}
          >
            <Home className="mr-2 h-4 w-4" />
            View Properties
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <Info className="mr-2 h-4 w-4" />
            More Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TractInfoPanel;
