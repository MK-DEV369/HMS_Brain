import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

type Status = 'normal' | 'warning' | 'critical';

interface StatusIndicatorProps {
  status: Status;
  details?: {
    value?: number;
    threshold?: number;
    unit?: string;
  };
}

const statusConfig = {
  normal: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'Normal Activity',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'Abnormal Pattern Detected',
  },
  critical: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'Critical Activity',
  },
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, details }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-2 p-3 rounded-lg ${config.bg} ${config.border}`}>
      <Icon className={`h-5 w-5 ${config.color}`} />
      <div>
        <p className={`font-medium ${config.color}`}>{config.text}</p>
        {details && (
          <p className="text-sm text-gray-600">
            {details.value}
            {details.unit}
            {details.threshold && ` (Threshold: ${details.threshold}${details.unit})`}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatusIndicator;