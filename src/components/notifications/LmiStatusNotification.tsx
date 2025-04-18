
import React from 'react';
import { 
  MapPin, 
  Share2, 
  Save, 
  X, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Info,
  Mail
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LmiStatusNotificationProps {
  isApproved: boolean;
  address: string;
  tractId: string;
  onClose: () => void;
  onShare?: () => void;
  onSave?: () => void;
}

const LmiStatusNotification = ({
  isApproved,
  address,
  tractId,
  onClose,
  onShare,
  onSave
}: LmiStatusNotificationProps) => {
  const handleShare = () => {
    if (onShare) {
      const subject = `LMI Property Status: ${address}`;
      const body = `Property Status Report for ${address}:\n\nCensus Tract: ${tractId}\nLMI Status: ${isApproved ? 'Eligible' : 'Not Eligible'}`;
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full bg-white shadow-xl relative overflow-hidden">
        {/* Status Header */}
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

        <div className="p-6">
          {/* Address Section */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <p className="text-lg font-medium">{address}</p>
              </div>
              
              <div className="flex gap-2 mb-4">
                <Badge variant="outline" className="text-xs">
                  Census Tract: {tractId}
                </Badge>
                <Badge 
                  variant={isApproved ? 'success' : 'destructive'}
                  className="text-xs"
                >
                  {isApproved ? 'Low Income Area' : 'Upper Income Area'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Information Section */}
          {isApproved ? (
            <div className="mb-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Info className="h-5 w-5 text-green-500" />
                Eligibility Information
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Down Payment Assistance Programs Available</li>
                <li>✓ Special Mortgage Rate Programs</li>
                <li>✓ Reduced PMI Options</li>
                <li>✓ First-Time Homebuyer Benefits</li>
              </ul>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                Alternative Options
              </h3>
              <p className="text-sm text-blue-600">
                While this property isn't in an LMI area, you may still qualify for other assistance programs. 
                Connect with a specialist to explore all available options.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleShare} className="flex-1">
              <Mail className="mr-2 h-4 w-4" />
              Share via Email
            </Button>
            
            <Button 
              variant={isApproved ? 'success' : 'outline'} 
              onClick={onSave} 
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Property
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LmiStatusNotification;
