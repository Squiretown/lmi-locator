
import React from 'react';
import SavedProperties from '@/components/SavedProperties';

interface ClientSavedPropertiesProps {
  onAddressSelect: (address: string) => void;
}

export const ClientSavedProperties: React.FC<ClientSavedPropertiesProps> = ({ onAddressSelect }) => {
  return <SavedProperties onAddressSelect={onAddressSelect} />;
};
