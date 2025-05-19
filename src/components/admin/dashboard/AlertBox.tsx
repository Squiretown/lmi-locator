
import React from 'react';

interface AlertBoxProps {
  type: 'error' | 'warning' | 'info' | 'success';
  icon: React.ReactNode;
  title: string;
  message: string;
  showDemoDataMessage?: boolean;
}

export const AlertBox: React.FC<AlertBoxProps> = ({
  type,
  icon,
  title,
  message,
  showDemoDataMessage = false
}) => {
  const bgColor = {
    error: 'bg-amber-50 border-amber-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200'
  }[type];

  const textColor = {
    error: 'text-amber-800',
    warning: 'text-amber-800',
    info: 'text-blue-800',
    success: 'text-green-800'
  }[type];

  const subTextColor = {
    error: 'text-amber-700',
    warning: 'text-amber-700',
    info: 'text-blue-700',
    success: 'text-green-700'
  }[type];

  return (
    <div className={`${bgColor} border rounded-md p-4 mb-4 flex items-start gap-3`}>
      {icon}
      <div>
        <p className={`${textColor} font-medium`}>{title}</p>
        <p className={`${subTextColor} text-sm`}>
          {message}
          {showDemoDataMessage && (
            <span className="block mt-1">
              Using demo data instead. You can refresh to try again.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
