
import React from 'react';
import StatusBadge from './StatusBadge';

interface ConnectionStatusProps {
  status: 'idle' | 'testing' | 'success' | 'error';
  authStatus: 'signed-in' | 'signed-out' | 'unknown';
  edgeFunctionStatus: 'idle' | 'testing' | 'success' | 'error';
  pingTime: number | null;
  lastTestedAt: Date | null;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  authStatus,
  edgeFunctionStatus,
  pingTime,
  lastTestedAt,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">Connection Status:</span>
        <StatusBadge status={status} />
      </div>
      
      {pingTime !== null && (
        <div className="flex items-center justify-between">
          <span className="font-medium">Response Time:</span>
          <span>{pingTime}ms</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className="font-medium">Auth Status:</span>
        <StatusBadge status={authStatus} />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="font-medium">Edge Function Status:</span>
        <StatusBadge status={edgeFunctionStatus} />
      </div>
      
      {lastTestedAt && (
        <div className="flex items-center justify-between">
          <span className="font-medium">Last Tested:</span>
          <span>{lastTestedAt.toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
