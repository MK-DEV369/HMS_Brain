import React from 'react';
import { AlertCircle, Bell, CheckCircle } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
}

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

const alertStyles = {
  warning: {
    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
  },
  critical: {
    icon: <Bell className="h-5 w-5 text-red-500" />,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
  },
  info: {
    icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
  },
};

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onDismiss }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Activity Alerts</h2>
        <span className="text-sm text-gray-500">{alerts.length} alerts</span>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No active alerts
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                alertStyles[alert.type].bg
              } ${alertStyles[alert.type].border}`}
            >
              <div className="flex items-center space-x-3">
                {alertStyles[alert.type].icon}
                <div>
                  <p className={`font-medium ${alertStyles[alert.type].text}`}>
                    {alert.message}
                  </p>
                  <p className="text-sm text-gray-500">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                Dismiss
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertPanel;