import React, { useState, useEffect } from 'react';
import LiveMonitor from '../components/dashboard/LiveMonitor';
import AlertPanel from '../components/dashboard/AlertPanel';
import PatientSelector from '../components/dashboard/PatientSelector';
import StatusIndicator from '../components/dashboard/StatusIndicator';

const Dashboard: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState('Patient-001');
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState<'normal' | 'warning' | 'critical'>('normal');

  /*useEffect(() => {
    // Simulate fetching patient data
    fetch('/api/patients')
      .then(response => response.json())
      .then(data => setSelectedPatient(data[0].id));

    // Simulate fetching alerts
    fetch('/api/alerts')
      .then(response => response.json())
      .then(data => setAlerts(data));
  }, []); */

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-8">HMS Brain Activity Monitor</h1>
      
      {/* Patient Selector */}
      <PatientSelector 
        patients={[{ id: 'Patient-001', name: 'John Doe', age: 45, room: 'ICU-4', status: 'stable'}]}
        selectedPatient={selectedPatient}
        onSelectPatient={(patient:any) => setSelectedPatient(patient)}
      />

      {/* Live Monitor */}
      <LiveMonitor 
        eegData={[
          { time: 0, amplitude: 50, alpha: 60, beta: 40 },
          { time: 1, amplitude: 48, alpha: 58, beta: 42 },
          // ... more data points
        ]}
        classification={{ id: 1, status: "Normal", color: "bg-green-500", severity: "Low" }}
        selectedPatient={selectedPatient}
        isLive={true}
        currentTime="12:34 PM"
      />

      {/* Status Indicator */}
      <StatusIndicator 
        status={status} 
        details={{
          value: 45,
          threshold: 50,
          unit: 'μV',
        }}
      />

      {/* Alert Panel */}
      <AlertPanel 
        alerts={[
          { id: '1', type: 'warning', message: 'Unusual alpha wave pattern detected', timestamp: new Date() },
          { id: '2', type: 'critical', message: 'High amplitude spike detected', timestamp: new Date() },
        ]} 
        onDismiss={() => {}}
      />
    </div>
  );
};

export default Dashboard;