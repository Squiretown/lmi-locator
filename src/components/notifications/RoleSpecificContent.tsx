
import React from 'react';
import { Info } from 'lucide-react';

interface RoleSpecificContentProps {
  isApproved: boolean;
  userType?: string | null;
}

export const RoleSpecificContent: React.FC<RoleSpecificContentProps> = ({
  isApproved,
  userType
}) => {
  if (!isApproved) {
    return (
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">
          Alternative Options
        </h3>
        <p className="text-sm text-blue-600">
          While this property isn't in an LMI area, you may still qualify for other assistance programs. 
          Connect with a specialist to explore all available options.
        </p>
      </div>
    );
  }

  switch (userType) {
    case 'mortgage_professional':
      return (
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info className="h-5 w-5 text-green-500" />
            Lending Program Information
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ Property qualifies for LMI lending programs</li>
            <li>✓ FHA/VA loan options available</li>
            <li>✓ Special rate programs applicable</li>
            <li>✓ Down payment assistance eligible</li>
          </ul>
        </div>
      );

    case 'realtor':
      return (
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info className="h-5 w-5 text-green-500" />
            Property Qualification
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ LMI-eligible location confirmed</li>
            <li>✓ Share with clients seeking assistance programs</li>
            <li>✓ Potential for expedited closing</li>
            <li>✓ Special financing options available</li>
          </ul>
        </div>
      );

    default: // client
      return (
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
      );
  }
};
