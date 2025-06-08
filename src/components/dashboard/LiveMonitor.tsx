import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, Activity, AlertCircle, AlertTriangle } from 'lucide-react';
import { API_BASE_URL, WS_BASE_URL } from '../../utils/constants';
import { processEEGData, ProcessedEEGPoint } from '../../utils/dataProcessing';
import PatientSelector from './PatientSelector';
import { Patient, LiveMonitorProps } from '../../utils/types';
import emergency from "../../context/emergency.mp3";
import { useClerk } from '@clerk/clerk-react';
import Plot from 'react-plotly.js';

// Classification result options
const classificationResults = [
  { id: 0, status: "Seizure", color: "bg-red-500", severity: "Critical" },
  { id: 1, status: "LPD", color: "bg-orange-500", severity: "High" },
  { id: 2, status: "GPD", color: "bg-yellow-500", severity: "Medium" },
  { id: 3, status: "LRDA", color: "bg-green-500", severity: "Medium" },
  { id: 4, status: "GRDA", color: "bg-blue-500", severity: "Critical" },
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
  const [spectrogramImages, setSpectrogramImages] = useState<Record<string, number[][]>>({});
  const [confidenceScores, setConfidenceScores] = useState({
    Seizure: 0,
    LPD: 0,
    GPD: 0,
    LRDA: 0,
    GRDA: 0,
    Others: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setConfidenceScores((prevScores) => {
        // Generate random fluctuations for each class
        const newScores = { ...prevScores };
        let total = 0;

        Object.keys(newScores).forEach((key) => {
          const randomFluctuation = Math.random() * 10 - 5; // Random fluctuation between -5 and 5
          newScores[key] = Math.max(0, Math.min(100, newScores[key] + randomFluctuation)); // Clamp between 0 and 100
          total += newScores[key];
        });

        // Normalize scores to ensure they sum to 100%
        Object.keys(newScores).forEach((key) => {
          newScores[key] = (newScores[key] / total) * 100;
        });

        return newScores;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    // Find the class with the highest confidence score
    const highestConfidenceClass = Object.entries(confidenceScores).reduce(
      (highest, [label, score]) => (score > highest.score ? { label, score } : highest),
      { label: "", score: 0 }
    );

    // Match the highest confidence class with the classification results
    const matchedClass =
      classificationResults.find((c) => c.status === highestConfidenceClass.label) || classificationResults[5];

    setClassification(matchedClass);
  }, [confidenceScores]);

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

  const EEG_CHANNELS = [
  "Fp1", "Fp2", "Fz", "Cz", "Pz", "F3", "F4", "F7", "F8",
  "C3", "C4", "P3", "P4", "T3", "T4", "T5", "T6", "O1", "O2"
];

const fetchEEGFromNumpy = async (patientId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/eeg/data/${patientId}/`);
    if (!response.ok) throw new Error('Failed to fetch EEG numpy data');

    const data = await response.json();
    const processedData: ProcessedEEGPoint[] = data.eeg_data.map((point: any, index: number) => {
      const eegPoint: ProcessedEEGPoint = { time: index };

      EEG_CHANNELS.forEach(channel => {
        eegPoint[channel] = point[channel] ?? 0;
      });

      return eegPoint;
    });

    setFullEEGBuffer(processedData);
    setPointer(0);
    setEEGData(processedData.slice(0, 50));
  } catch (error) {
    console.error('Error fetching EEG numpy data:', error);
  }
};
useEffect(() => {
  if (!fullEEGBuffer.length) return;
  if (!isLive) return;

  const interval = setInterval(() => {
    setPointer(prev => {
      // Stop when the window reaches the end of the buffer
      if (prev + 50 >= fullEEGBuffer.length) {
        // Show the last window and stop updating
        setEEGData(fullEEGBuffer.slice(fullEEGBuffer.length - 50, fullEEGBuffer.length));
        clearInterval(interval);
        return prev;
      }
      setEEGData(fullEEGBuffer.slice(prev + 1, prev + 51));
      return prev + 1;
    });
  }, 200);

  return () => clearInterval(interval);
}, [fullEEGBuffer, isLive]);

  // Fetch Spectrogram data from numpy files
const fetchSpectrogramFromNumpy = async (patientId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/eeg/spec/${patientId}/`);
    if (!response.ok) throw new Error("Failed to fetch spectrogram data");

    const data = await response.json();
    if (data.spectrograms) {
      setSpectrogramImages(data.spectrograms); // Dictionary of { LL: [], LP: [], RP: [], RR: [] }
    }
  } catch (error) {
    console.error("Error fetching spectrogram data:", error);
  }
};

const renderSpectrogramHeatmap = (label: string, matrix: number[][]) => (
  <div className="w-full md:w-1/2 p-2 overflow-hidden" key={label}>
    <h3 className="text-lg font-semibold mb-1 text-center">{label} Spectrogram</h3>
    <div className="h-64 w-full overflow-hidden rounded border">
      <Plot
        data={[
          {
            z: matrix,
            type: 'heatmap',
            colorscale: 'Jet', // or 'Viridis', 'Jet', etc.
            showscale: true,
          }
        ]}
        layout={{
          margin: { l: 30, r: 30, b: 30, t: 30 },
          autosize: true,
          xaxis: {
            showgrid: false,
            zeroline: false,
            visible: true,
          },
          yaxis: {
            showgrid: false,
            zeroline: false,
            visible: true,
          },
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ responsive: true, displayModeBar: false }}
      />
    </div>
  </div>
);
// const renderSpectrogramHeatmap = (label: string, matrix: number[][]) => (
//   <div className="w-full md:w-1/2 p-2" key={label}>
//     <h3 className="text-lg font-semibold mb-1 text-center">{label} Spectrogram</h3>
//     <div className="border rounded">
//       <Plot
//         data={[
//           {
//             z: matrix,
//             type: 'heatmap',
//             colorscale: 'Jet',
//             zmin: 0,
//             zmax: 1,
//             showscale: true
//           }
//         ]}
//         layout={{
//           width: '300',
//           height: 300,
//           margin: { t: 30, l: 30, r: 30, b: 30 },
//           title: `${label} Heatmap`,
//         }}
//         config={{ displayModeBar: false }}
//       />
//     </div>
//   </div>
// );
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
      setVitalSigns({
        heartRate: selectedPatient.vital_signs?.heart_rate ?? "--",
        temperature: selectedPatient.vital_signs?.temperature ?? "--",
        bloodPressure: selectedPatient.vital_signs?.blood_pressure ?? "--"
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
        setEEGData((prev) => [...prev, ...processedData]);
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
      <div className="mt-2">Severity: {classification.severity}</div>
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
                className={`h-2.5 rounded-full ${
                  label === "Seizure"
                    ? "bg-red-500"
                    : label === "LPD"
                    ? "bg-orange-500"
                    : label === "GPD"
                    ? "bg-yellow-500"
                    : label === "LRDA"
                    ? "bg-green-500"
                    : label === "GRDA"
                    ? "bg-blue-500"
                    : "bg-gray-400"
                }`}
                style={{ width: `${score.toFixed(1)}%` }}
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
                    {[
                      { key: 'Fp1', color: '#8884d8' },
                      { key: 'Fp2', color: '#82ca9d' },
                      { key: 'Fz', color: '#ffc658' },
                      { key: 'Cz', color: '#ff7300' },
                      { key: 'Pz', color: '#00C49F' },
                      { key: 'F3', color: '#0088FE' },
                      { key: 'F4', color: '#FFBB28' },
                      { key: 'F7', color: '#FF8042' },
                      { key: 'F8', color: '#8B008B' },
                      { key: 'C3', color: '#FF6347' },
                      { key: 'C4', color: '#7B68EE' },
                      { key: 'P3', color: '#20B2AA' },
                      { key: 'P4', color: '#DAA520' },
                      { key: 'T3', color: '#3CB371' },
                      { key: 'T4', color: '#DC143C' },
                      { key: 'T5', color: '#008B8B' },
                      { key: 'T6', color: '#CD5C5C' },
                      { key: 'O1', color: '#4169E1' },
                      { key: 'O2', color: '#2E8B57' },
                    ].map(({ key, color }) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={color}
                        strokeWidth={1}
                        dot={false}
                        isAnimationActive={false}
                      />
                    ))}
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

            {spectrogramImages && Object.keys(spectrogramImages).length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(spectrogramImages).map(([label, data]) =>
                  renderSpectrogramHeatmap(label, data)
                )}
              </div>
            ) : (
              <div className="col-span-2 h-64 flex items-center justify-center text-gray-500">
                {selectedPatient ? 'Loading spectrograms...' : 'Select a patient to view spectrograms'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}