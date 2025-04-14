
import React from 'react';
import { CheckLmiStatusResponse, AssistanceProgram } from '@/lib/types';
import AddressSearchForm from './AddressSearchForm';
import ResultView from './ResultView';
import EligibilityScreener from './EligibilityScreener';
import ProgramResults from './ProgramResults';
import SpecialistConnect from './SpecialistConnect';
import { DisplayMode } from '@/hooks/usePropertyWorkflow';

interface PropertyCheckerContentProps {
  displayMode: DisplayMode;
  lmiStatus: CheckLmiStatusResponse | null;
  isLoading: boolean;
  matchingPrograms: AssistanceProgram[];
  onSubmit: (values: any) => void;
  onContinue: () => void;
  onReset: () => void;
  onEligibilityComplete: (data: any) => void;
  onConnectSpecialist: () => void;
  onSpecialistComplete: () => void;
  onSaveProperty?: () => void;
}

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
  switch (displayMode) {
    case 'form':
      return <AddressSearchForm onSubmit={onSubmit} isLoading={isLoading} />;
      
    case 'result':
      return lmiStatus ? (
        <ResultView 
          data={lmiStatus}
          onContinue={onContinue}
          onReset={onReset}
          onSaveProperty={onSaveProperty}
        />
      ) : null;
      
    case 'screener':
      return lmiStatus ? (
        <EligibilityScreener
          address={lmiStatus.address}
          onComplete={onEligibilityComplete}
        />
      ) : null;
      
    case 'programs':
      return (
        <ProgramResults
          programs={matchingPrograms}
          address={lmiStatus?.address || 'the selected property'}
          onConnectSpecialist={onConnectSpecialist}
        />
      );
      
    case 'specialist':
      return (
        <SpecialistConnect
          address={lmiStatus?.address || 'the selected property'}
          onComplete={onSpecialistComplete}
        />
      );
      
    default:
      return null;
  }
};

export default PropertyCheckerContent;
