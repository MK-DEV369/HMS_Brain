import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, Activity, User, AlertCircle, AlertTriangle } from 'lucide-react';
import { API_BASE_URL, WS_BASE_URL } from '../../utils/constants';
import { processEEGData, calculateFrequencyBands, ProcessedEEGPoint } from '../../utils/dataProcessing';
import { useUser } from '../../context/UserContext';
import PatientSelector from './PatientSelector';
import { Patient, LiveMonitorProps } from '../../utils/types';
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

export default function LiveMonitor({eegData}: LiveMonitorProps) {
  const [patients, setPatients] = useState([]);
  const [classification, setClassification] = useState(classificationResults[0]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eegDataState, setEEGData] = useState<ProcessedEEGPoint[]>([]);
  const [confidenceScores, setConfidenceScores] = useState({
    Seizure: 0,
    LPD: 0,
    GPD: 0,
    LRDA: 0,
    GRDA: 0,
    Others: 0,
  });
  const [vitalSigns, setVitalSigns] = useState({
    heartRate: "--",
    temperature: "--",
    bloodPressure: "--"
  });
  
  const socketRef = useRef<WebSocket | null>(null);
  const { currentUser } = useUser();
  
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

  // Fetch available patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/eeg/patients/`);
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        const data = await response.json();
        console.log('Fetched patients:', data); // Debugging
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
  
  // Fetch patient details when selected patient changes
  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!selectedPatient) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/eeg/patients/${selectedPatient.id}/`);
        if (!response.ok) {
          throw new Error('Failed to fetch patient details');
        }
        const data = await response.json();
        setVitalSigns({
          heartRate: data.vital_signs?.heart_rate || "--",
          temperature: data.vital_signs?.temperature || "--",
          bloodPressure: data.vital_signs?.blood_pressure || "--"
        });
      } catch (err) {
        console.error('Error fetching patient details:', err);
      }
    };
    
    fetchPatientDetails();
  }, [selectedPatient]);
  
useEffect(() => {
  if (!selectedPatient || !isLive) return;

  const wsUrl = `${WS_BASE_URL}/ws/eeg/${selectedPatient.id}/`;
  socketRef.current = new WebSocket(wsUrl);

  socketRef.current.onopen = () => {
    console.log("WebSocket connected");
    setIsConnected(true);
    setError(null);
  };

  socketRef.current.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "eeg_data") {
      const processedData = processEEGData(message.data);
      setEEGData((prevData) => [...prevData, ...processedData].slice(-100));
    } else if (message.type === "classification") {
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
  } else if (message.type === "vital_signs") {
      setVitalSigns({
        heartRate: message.data?.heart_rate ?? "--",
        temperature: message.data?.temperature ?? "--",
        bloodPressure: message.data?.blood_pressure ?? "--"
      });
    }
  };

  socketRef.current.onerror = (e) => {
    console.error("WebSocket error:", e);
    setIsConnected(false);
  };

  socketRef.current.onclose = () => {
    console.log("WebSocket closed");
    setIsConnected(false);
  };

  return () => {
    socketRef.current?.close();
  };
}, [selectedPatient, isLive]);

  
  // Handle live toggle
  const toggleLiveMode = () => {
    const newLiveState = !isLive;
    setIsLive(newLiveState);
    
    if (!newLiveState && socketRef.current) {
      // Close connection when pausing
      socketRef.current.close();
      setIsConnected(false);
    }
  };
  
  // Send alert to medical staff
  const alertMedicalStaff = async () => {
    if (!selectedPatient) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/eeg/alerts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          patient_id: selectedPatient,
          alert_type: classification.id,
          message: `Alert: ${classification.status} detected for patient`,
          severity: classification.severity
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send alert');
      }
      
      // Show success indicator (could add a toast notification here)
      alert('Alert sent successfully');
      console.log('Alert sent successfully');
    } catch (err) {
      console.error('Failed to send alert. Please try again. Error sending alert:', err);
    }
  };
  
  // Calculate frequency bands for visualization
  const frequencyData = calculateFrequencyBands(eegDataState.slice(-20));

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
      <div className="grid grid-cols-4 gap-4 h-full">
        {/* Left sidebar with status */}
        <div className="col-span-1 bg-gray-50 rounded-lg p-4 flex flex-col space-y-4">
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
          
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <span>Heart Rate:</span>
              <span>{vitalSigns.heartRate} BPM</span>
            </div>
            <div className="flex justify-between">
              <span>Temperature:</span>
              <span>{vitalSigns.temperature}°F</span>
            </div>
            <div className="flex justify-between">
              <span>Blood Pressure:</span>
              <span>{vitalSigns.bloodPressure}</span>
            </div>
          </div>
          
          <div className="mt-auto">
            <button 
              className="w-full bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center space-x-2"
              onClick={alertMedicalStaff}
              disabled={!selectedPatient || !isConnected}
            >
              <Bell />
              <span>Alert Medical Staff</span>
            </button>
          </div>
        </div>
        
        {/* Main EEG Display */}
        <div className="col-span-3 bg-white rounded-lg p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Real-time EEG Monitoring</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-200 rounded-lg text-sm">1 min</button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm">5 min</button>
              <button className="px-3 py-1 bg-gray-200 rounded-lg text-sm">15 min</button>
            </div>
          </div>
          
          <div className="h-64 w-full">
            {eegDataState.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                {isConnected ? 'Waiting for EEG data...' : 'Connect to patient to view EEG data'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={eegDataState}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amplitude" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                    dot={false} 
                    isAnimationActive={false} // Disable animation for real-time data
                  />
                  <Line 
                    type="monotone" 
                    dataKey="alpha" 
                    stroke="#82ca9d" 
                    strokeWidth={1} 
                    dot={false} 
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="beta" 
                    stroke="#ffc658" 
                    strokeWidth={1} 
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Frequency Analysis</h3>
              <div className="h-32">
                {eegDataState.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={frequencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="frequency" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="power" 
                        stroke="#82ca9d" 
                        strokeWidth={2} 
                        dot={false} 
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

{/* <div>
                  <div className="flex justify-between">
                    <span>Seizure</span>
                    <span>{classification.id === 0 ? confidenceScores.seizure : "NA"} %</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${classification.id === 0 ? confidenceScores.seizure :'N'} %` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>LPD</span>
                    <span>{classification.id === 1 ? confidenceScores.lpd : "NA"} %</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className=" bg-purple-800 h-2.5 rounded-full" style={{ width: `${classification.id === 1 ? confidenceScores.lpd : 'N'} %` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>GPD</span>
                    <span>{classification.id === 2 ? confidenceScores.gpd : "NA"} %</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${classification.id === 2 ? confidenceScores.gpd : 'N'} %` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>LRDA</span>
                    <span>{classification.id === 3 ? confidenceScores.lrda : "NA"} %</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-orange-700 h-2.5 rounded-full" style={{ width: `${classification.id === 3 ? confidenceScores.lrda : 'N'} %` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>GRDA</span>
                    <span>{classification.id === 4 ? confidenceScores.grda : "NA"} %</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${classification.id === 4 ? confidenceScores.grda : 'N'} %` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>Others</span>
                    <span>{classification.id === 5 ? confidenceScores.others : "NA"} %</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-700 h-2.5 rounded-full" style={{ width: `${classification.id === 5 ? confidenceScores.others : 'N'} %` }}></div>
                  </div>
                </div> */}