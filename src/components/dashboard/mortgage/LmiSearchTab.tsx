
import React from 'react';
import { LmiSearchTabContent } from './lmi-search/LmiSearchTabContent';

interface LmiSearchTabProps {
  onExportResults: (results: any[]) => void;
}

export const LmiSearchTab: React.FC<LmiSearchTabProps> = ({ onExportResults }) => {
  return <LmiSearchTabContent onExportResults={onExportResults} />;
};
