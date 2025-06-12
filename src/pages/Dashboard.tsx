import React, { useState} from 'react';
import LiveMonitor from '../components/dashboard/LiveMonitor';
import AlertPanel from '../components/dashboard/AlertPanel';
import StatusIndicator from '../components/dashboard/StatusIndicator';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ProcessedEEGPoint } from '../utils/dataProcessing';
import { Patient } from '../utils/types';

const Dashboard: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [status, setStatus] = useState<'normal' | 'warning' | 'critical'>('normal');
  const [eegData, setEegData] = useState<ProcessedEEGPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-white min-h-screen">
      {/* Live Monitor */}
      <div className="relative">
        {loading && <LoadingSpinner />}
        <LiveMonitor
          eegData={eegData}
          classification={{
            id: status === 'normal' ? 0 : status === 'warning' ? 1 : 2,
            status: status === 'normal' ? 'Normal' : status === 'warning' ? 'Warning' : 'Critical',
            color: status === 'normal' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500',
            severity: status === 'normal' ? 'Low' : status === 'warning' ? 'Medium' : 'High',
          }}
          selectedPatient={selectedPatient}
          setSelectedPatient={setSelectedPatient}
          isLive={true}
          currentTime={currentTime}
        />
      </div>

      {/* Status Indicator */}
      <StatusIndicator
        status={status}
        details={{
          value: Math.random() * 100, // Randomized for now
          threshold: 50,
          unit: 'μV',
        }}
      />

      {/* Alert Panel */}
      <AlertPanel
        alerts={alerts}
        onDismiss={(alertId: string) => setAlerts(prev => prev.filter(alert => alert.id !== alertId))}
      />
    </div>
  );
};

export default Dashboard;