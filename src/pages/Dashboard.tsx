import React, { useState, useEffect } from 'react';
import LiveMonitor from '../components/dashboard/LiveMonitor';
import AlertPanel from '../components/dashboard/AlertPanel';
import StatusIndicator from '../components/dashboard/StatusIndicator';
import { predictEEG } from "../services/api";
import LoadingSpinner from '../components/common/LoadingSpinner'; // Show spinner during prediction
import { ProcessedEEGPoint } from '../utils/dataProcessing';
import { Patient } from '../utils/types';
import { API_BASE_URL } from '../utils/constants';

const Dashboard: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [status, setStatus] = useState<'normal' | 'warning' | 'critical'>('normal');
  const [eegData, setEegData] = useState<ProcessedEEGPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [confidenceScores, setConfidenceScores] = useState({
    seizure: 0,
    lpd: 0,
    gpd: 0,
    lrda: 0,
    grda: 0,
    others: 0,
  });

  // const handleLivePrediction = async (filename: string) => {
  //   if (!selectedPatient) return;
  //   try {
  //     setLoading(true);
  //     const result = await predictEEG(filename); // Call the backend API
  //     console.log('Prediction result:', result);
  //     const response = await fetch(`${API_BASE_URL}/eeg/data/${selectedPatient?.id}/`);
  //     console.log('Response (Alpha Beta Gamma)', response);
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch EEG data");
  //     }
  //     const result2 = await response.json(); //Confidence Scores
  //     const classId = result.prediction;
  //     setConfidenceScores(result.confidence_scores);

  //     if (classId === 0) setStatus('normal');
  //     else if (classId < 4) setStatus('warning');
  //     else setStatus('critical');

  //     const labelNames = ['seizure', 'lpd', 'gpd', 'lrda', 'grda', 'others'];
  //     const label = labelNames[classId];
  //     const alertType = classId > 3 ? 'critical' : classId > 0 ? 'warning' : 'info';

  //     if (classId !== 0) {
  //       setAlerts(prev => [
  //         ...prev,
  //         {
  //           id: Date.now().toString(),
  //           type: alertType,
  //           message: `Detected: ${label.toUpperCase()}`,
  //           timestamp: new Date(),
  //         },
  //       ]);
  //     }
  //       // Update EEG data for visualization
  //     const eegDataFromBackend = result2.eegData || []; // Ensure backend returns EEG data
  //     setEegData(prevData => [
  //       ...prevData.slice(-50), // Keep the last 50 points
  //       ...eegDataFromBackend.map((dataPoint: any, index: number) => ({
  //         time: prevData.length + index,
  //         amplitude: dataPoint.amplitude,
  //         alpha: dataPoint.alpha,
  //         beta: dataPoint.beta,
  //       })),
  //     ]);
  //   } catch (error) {
  //     console.error('Prediction failed:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Real-time timer and prediction trigger
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentTime(new Date().toLocaleTimeString());
  //     if (selectedPatient) {
  //       handleLivePrediction(`${selectedPatient.id}.parquet`); // Use patient-specific EEG file
  //     }
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, [selectedPatient]);

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