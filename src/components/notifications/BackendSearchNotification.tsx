
import React from 'react';
import { 
  MapPin, 
  Share2, 
  Save, 
  X, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Download,
  Flag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BackendSearchNotificationProps {
  isApproved: boolean;
  address: string;
  tractId: string;
  onClose: () => void;
  onExport?: () => void;
  onFlag?: () => void;
  onSave?: () => void;
}

const BackendSearchNotification = ({
  isApproved,
  address,
  tractId,
  onClose,
  onExport,
  onFlag,
  onSave
}: BackendSearchNotificationProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full bg-white shadow-xl relative overflow-hidden">
        <div className={`p-6 ${isApproved ? 'bg-emerald-600' : 'bg-amber-600'} text-white`}>
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
              {isApproved ? 'LMI ELIGIBLE - ADD TO LIST' : 'NOT ELIGIBLE - REVIEW NEEDED'}
            </h2>
          </div>
        </div>

        <div className="p-6">
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
                  variant={isApproved ? 'success' : 'secondary'}
                  className="text-xs"
                >
                  {isApproved ? 'Verified LMI Area' : 'Verification Required'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-semibold">Administrative Actions</h3>
            <div className="flex flex-wrap gap-3">
              {onExport && (
                <Button variant="outline" onClick={onExport} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              )}
              
              {onFlag && (
                <Button 
                  variant="outline" 
                  onClick={onFlag} 
                  className="flex-1"
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Flag for Review
                </Button>
              )}
              
              {onSave && (
                <Button 
                  variant={isApproved ? 'success' : 'secondary'}
                  onClick={onSave}
                  className="w-full mt-2"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isApproved ? 'Add to Marketing List' : 'Save for Later Review'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BackendSearchNotification;
