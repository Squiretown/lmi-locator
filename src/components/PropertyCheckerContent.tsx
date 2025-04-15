
import React from 'react';
import ResultView from './ResultView';
import AddressSearchForm from './AddressSearchForm';
import ProgramResults from './ProgramResults';
import EligibilityScreener from './EligibilityScreener';
import SpecialistConnect from './SpecialistConnect';
import LoadingSpinner from './LoadingSpinner';
import { CheckLmiStatusResponse } from '@/lib/types';
import { AssistanceProgram } from '@/lib/types/assistance-programs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Property Checker display modes - updated to match usePropertyWorkflow
export type DisplayMode = 'form' | 'result' | 'screener' | 'programs' | 'specialist' | 'search' | 'results';

interface PropertyCheckerContentProps {
  displayMode: DisplayMode;
  lmiStatus: CheckLmiStatusResponse | null;
  isLoading: boolean;
  matchingPrograms: AssistanceProgram[];
  onSubmit: (values: any) => void;
  onContinue: () => void;
  onReset: () => void;
  onEligibilityComplete: (formData: any) => void;
  onConnectSpecialist: () => void;
  onSpecialistComplete: () => void;
  onSaveProperty?: () => void;
}

// Component to display the appropriate content based on the current display mode
const PropertyCheckerContent: React.FC<PropertyCheckerContentProps> = ({
  displayMode,
  lmiStatus,
  isLoading,
  matchingPrograms,
  onSubmit,
  onContinue,
  onReset,
  onEligibilityComplete,
  onConnectSpecialist,
  onSpecialistComplete,
  onSaveProperty,
}) => {
  const { user } = useAuth();

  // Handler for save property when user is not logged in
  const handleSaveProperty = () => {
    if (!user) {
      // Redirect to login/signup page or show a toast message
      toast.error('Please sign in to save properties', {
        description: 'Create an account to save and track properties',
        action: {
          label: 'Sign In',
          onClick: () => window.location.href = '/login'
        }
      });
      return;
    }
    
    if (onSaveProperty) {
      onSaveProperty();
    }
  };

  // Display loading state during API requests
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Render the appropriate component based on the current display mode
  switch (displayMode) {
    case 'results':
    case 'result':
      return lmiStatus ? (
        <ResultView 
          data={lmiStatus} 
          onContinue={onContinue} 
          onReset={onReset}
          onSaveProperty={handleSaveProperty}
        />
      ) : null;
      
    case 'screener':
      return <EligibilityScreener 
               address={lmiStatus?.address || ''}
               onComplete={onEligibilityComplete} 
             />;
      
    case 'programs':
      return (
        <ProgramResults 
          programs={matchingPrograms} 
          address={lmiStatus?.address || ''}
          onConnectSpecialist={onConnectSpecialist}
        />
      );
      
    case 'specialist':
      return (
        <SpecialistConnect 
          onComplete={onSpecialistComplete} 
          address={lmiStatus?.address || ''}
        />
      );
      
    case 'search':
    case 'form':
    default:
      return <AddressSearchForm onSubmit={onSubmit} isLoading={isLoading} />;
  }
};

export default PropertyCheckerContent;
