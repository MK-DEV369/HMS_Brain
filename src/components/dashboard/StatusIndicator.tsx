import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

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
    Icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-100',
    border: 'border-green-300',
    label: 'Normal Activity',
  },
  warning: {
    Icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    label: 'Abnormal Pattern',
  },
  critical: {
    Icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-100',
    border: 'border-red-300',
    label: 'Critical Activity',
  },
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, details }) => {
  const { Icon, color, bg, border, label } = statusConfig[status];

  return (
    <div className={`flex items-center space-x-3 p-4 rounded-lg ${bg} ${border}`}>
      <Icon className={`h-6 w-6 ${color}`} />
      <div>
        <p className={`font-semibold ${color}`}>{label}</p>
        {details && (
          <p className="text-sm text-gray-600">
            {details.value}
            {details.unit && ` ${details.unit}`}
            {details.threshold && ` (Threshold: ${details.threshold}${details.unit || ''})`}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatusIndicator;
