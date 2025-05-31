import React, { useState, useEffect, useRef } from 'react';
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

type ColorMap = {
  [key: string]: string;
};

const classificationColors: ColorMap = {
  red: '#FF0000',
  green: '#00FF00',
  blue: '#0000FF',
  yellow: '#FFFF00',
  violet: '#800080',
  gray: '#808080',
};

const Reports: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substr(0, 10));
  const [reportType, setReportType] = useState('comprehensive');
  const [includeVitals, setIncludeVitals] = useState(true);
  const [includeGraph, setIncludeGraph] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isChartVisible, setIsChartVisible] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const patients: Patient[] = [
    { id: 1, name: 'John Doe', age: 45, room: 'ICU-4', patientId: 'PT-001' },
    { id: 2, name: 'Jane Smith', age: 32, room: 'ICU-2', patientId: 'PT-002' },
    { id: 3, name: 'Robert Johnson', age: 67, room: 'ICU-7', patientId: 'PT-003' },
  ];

  const classificationResults: Result[] = [
    { id: 1, status: 'Seizure', confidence: '87%', timestamp: '2025-04-12 10:15:23' },
    { id: 2, status: 'LPD', confidence: '92%', timestamp: '2025-04-12 14:22:45'},
    { id: 3, status: 'GPD', confidence: '95%', timestamp: '2025-04-13 08:30:12' },
    { id: 4, status: 'LRDA', confidence: '88%', timestamp: '2025-04-12 10:15:23'},
    { id: 5, status: 'GRDA', confidence: '90%', timestamp: '2025-04-12 14:22:45'},
    { id: 6, status: 'Others', confidence: '94%', timestamp: '2025-04-13 08:30:12'},
  ];

  // Trigger chart animation when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      setIsChartVisible(true);
    } else {
      setIsChartVisible(false);
    }
  }, [selectedPatient]);

  // Function to handle PDF export
  const handleExportPDF = () => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }
    const printFrame = document.createElement('iframe'); // Create a hidden iframe for PDF generation
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    document.body.appendChild(printFrame);
    const contentToPrint = printRef.current; // Get the content to print
    if (!contentToPrint) return;
    const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document; // Write the content to the iframe
    if (!frameDoc) return;
    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>EEG Report - ${selectedPatient.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 20px;
            }
            h1, h2, h3 {
              color: #2a3f5f;
              margin-top: 20px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .box {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .label {
              font-weight: bold;
              margin-right: 10px;
              color: #666;
            }
            .classification {
              display: inline-block;
              padding: 5px 10px;
              border-radius: 15px;
              font-weight: bold;
              font-size: 0.85em;
              background-color: #ffecb3;
              color: #856404;
            }
            .patient-info {
              display: grid;
              grid-template-columns: 120px 1fr;
              gap: 5px;
            }
            .chart-placeholder {
              height: 250px;
              background-color: #f8f9fa;
              border: 1px dashed #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 10px;
            }
            .notes {
              width: 100%;
              min-height: 150px;
              border: 1px solid #ddd;
              padding: 10px;
              border-radius: 5px;
            }
            @media print {
              body {
                margin: 0;
                padding: 15px;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="content">
            ${contentToPrint.innerHTML}
          </div>
          <script>
            setTimeout(() => {
              document.title = "EEG Report - ${selectedPatient.name}";
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `);
    frameDoc.close();

    
    printFrame.onload = () => {// Set up to save as PDF after the iframe loads
      try {
        
        const win = printFrame.contentWindow;// For PDF download, use the browser's print dialog with "Save as PDF" option
        if (win) {
          win.focus();
          win.print();
        }
        
        
        setTimeout(() => {// Wait for print dialog to close before removing the iframe
          document.body.removeChild(printFrame);
        }, 1000);
      } catch (error) {
        console.error('Error exporting PDF:', error);
        document.body.removeChild(printFrame);
      }
    };
  };

  
  const handlePrint = () => {// Function to handle printing
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }

    const printContent = document.createElement('div');
    printContent.innerHTML = printRef.current?.innerHTML || '';
    
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 20px;
        }
        h1, h2, h3 {
          color: #2a3f5f;
          margin-top: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        @media print {
          button {
            display: none;
          }
        }
      </style>
      <div style="padding: 20px;">
        ${printContent.innerHTML}
      </div>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleEmail = () => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }
    
    const subject = encodeURIComponent(`EEG Report for ${selectedPatient.name} - ${selectedDate}`);
    const body = encodeURIComponent(`Please find attached the EEG Monitoring Report for ${selectedPatient.name} (${selectedPatient.patientId}) dated ${selectedDate}.`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  Object.entries(classificationColors).forEach(([key, value]) => {
  document.documentElement.style.setProperty(`--${key}-700`, value);
  }); 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 animate-fade-in">
          EEG Report Generator
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            onClick={() => console.log('Back to Editor')}
          >
            <ChevronLeft size={16} />
            <span>Back to Editor</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            onClick={handleExportPDF}
          >
            <Download size={16} />
            <span>Export PDF</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            onClick={handlePrint}
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            onClick={handleEmail}
          >
            <Mail size={16} />
            <span>Email</span>
          </button>
        </div>

        {/* Report Configuration */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Report Configuration</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient
              </label>
              <select
                id="patient"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                value={selectedPatient?.id || ''}
                onChange={(e) =>
                  setSelectedPatient(patients.find((p) => p.id === parseInt(e.target.value)) as Patient)
                }
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.patientId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Report Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar size={16} className="text-gray-500" />
                </div>
                <input
                  type="date"
                  id="date"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg pl-10 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                id="report-type"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="comprehensive">Comprehensive Report</option>
                <option value="summary">Summary Report</option>
                <option value="technical">Technical Report</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="include-vitals"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 transition-all duration-200"
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
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 transition-all duration-200"
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
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 transition-all duration-200"
                  checked={includeMetrics}
                  onChange={(e) => setIncludeMetrics(e.target.checked)}
                />
                <label htmlFor="include-metrics" className="ml-2 text-sm text-gray-700">
                  Classification Metrics
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Doctor's Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                placeholder="Add any notes or observations..."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
              ></textarea>
            </div>
          </form>
        </div>

        {/* Historical EEG Classification Results */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 animate-fade-in">
            Historical EEG Classification Results
          </h2>
          {selectedPatient ? (
            <div className="space-y-6 animate-slide-up">
              <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Classification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classificationResults.map((result) => (
                      <tr
                        key={result.timestamp}
                        className="hover:bg-gray-50 transition-all duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              classificationColors[result.status] ||
                              'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {result.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.confidence}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">EEG Sample Preview</h3>
                <div
                  className={`h-64 transition-all duration-500 ${
                    isChartVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                >
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
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl shadow-lg animate-fade-in">
              <p className="text-gray-500">Select a patient to view historical data</p>
            </div>
          )}
        </div>

        {/* EEG Monitoring Report - This section will be used for printing/PDF export */}
        {selectedPatient && (
          <div ref={printRef} className="bg-white rounded-xl shadow-lg p-6 animate-slide-up">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">EEG Monitoring Report</h2>
                  <p className="text-gray-500">
                    Report Type:{' '}
                    {reportType === 'comprehensive'
                      ? 'Comprehensive Report'
                      : reportType === 'summary'
                      ? 'Summary Report'
                      : 'Technical Report'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    HMS - Harmful Brain Activity Classification
                  </p>
                  <p className="text-gray-500">Report Date: {selectedDate}</p>
                  <p className="text-gray-500">
                    Report ID: REP-{Math.floor(Math.random() * 10000)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Patient Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
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
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Vital Signs</h3>
                    <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
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
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Brain Activity Classification
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-gray-500">Latest Classification:</p>
                        <div className="mt-1">
                          <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            GRDA
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Model Confidence:</p>
                        <p className="text-xl font-bold">94%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Detection Time:</p>
                        <p className="font-medium">2025-04-12 14:22:45</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Classification Details:</p>
                      <p className="text-gray-600 mt-1">
                        The patient's EEG shows characteristics consistent with focal seizure
                        activity. The seizure originates from the temporal lobe and exhibits
                        typical rhythmic theta activity followed by spike-wave discharges.
                      </p>
                    </div>
                  </div>
                </div>

                {includeGraph && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">EEG Visualization</h3>
                    <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
                      <div
                        className={`h-64 transition-all duration-500 ${
                          isChartVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={eegData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="time"
                              label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis
                              label={{
                                value: 'Amplitude (µV)',
                                angle: -90,
                                position: 'insideLeft',
                              }}
                            />
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
                        The highlighted section (60-80s) shows the onset of focal seizure activity
                        with characteristic changes in amplitude and frequency.
                      </p>
                    </div>
                  </div>
                )}

                {includeMetrics && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      Classification Metrics
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
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
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Model Performance</h3>
                    <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
                      <p className="font-medium">Accuracy: 94%</p>
                      <p className="font-medium">F1 Score: 0.93</p>
                      <p className="font-medium">Area Under the ROC Curve (AUC): 0.97</p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Doctor's Notes</h2>
                <div className="bg-gray-50 p-4 rounded-lg min-h-32 border border-gray-200">
                  {doctorNotes || "No doctor's notes provided."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;