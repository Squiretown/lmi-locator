
import React from 'react';
import EligibilityScreener from '../EligibilityScreener';

interface PropertyScreenerProps {
  address: string;
  onComplete: () => void;
}

const PropertyScreener: React.FC<PropertyScreenerProps> = ({
  address,
  onComplete
}) => {
  return (
    <EligibilityScreener
      address={address}
      onComplete={onComplete}
    />
  );
};

export default PropertyScreener;
