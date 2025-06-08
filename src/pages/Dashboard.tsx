import React, { useState, useEffect } from 'react';
import LiveMonitor from '../components/dashboard/LiveMonitor';
import AlertPanel from '../components/dashboard/AlertPanel';
import StatusIndicator from '../components/dashboard/StatusIndicator';
import { predictEEG } from "../services/api";
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ProcessedEEGPoint } from '../utils/dataProcessing';
import { Patient } from '../utils/types';
import { API_BASE_URL } from '../utils/constants';

const Dashboard: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [status, setStatus] = useState<'normal' | 'warning' | 'critical'>('normal');
  const [eegData, setEegData] = useState<ProcessedEEGPoint[]>([]);
  const [spectrogramData, setSpectrogramData] = useState<ProcessedEEGPoint[]>([]);
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

    // Fetch EEG data from numpy file
  const fetchEEGData = async (patientId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/numpy/eeg/${patientId}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch EEG numpy data');
      }
      const data = await response.json();
      
      // Convert numpy data to ProcessedEEGPoint format
      const processedData: ProcessedEEGPoint[] = data.eeg_data.map((point: any, index: number) => ({
        time: Date.now() + index * 100, // Use timestamp for x-axis
        amplitude: point.amplitude || point[0] || (Math.random() * 100 - 50),
        alpha: point.alpha || point[1] || Math.random() * 20,
        beta: point.beta || point[2] || Math.random() * 15,
        gamma: point.gamma || Math.random() * 10,
        theta: point.theta || Math.random() * 25,
        delta: point.delta || Math.random() * 30
      }));
      
      setEegData(prevData => [...prevData.slice(-50), ...processedData.slice(-20)]);
    } catch (error) {
      console.error('Error fetching EEG numpy data:', error);
      // Fallback to simulated data
      const simulatedData: ProcessedEEGPoint[] = Array.from({ length: 10 }, (_, index) => ({
        time: Date.now() + index * 100,
        amplitude: Math.sin(index * 0.5) * 50 + Math.random() * 20 - 10,
        alpha: Math.random() * 20 + 5,
        beta: Math.random() * 15 + 3,
        gamma: Math.random() * 10 + 2,
        theta: Math.random() * 25 + 5,
        delta: Math.random() * 30 + 10
      }));
      setEegData(prevData => [...prevData.slice(-50), ...simulatedData]);
    }
  };

  // Fetch Spectrogram data from numpy file
  const fetchSpectrogramData = async (patientId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/numpy/spec/${patientId}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch spectrogram numpy data');
      }
      const data = await response.json();
      
      // Convert numpy spectrogram data to ProcessedEEGPoint format
      const processedData: ProcessedEEGPoint[] = data.spec_data.map((point: any, index: number) => ({
        time: Date.now() + index * 100,
        amplitude: point.intensity || point[0] || Math.random() * 100,
        alpha: point.alpha_power || point[1] || Math.random() * 50,
        beta: point.beta_power || point[2] || Math.random() * 40,
        gamma: point.gamma_power || Math.random() * 30,
        theta: point.theta_power || Math.random() * 35,
        delta: point.delta_power || Math.random() * 45
      }));
      
      setSpectrogramData(prevData => [...prevData.slice(-50), ...processedData.slice(-20)]);
    } catch (error) {
      console.error('Error fetching spectrogram numpy data:', error);
      // Fallback to simulated spectrogram data
      const simulatedData: ProcessedEEGPoint[] = Array.from({ length: 10 }, (_, index) => ({
        time: Date.now() + index * 100,
        amplitude: Math.random() * 100 + 20,
        alpha: Math.random() * 50 + 10,
        beta: Math.random() * 40 + 8,
        gamma: Math.random() * 30 + 5,
        theta: Math.random() * 35 + 8,
        delta: Math.random() * 45 + 15
      }));
      setSpectrogramData(prevData => [...prevData.slice(-50), ...simulatedData]);
    }
  };

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