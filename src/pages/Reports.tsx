import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Printer, Mail, ChevronLeft, Calendar } from 'lucide-react';

// Mock data for EEG visualization
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

const eegData = generateEEGData();

interface Patient {
  id: number;
  name: string;
  age: number;
  room: string;
  patientId: string;
}

interface Result {
  id: number;
  status: string;
  confidence: string;
  timestamp: string;
}

const Reports: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substr(0, 10));
  const [reportType, setReportType] = useState('comprehensive');
  const [includeVitals, setIncludeVitals] = useState(true);
  const [includeGraph, setIncludeGraph] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [doctorNotes, setDoctorNotes] = useState('');

  const patients: Patient[] = [
    { id: 1, name: 'John Doe', age: 45, room: 'ICU-4', patientId: 'PT-001' },
    { id: 2, name: 'Jane Smith', age: 32, room: 'ICU-2', patientId: 'PT-002' },
    { id: 3, name: 'Robert Johnson', age: 67, room: 'ICU-7', patientId: 'PT-003' }
  ];

  const classificationResults: Result[] = [
    { id: 1, status: "Normal", confidence: "87%", timestamp: "2025-04-12 10:15:23" },
    { id: 2, status: "Focal Seizure", confidence: "92%", timestamp: "2025-04-12 14:22:45" },
    { id: 3, status: "Normal", confidence: "89%", timestamp: "2025-04-13 08:30:12" }
  ];

  /**const handleGenerateReport = () => {
    console.log('Generating report...');
  }; */

  const handleExportPDF = () => {
    console.log('Exporting PDF report...');
  };

  const handlePrint = () => {
    console.log('Printing report...');
  };

  const handleEmail = () => {
    console.log('Opening email dialog...');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">EEG Report Generator</h1>

      <div className="mb-6">
        <button 
          className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
          onClick={() => console.log('Back to Editor')}
        >
          <ChevronLeft size={16} />
          <span>Back to Editor</span>
        </button>
        <button 
          className="bg-green-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2 ml-2"
          onClick={handleExportPDF}
        >
          <Download size={16} />
          <span>Export PDF</span>
        </button>
        <button 
          className="bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center space-x-2 ml-2"
          onClick={handlePrint}
        >
          <Printer size={16} />
          <span>Print</span>
        </button>
        <button 
          className="bg-purple-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2 ml-2"
          onClick={handleEmail}
        >
          <Mail size={16} />
          <span>Email</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Report Configuration</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">
              Select Patient
            </label>
            <select
              id="patient"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
              value={selectedPatient?.id || ''}
              onChange={(e) => setSelectedPatient(patients.find(p => p.id === parseInt(e.target.value)) as Patient)}
            >
              <option value="">Select a patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.patientId}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Report Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar size={16} className="text-gray-500" />
              </div>
              <input
                type="date"
                id="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full pl-10 p-2.5"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              id="report-type"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="comprehensive">Comprehensive Report</option>
              <option value="summary">Summary Report</option>
              <option value="technical">Technical Report</option>
            </select>
          </div>

          <div className="mb-4 space-y-2">
            <div className="flex items-center">
              <input
                id="include-vitals"
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                checked={includeVitals}
                onChange={(e) => setIncludeVitals(e.target.checked)}
              />
              <label htmlFor="include-vitals" className="ml-2 text-sm text-gray-700">
                Patient Vitals
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="include-graph"
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                checked={includeGraph}
                onChange={(e) => setIncludeGraph(e.target.checked)}
              />
              <label htmlFor="include-graph" className="ml-2 text-sm text-gray-700">
                EEG Visualization
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="include-metrics"
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                checked={includeMetrics}
                onChange={(e) => setIncludeMetrics(e.target.checked)}
              />
              <label htmlFor="include-metrics" className="ml-2 text-sm text-gray-700">
                Classification Metrics
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Doctor's Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              className="block p-2.5 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes or observations..."
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
            ></textarea>
          </div>
        </form>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Historical EEG Classification Results</h2>
        {selectedPatient ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classification
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classificationResults.map((result) => (
                    <tr key={result.timestamp}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          result.status === 'Normal' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.confidence}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">EEG Sample Preview</h3>
              <div className="h-64">
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
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Select a patient to view historical data</p>
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold">EEG Monitoring Report</h2>
                <p className="text-gray-500">Report Type: {reportType === 'comprehensive' ? 'Comprehensive Report' : reportType === 'summary' ? 'Summary Report' : 'Technical Report'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">HMS - Harmful Brain Activity Classification</p>
                <p className="text-gray-500">Report Date: {selectedDate}</p>
                <p className="text-gray-500">Report ID: REP-{Math.floor(Math.random() * 10000)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Patient Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-y-2">
                    <div className="text-gray-500">Patient Name:</div>
                    <div className="font-medium">{selectedPatient.name}</div>
                    <div className="text-gray-500">Patient ID:</div>
                    <div className="font-medium">{selectedPatient.patientId}</div>
                    <div className="text-gray-500">Age:</div>
                    <div className="font-medium">{selectedPatient.age}</div>
                    <div className="text-gray-500">Room:</div>
                    <div className="font-medium">{selectedPatient.room}</div>
                  </div>
                </div>
              </div>

              {includeVitals && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Vital Signs</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-y-2">
                      <div className="text-gray-500">Heart Rate:</div>
                      <div className="font-medium">72 BPM</div>
                      <div className="text-gray-500">Blood Pressure:</div>
                      <div className="font-medium">120/80 mmHg</div>
                      <div className="text-gray-500">Temperature:</div>
                      <div className="font-medium">98.6°F</div>
                      <div className="text-gray-500">Respiration:</div>
                      <div className="font-medium">16 breaths/min</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium mb-2">Brain Activity Classification</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-gray-500">Latest Classification:</p>
                      <div className="mt-1">
                        <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Focal Seizure
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Model Confidence:</p>
                      <p className="text-xl font-bold">92%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Detection Time:</p>
                      <p className="font-medium">2025-04-12 14:22:45</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium">Classification Details:</p>
                    <p className="text-gray-600 mt-1">
                      The patient's EEG shows characteristics consistent with focal seizure activity. The seizure originates from the temporal lobe and exhibits typical rhythmic theta activity followed by spike-wave discharges.
                    </p>
                  </div>
                </div>
              </div>

              {includeGraph && (
                <div>
                  <h3 className="text-lg font-medium mb-2">EEG Visualization</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={eegData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                          <YAxis label={{ value: 'Amplitude (µV)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="amplitude" 
                            stroke="#8884d8" 
                            strokeWidth={2} 
                            dot={false} 
                            name="EEG Signal"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="alpha" 
                            stroke="#82ca9d" 
                            strokeWidth={1} 
                            dot={false} 
                            name="Alpha Band"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="beta" 
                            stroke="#ffc658" 
                            strokeWidth={1} 
                            dot={false} 
                            name="Beta Band"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      The highlighted section (60-80s) shows the onset of focal seizure activity with characteristic changes in amplitude and frequency.
                    </p>
                  </div>
                </div>
              )}

        {includeMetrics && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Classification Metrics</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-y-2">
                      <div className="text-gray-500">Sensitivity:</div>
                      <div className="font-medium">95%</div>
                      <div className="text-gray-500">Specificity:</div>
                      <div className="font-medium">98%</div>
                      <div className="text-gray-500">Positive Predictive Value (PPV):</div>
                      <div className="font-medium">92%</div>
                      <div className="text-gray-500">Negative Predictive Value (NPV):</div>
                      <div className="font-medium">96%</div>
                    </div>
                  </div>
                </div>
              )}

              {includeMetrics && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Model Performance</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">Accuracy: 94%</p>
                    <p className="font-medium">F1 Score: 0.93</p>
                    <p className="font-medium">Area Under the ROC Curve (AUC): 0.97</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Doctor's Notes</h2>
              <textarea
                id="doctorNotes"
                rows={10}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional notes or observations..."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
        ) : null
      </div>  )};
    </div> 
)}; 

export default Reports ;