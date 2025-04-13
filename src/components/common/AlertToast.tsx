import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertToastProps {
  type: AlertType;
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const alertStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: <XCircle className="h-5 w-5 text-red-500" />,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: <Info className="h-5 w-5 text-blue-500" />,
  },
};

const AlertToast: React.FC<AlertToastProps> = ({
  type,
  message,
  isVisible,
  onClose,
}) => {
  if (!isVisible) return null;

  const styles = alertStyles[type];

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div
        className={`flex items-center p-4 rounded-lg border ${styles.bg} ${styles.border} ${styles.text}`}
        role="alert"
      >
        <div className="flex items-center">
          {styles.icon}
          <span className="ml-2">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 inline-flex items-center justify-center rounded-md p-1 hover:bg-black/10 focus:outline-none"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AlertToast;