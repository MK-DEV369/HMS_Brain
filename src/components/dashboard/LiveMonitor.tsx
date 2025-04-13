import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, Activity, User, AlertCircle } from 'lucide-react';

// Mock data - In production, this would come from your WebSocket
const generateEEGData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      time: i,
      amplitude: Math.sin(i * 0.1) * 10 + Math.random() * 5,
      alpha: Math.sin(i * 0.1) * 5 + Math.random() * 2,
      beta: Math.cos(i * 0.1) * 3 + Math.random() * 1.5,
    });
  }
  return data;
};

// Classification result options
const classificationResults = [
  { id: 1, status: "Normal", color: "bg-green-500", severity: "Low" },
  { id: 2, status: "Focal Seizure", color: "bg-yellow-500", severity: "Medium" },
  { id: 3, status: "General Seizure", color: "bg-red-500", severity: "High" },
  { id: 4, status: "Status Epilepticus", color: "bg-red-700", severity: "Critical" }
];

export default function LiveMonitor() {
  const [eegData, setEEGData] = useState(generateEEGData());
  const [classification, setClassification] = useState(classificationResults[0]);
  const [selectedPatient, setSelectedPatient] = useState("Patient-001");
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  // Simulate real-time data updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      // Shift data and add new point
      const newData = [...eegData.slice(1)];
      const lastTime = eegData[eegData.length - 1].time;
      newData.push({
        time: lastTime + 1,
        amplitude: Math.sin(lastTime * 0.1) * 10 + Math.random() * 5,
        alpha: Math.sin(lastTime * 0.1) * 5 + Math.random() * 2,
        beta: Math.cos(lastTime * 0.1) * 3 + Math.random() * 1.5,
      });
      setEEGData(newData);
      
      // Randomly update classification every 10 seconds
      if (Math.random() < 0.1) {
        const randomIndex = Math.floor(Math.random() * classificationResults.length);
        setClassification(classificationResults[randomIndex]);
      }
      
      // Update clock
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [eegData, isLive]);

  const patients = [
    { id: "Patient-001", name: "John Doe", age: 45, room: "ICU-4" },
    { id: "Patient-002", name: "Jane Smith", age: 32, room: "ICU-2" },
    { id: "Patient-003", name: "Robert Johnson", age: 67, room: "ICU-7" }
  ];

  return (
    <div className="flex flex-col space-y-4 p-6 h-full">
      {/* Header with patient selector and time */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="text-blue-500" />
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.room}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Age: 45</span>
            <span className="text-sm text-gray-500">ID: {selectedPatient}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-lg font-bold">{currentTime}</div>
          <button
            className={`px-4 py-2 rounded-lg ${isLive ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? 'LIVE' : 'PAUSED'}
          </button>
        </div>
      </div>
      
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
              <span>72 BPM</span>
            </div>
            <div className="flex justify-between">
              <span>Temperature:</span>
              <span>98.6°F</span>
            </div>
            <div className="flex justify-between">
              <span>Blood Pressure:</span>
              <span>120/80</span>
            </div>
          </div>
          
          <div className="mt-auto">
            <button className="w-full bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center space-x-2">
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={eegData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amplitude" 
                  stroke="#8884d8" 
                  strokeWidth={2} 
                  dot={false} 
                />
                <Line 
                  type="monotone" 
                  dataKey="alpha" 
                  stroke="#82ca9d" 
                  strokeWidth={1} 
                  dot={false} 
                />
                <Line 
                  type="monotone" 
                  dataKey="beta" 
                  stroke="#ffc658" 
                  strokeWidth={1} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Frequency Analysis</h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eegData.slice(0, 20)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Line 
                      type="monotone" 
                      dataKey="alpha" 
                      stroke="#82ca9d" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">ML Classification Confidence</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between">
                    <span>Normal</span>
                    <span>{classification.id === 1 ? '87%' : '12%'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: classification.id === 1 ? '87%' : '12%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>Focal Seizure</span>
                    <span>{classification.id === 2 ? '76%' : '5%'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: classification.id === 2 ? '76%' : '5%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>General Seizure</span>
                    <span>{classification.id === 3 ? '91%' : '2%'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: classification.id === 3 ? '91%' : '2%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>Status Epilepticus</span>
                    <span>{classification.id === 4 ? '95%' : '1%'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-700 h-2.5 rounded-full" style={{ width: classification.id === 4 ? '95%' : '1%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * import React, { useState, useEffect } from 'react';
import { AlertCircle, User } from 'lucide-react';
import EEGGraph from '../common/EEGGraph';
import AlertPanel from './AlertPanel';
import PatientSelector from './PatientSelector';
import StatusIndicator from './StatusIndicator';

// Mock patient data
const mockPatients = [
  { id: '1', name: 'John Doe', age: 45, room: '101A', status: 'stable' as const },
  { id: '2', name: 'Jane Smith', age: 32, room: '102B', status: 'warning' as const },
  { id: '3', name: 'Bob Johnson', age: 58, room: '103A', status: 'critical' as const },
];

// Mock alerts
const mockAlerts = [
  {
    id: '1',
    type: 'warning' as const,
    message: 'Unusual alpha wave pattern detected',
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'critical' as const,
    message: 'High amplitude spike detected',
    timestamp: new Date(),
  },
];

// Simulated EEG data generation
const generateEEGData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      timestamp: i,
      value: Math.sin(i * 0.1) * 10 + Math.random() * 5,
      channel: 'EEG1',
    });
  }
  return data;
};

const LiveMonitor: React.FC = () => {
  const [eegData, setEEGData] = useState(generateEEGData());
  const [status, setStatus] = useState<'normal' | 'warning' | 'critical'>('normal');
  const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);
  const [alerts, setAlerts] = useState(mockAlerts);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEEGData((prevData) => {
        const newData = [...prevData.slice(1)];
        newData.push({
          timestamp: prevData[prevData.length - 1].timestamp + 1,
          value: Math.sin(prevData[prevData.length - 1].timestamp * 0.1) * 10 + Math.random() * 5,
          channel: 'EEG1',
        });
        
        // Randomly change status for demo
        if (Math.random() > 0.95) {
          const newStatus = Math.random() > 0.5 ? 'warning' : 'normal';
          setStatus(newStatus);
          if (newStatus === 'warning') {
            setAlerts((prev) => [
              {
                id: Date.now().toString(),
                type: 'warning',
                message: 'Abnormal pattern detected',
                timestamp: new Date(),
              },
              ...prev,
            ]);
          }
        }
        
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="w-64">
          <PatientSelector
            patients={mockPatients}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
          />
        </div>
        <StatusIndicator
          status={status}
          details={{
            value: 45,
            threshold: 50,
            unit: 'μV',
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg">
            <h3 className="text-lg font-medium mb-4">Live EEG Monitor</h3>
            <div className="h-[400px]">
              <EEGGraph
                data={eegData}
                height={400}
                channels={['EEG1']}
                isLive={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <MetricCard title="Signal Quality" value="98%" />
            <MetricCard title="Sample Rate" value="256 Hz" />
            <MetricCard
              title="Classification"
              value={status === 'normal' ? 'Normal' : 'Abnormal'}
            />
          </div>
        </div>

        <div>
          <AlertPanel alerts={alerts} onDismiss={handleDismissAlert} />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
  </div>
);

export default LiveMonitor;


 */