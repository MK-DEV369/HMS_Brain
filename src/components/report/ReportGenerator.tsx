import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Printer, Mail, FilePlus, ChevronLeft, Calendar } from 'lucide-react';

type Patient = {
  id: number;
  name: string;
  age: number;
  room: string;
  patientId: string;
};

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

export default function ReportGenerator() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substr(0, 10));
  const [reportType, setReportType] = useState('comprehensive');
  const [includeVitals, setIncludeVitals] = useState(true);
  const [includeGraph, setIncludeGraph] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Mock patient data
  const patients = [
    { id: 1, name: 'John Doe', age: 45, room: 'ICU-4', patientId: 'PT-001' },
    { id: 2, name: 'Jane Smith', age: 32, room: 'ICU-2', patientId: 'PT-002' },
    { id: 3, name: 'Robert Johnson', age: 67, room: 'ICU-7', patientId: 'PT-003' }
  ];

  // Mock results data
  const classificationResults = [
    { id: 1, status: "Normal", confidence: "87%", timestamp: "2025-04-12 10:15:23" },
    { id: 2, status: "Focal Seizure", confidence: "92%", timestamp: "2025-04-12 14:22:45" },
    { id: 3, status: "Normal", confidence: "89%", timestamp: "2025-04-13 08:30:12" }
  ];

  const handleGenerateReport = () => {
    setIsPreviewMode(true);
    // In a real app, this would trigger the report generation
  };

  const handleExportPDF = () => {
    alert('Exporting PDF report...');
    // In a real app, this would trigger a PDF export
  };

  const handlePrint = () => {
    alert('Printing report...');
    // In a real app, this would trigger the print dialog
  };

  const handleEmail = () => {
    alert('Opening email dialog...');
    // In a real app, this would open an email dialog
  };

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">EEG Report Generator</h1>
        <div className="flex space-x-2">
          {isPreviewMode ? (
            <>
              <button 
                className="bg-gray-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
                onClick={() => setIsPreviewMode(false)}
              >
                <ChevronLeft size={16} />
                <span>Back to Editor</span>
              </button>
              <button 
                className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
                onClick={handleExportPDF}
              >
                <Download size={16} />
                <span>Export PDF</span>
              </button>
              <button 
                className="bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
                onClick={handlePrint}
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
              <button 
                className="bg-green-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
                onClick={handleEmail}
              >
                <Mail size={16} />
                <span>Email</span>
              </button>
            </>
          ) : (
            <button 
              className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
              onClick={handleGenerateReport}
              disabled={!selectedPatient}
            >
              <FilePlus size={16} />
              <span>Generate Report</span>
            </button>
          )}
        </div>
      </div>
      
      {!isPreviewMode ? (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Report Configuration</h2>
            <div className="space-y-4">
              <div>
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
              
              <div>
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
              
              <div>
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
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Include Sections
                </label>
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
              
              <div>
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
            </div>
          </div>
          
          <div className="col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Historical EEG Classification Results</h2>
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
        </div>
      ) : (
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
          
          {selectedPatient && (
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
              </div>
              
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
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                        <div className="text-gray-500 text-sm">Seizure Duration</div>
                        <div className="text-xl font-bold text-blue-600">47 sec</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                        <div className="text-gray-500 text-sm">Seizure Intensity</div>
                        <div className="text-xl font-bold text-yellow-600">Medium</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                        <div className="text-gray-500 text-sm">Sleep Quality</div>
                        <div className="text-xl font-bold text-red-600">Poor</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                        <div className="text-gray-500 text-sm">Recovery Time</div>
                        <div className="text-xl font-bold text-green-600">2 min</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-medium">Additional Metrics:</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delta Wave Power:</span>
                          <span>2.4 µV²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Theta Wave Power:</span>
                          <span>5.7 µV²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Alpha Wave Power:</span>
                          <span>1.2 µV²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Beta Wave Power:</span>
                          <span>0.8 µV²</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-2">Assessment & Recommendations</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">
                    Based on the EEG analysis and ML classification, the patient is experiencing focal seizures originating from the temporal lobe. The pattern is consistent with complex partial seizures with secondary generalization. Recommend adjustment of current anti-epileptic medication and continuous EEG monitoring for the next 24 hours.
                  </p>
                  {doctorNotes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium">Doctor's Notes:</p>
                      <p className="text-gray-600 mt-1">{doctorNotes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Report generated by HMS Harmful Brain Activity Classification System</p>
                    <p className="text-sm text-gray-500">Model version: v2.5.3</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Attending Physician: Dr. Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Contact: sjohnson@hms.medical.org</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}