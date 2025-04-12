
import React from 'react';

interface TractInfoPanelProps {
  isEligible: boolean;
  tractId?: string;
}

const TractInfoPanel: React.FC<TractInfoPanelProps> = ({ isEligible, tractId }) => {
  return (
    <div className="p-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isEligible ? 'bg-eligible' : 'bg-ineligible'}`}></div>
        <span>
          {isEligible ? 'LMI Eligible' : 'Not LMI Eligible'} Census Tract
          {tractId && <> ({tractId})</>}
        </span>
      </div>
    </div>
  );
};

export default TractInfoPanel;
