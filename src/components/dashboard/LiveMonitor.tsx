import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, Activity, AlertCircle, AlertTriangle } from 'lucide-react';
import { API_BASE_URL, WS_BASE_URL } from '../../utils/constants';
import { processEEGData, ProcessedEEGPoint } from '../../utils/dataProcessing';
import PatientSelector from './PatientSelector';
import { Patient, LiveMonitorProps } from '../../utils/types';
import emergency from "../../context/emergency.mp3";
import { useClerk } from '@clerk/clerk-react';
import { predictEEG } from "../../services/api";

// Classification result options
const classificationResults = [
  { id: 0, status: "Seizure", color: "bg-red-500", severity: "Critical" },
  { id: 1, status: "LPD", color: "bg-orange-500", severity: "High" },
  { id: 2, status: "GPD", color: "bg-yellow-500", severity: "Medium" },
  { id: 3, status: "LRDA", color: "bg-green-500", severity: "Medium" },
  { id: 4, status: "GRDA", color: "bg-blue-500", severity: "Low" },
  { id: 5, status: "Others", color: "bg-gray-400", severity: "Low" }
];

interface ExtendedLiveMonitorProps extends LiveMonitorProps {
  onAlertMedicalStaff?: () => void;
}

export default function LiveMonitor({ eegData, onAlertMedicalStaff }: ExtendedLiveMonitorProps) {
  const { user } = useClerk();
  const [patients, setPatients] = useState([]);
  const [classification, setClassification] = useState(classificationResults[0]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eegDataState, setEEGData] = useState<ProcessedEEGPoint[]>([]);
  const [spectrogramData, setSpectrogramData] = useState<ProcessedEEGPoint[]>([]);
  const [confidenceScores, setConfidenceScores] = useState({
    Seizure: 0,
    LPD: 0,
    GPD: 0,
    LRDA: 0,
    GRDA: 0,
    Others: 0,
  });
  const [vitalSigns, setVitalSigns] = useState<{
  heartRate: number | string;
  temperature: number | string;
  bloodPressure: string;
  }>({
    heartRate: "--",
    temperature: "--",
    bloodPressure: "--",
  });

  
  const socketRef = useRef<WebSocket | null>(null);
  const eegIntervalRef = useRef<number | null>(null);
  const spectrogramIntervalRef = useRef<number | null>(null);
  const [fullEEGBuffer, setFullEEGBuffer] = useState<ProcessedEEGPoint[]>([]);
  const [pointer, setPointer] = useState(0);

// Enhanced Alert Medical Staff function
const alertMedicalStaff = async () => {
  if (!selectedPatient || !user) return;    
  try {
    const playEmergencySound = async () => {
      try {
        const audio = new Audio(emergency);
        audio.volume = 0.8;
        await audio.play();
      } catch (err) {
        console.warn(`Failed to play emergency sound:`, err);
      }
    };     
    await playEmergencySound();      
    const alertMessage = `🚨 MEDICAL EMERGENCY ALERT 🚨\n\nPatient: ${selectedPatient.name}\nRoom: ${selectedPatient.room}\nStatus: ${classification.status}\nSeverity: ${classification.severity}\nTime: ${new Date().toLocaleString()}\n\nMedical staff will be notified immediately.`;
    alert(alertMessage);
    const phoneNumber = user.phoneNumbers?.[0]?.phoneNumber;
    if (!phoneNumber) {
      throw new Error('User phone number not found');
    }

    const alertResponse = await fetch(`${API_BASE_URL}/eeg/alerts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.id}`
      },
      body: JSON.stringify({
        patient_id: selectedPatient.id,
        patient_name: selectedPatient.name,
        room: selectedPatient.room,
        alert_type: classification.status,
        message: `Emergency alert: ${classification.status} detected for patient ${selectedPatient.name}`,
        severity: classification.severity,
        timestamp: new Date().toISOString(),
        doctor_id: user.id,
        confidence_scores: confidenceScores,
        phone_number: phoneNumber
      })
    });

    if (!alertResponse.ok) {
      throw new Error('Failed to send alert to system');
    }

    console.log('Medical alert sent successfully');      
  } catch (error) {
    console.error('❌ Error sending medical alert:', error);
    alert('Failed to send medical alert. Please contact medical staff directly.');
  }
};

  // Fetch EEG data from numpy files
  const fetchEEGFromNumpy = async (patientId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/eeg/data/${patientId}/`);
    if (!response.ok) throw new Error('Failed to fetch EEG numpy data');

    const data = await response.json();
    const processedData: ProcessedEEGPoint[] = data.eeg_data.map((point: any, index: number) => ({
      time: index,
      amplitude: point.amplitude || point[0],
      alpha: point.alpha || point[1],
      beta: point.beta || point[2],
      gamma: point.gamma || point[3] || Math.random() * 10,
      theta: point.theta || point[4] || Math.random() * 25,
      delta: point.delta || point[5] || Math.random() * 30
    }));

    setFullEEGBuffer(processedData);
    setPointer(0);
    setEEGData(processedData);
  } catch (error) {
    console.error('Error fetching EEG numpy data:', error);
  }
};

  // Fetch Spectrogram data from numpy files
  const fetchSpectrogramFromNumpy = async (patientId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/eeg/data/${patientId}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch spectrogram numpy data');
      }
      const data = await response.json();
      
      // Convert numpy spectrogram data to ProcessedEEGPoint format
      const processedData: ProcessedEEGPoint[] = data.spec_data.map((point: any, index: number) => ({
        time: index,
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
    }
  };

  // Fetch available patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/eeg/patients/`);
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        const data = await response.json();
        console.log('Fetched patients:', data);
        setPatients(data);
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    };
    
    fetchPatients();
    
    // Update clock every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(clockInterval);
  }, []);

  // Real-time data fetching from numpy files
  useEffect(() => {
    if (!selectedPatient || !isLive) {
      if (eegIntervalRef.current) clearInterval(eegIntervalRef.current);
      if (spectrogramIntervalRef.current) clearInterval(spectrogramIntervalRef.current);
      return;
    }

    // Fetch EEG data every 2 seconds
    eegIntervalRef.current = setInterval(() => {
      fetchEEGFromNumpy(selectedPatient.id.toString());
    }, 2000);

    // Fetch Spectrogram data every 3 seconds
    spectrogramIntervalRef.current = setInterval(() => {
      fetchSpectrogramFromNumpy(selectedPatient.id.toString());
    }, 3000);

    // Initial fetch
    fetchEEGFromNumpy(selectedPatient.id.toString());
    fetchSpectrogramFromNumpy(selectedPatient.id.toString());

    return () => {
      if (eegIntervalRef.current) clearInterval(eegIntervalRef.current);
      if (spectrogramIntervalRef.current) clearInterval(spectrogramIntervalRef.current);
    };
  }, [selectedPatient, isLive]);

useEffect(() => {
  if (!selectedPatient) return;

  const controller = new AbortController();

  const fetchVitals = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/eeg/data/${selectedPatient.id}/`,
        { signal: controller.signal }
      );

      if (!response.ok) throw new Error('Failed to fetch EEG + vital signs');

      const data = await response.json();

      setVitalSigns({
        heartRate: data?.vital_signs?.heart_rate ?? "--",
        temperature: data?.vital_signs?.temperature ?? "--",
        bloodPressure: data?.vital_signs?.blood_pressure ?? "--"
      });
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("❌ Failed to load vital signs:", err);
        setVitalSigns({ heartRate: "--", temperature: "--", bloodPressure: "--" });
      }
    }
  };

  fetchVitals();
  return () => controller.abort();
}, [selectedPatient]);


useEffect(() => {
  if (!selectedPatient || !isLive) return;

  const wsUrl = `${WS_BASE_URL}/ws/eeg/${selectedPatient.id}/`;
  const socket = new WebSocket(wsUrl);
  socketRef.current = socket;

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
    setIsConnected(true);
    setError(null);
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);

      if (message.type === "eeg_data") {
        const processedData = processEEGData(message.data);
        setEEGData((prev) => [...prev, ...processedData].slice(-100));
      }

      if (message.type === "classification") {
        const { classification_id, confidence_scores } = message;
        const matchedClass = classificationResults.find(c => c.id === classification_id) || classificationResults[0];
        setClassification(matchedClass);
        setConfidenceScores({
          Seizure: confidence_scores?.seizure ?? 0,
          LPD: confidence_scores?.lpd ?? 0,
          GPD: confidence_scores?.gpd ?? 0,
          LRDA: confidence_scores?.lrda ?? 0,
          GRDA: confidence_scores?.grda ?? 0,
          Others: confidence_scores?.others ?? 0,
        });
      }

      if (message.type === "vital_signs") {
        setVitalSigns({
          heartRate: message.data?.heart_rate ?? "--",
          temperature: message.data?.temperature ?? "--",
          bloodPressure: message.data?.blood_pressure ?? "--"
        });
      }

    } catch (e) {
      console.error("❌ Error parsing WebSocket message:", e);
    }
  };

  socket.onerror = (e) => {
    console.error("❌ WebSocket error:", e);
    setIsConnected(false);
  };

  socket.onclose = () => {
    console.log("🔌 WebSocket closed");
    setIsConnected(false);
  };

  return () => {
    socket.close();
  };
}, [selectedPatient, isLive]);

  
  // Handle live toggle
  const toggleLiveMode = () => {
    const newLiveState = !isLive;
    setIsLive(newLiveState);
    
    if (!newLiveState && socketRef.current) {
      socketRef.current.close();
      setIsConnected(false);
    }
  };
  
  return (
    <div className="flex flex-col space-y-4 p-6 h-full">
      {/* Header with patient selector and time */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <PatientSelector
            patients={patients}
            selectedPatient={selectedPatient}
            onSelectPatient={(patient: any) => setSelectedPatient(patient)}
          />
          {selectedPatient && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Age: {selectedPatient.age}</span>
              <span className="text-sm text-gray-500">Room: {selectedPatient.room}</span>
            </div>
          )}
        </div>        
        <div className="flex items-center space-x-4"> 
          <div className="text-lg font-bold">{currentTime}</div>
          <div className={`flex items-center px-3 py-1 rounded-lg text-xs ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
          <button
            className={`px-4 py-2 rounded-lg ${isLive ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
            onClick={toggleLiveMode}
          >
            {isLive ? 'LIVE' : 'PAUSED'}
          </button>
        </div>
      </div>      
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Main content grid */}
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Left sidebar with status */}
        <div className="col-span-3 bg-gray-50 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Status</h3>
            <Activity className="text-blue-500" />
          </div>
          
          <div className={`p-4 rounded-lg ${classification.color} text-white`}>
            <div className="flex items-center space-x-2">
              {classification.id !== 1 && <AlertCircle className="animate-pulse" />}
              <span className="font-bold">{classification.status}</span>
            </div>
            <div className="mt-2">
              Severity: {classification.severity}
            </div>
          </div>
          
            <div className="flex justify-between">
                <span>Heart Rate:</span>
                <span>{vitalSigns.heartRate} BPM</span>
              </div>
              <div className="flex justify-between">
                <span>Temperature:</span>
                <span>{vitalSigns.temperature} °F</span>
              </div>
              <div className="flex justify-between">
                <span>Blood Pressure:</span>
                <span>{vitalSigns.bloodPressure}</span>
              </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">ML Classification Confidence</h3>
            <div className="space-y-2">
              {Object.entries(confidenceScores).map(([label, score]) => (
                <div key={label}>
                  <div className="flex justify-between">
                    <span>{label}</span>
                    <span>{score.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-auto">
            <button 
              data-alert-button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={onAlertMedicalStaff || alertMedicalStaff}
              disabled={!selectedPatient}
            >
              <Bell className="animate-pulse" />
              <span>Alert Medical Staff</span>
            </button>
          </div>
        </div>
        
        {/* Right content: EEG + Spectrogram */}
        <div className="col-span-9 flex flex-col space-y-4">
          {/* EEG Chart */}
          <div className="bg-white rounded-lg shadow p-4 w-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">Real-time EEG Monitoring</h2>
                <span className="text-sm text-gray-500 block">
                  Data from: {selectedPatient ? `eeg/${selectedPatient.id}.npy` : 'No patient selected'}
                </span>
              </div>

              {selectedPatient && (
                <button
                  className="ml-4 px-3 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition"
                  onClick={() => fetchEEGFromNumpy(selectedPatient.id.toString())}
                >
                  Reload EEG Data
                </button>
              )}
            </div>
            
            <div className="h-64 w-full">
              {eegDataState.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-gray-500">
                  {selectedPatient ? 'Loading EEG data from numpy file...' : 'Select a patient to view EEG data'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={eegDataState}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} />
                      <Line
                        type="monotone"
                        dataKey="amplitude"
                        name="Amplitude"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="alpha"
                        name="Alpha"
                        stroke="#82ca9d"
                        strokeWidth={1}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="beta"
                        name="Beta"
                        stroke="#ffc658"
                        strokeWidth={1}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="gamma"
                        name="Gamma"
                        stroke="#ff7300"
                        strokeWidth={1}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}

              </div>
            </div>

          
          {/* Spectrogram */}
          <div className="bg-white rounded-lg shadow p-4 w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Real-time Spectrogram Monitoring</h2>
              <span className="text-sm text-gray-500">
                Data from: {selectedPatient ? `spec/${selectedPatient.id}.npy` : 'No patient selected'}
              </span>
            </div>
            <div className="h-64 w-full">
              {spectrogramData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-gray-500">
                  {selectedPatient ? 'Loading spectrogram data from numpy file...' : 'Select a patient to view spectrogram data'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spectrogramData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amplitude" name="Intensity" stroke="#e74c3c" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="alpha" name="Alpha Power" stroke="#27ae60" strokeWidth={1} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="beta" name="Beta Power" stroke="#f39c12" strokeWidth={1} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="gamma" name="Gamma Power" stroke="#9b59b6" strokeWidth={1} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="theta" name="Theta Power" stroke="#3498db" strokeWidth={1} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="delta" name="Delta Power" stroke="#34495e" strokeWidth={1} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}