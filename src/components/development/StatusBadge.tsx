
import React from 'react';
import { Badge } from '@/components/ui/badge';

type Status = 'idle' | 'testing' | 'success' | 'error' | 'signed-in' | 'signed-out' | 'unknown';

interface StatusBadgeProps {
  status: Status;
  idleText?: string;
  testingText?: string;
  successText?: string;
  errorText?: string;
  unknownText?: string;
  signedInText?: string;
  signedOutText?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  idleText = 'Not Tested',
  testingText = 'Testing...',
  successText = 'Connected',
  errorText = 'Failed',
  unknownText = 'Unknown',
  signedInText = 'Signed In',
  signedOutText = 'Signed Out',
}) => {
  let variant:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | null
    | undefined;
  let text: string;

  switch (status) {
    case 'idle':
      variant = 'outline';
      text = idleText;
      break;
    case 'testing':
      variant = 'secondary';
      text = testingText;
      break;
    case 'success':
      variant = 'default';
      text = successText;
      break;
    case 'error':
      variant = 'destructive';
      text = errorText;
      break;
    case 'unknown':
      variant = 'outline';
      text = unknownText;
      break;
    case 'signed-in':
      variant = 'default';
      text = signedInText;
      break;
    case 'signed-out':
      variant = 'secondary';
      text = signedOutText;
      break;
    default:
      variant = 'outline';
      text = 'Unknown';
  }

  return <Badge variant={variant}>{text}</Badge>;
};

export default StatusBadge;
