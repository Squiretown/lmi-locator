
import React from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface NotificationHeaderProps {
  isApproved: boolean;
  onClose: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  isApproved,
  onClose
}) => {
  return (
    <div className={`p-6 ${isApproved ? 'bg-green-500' : 'bg-red-500'} text-white`}>
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white"
      >
        <X className="h-6 w-6" />
      </button>
      
      <div className="flex items-center gap-3">
        {isApproved ? (
          <CheckCircle className="h-8 w-8" />
        ) : (
          <XCircle className="h-8 w-8" />
        )}
        <h2 className="text-2xl font-bold">
          {isApproved ? 'APPROVED - LMI ELIGIBLE AREA' : 'NOT APPROVED - NOT IN LMI AREA'}
        </h2>
      </div>
    </div>
  );
};
