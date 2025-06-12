import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Printer, Mail, ChevronLeft, Calendar } from 'lucide-react';
import { Patient } from '../utils/types';
import { ProcessedEEGPoint } from '../utils/dataProcessing';
import { API_BASE_URL } from '../utils/constants';
import Plot from 'react-plotly.js';

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
  const [patients, setPatients] = useState([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [eegDataState, setEEGData] = useState<ProcessedEEGPoint[]>([]);
  const [fullEEGBuffer, setFullEEGBuffer] = useState<ProcessedEEGPoint[]>([]);
  const [pointer, setPointer] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substr(0, 10));
  const [reportType, setReportType] = useState('comprehensive');
  const [includeVitals, setIncludeVitals] = useState(true);
  const [includeGraph, setIncludeGraph] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isChartVisible, setIsChartVisible] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [spectrogramImages, setSpectrogramImages] = useState<Record<string, number[][]>>({});
  const [vitalSigns, setVitalSigns] = useState<{
  heartRate: number | string;
  temperature: number | string;
  bloodPressure: string;
  }>({
    heartRate: "--",
    temperature: "--",
    bloodPressure: "--",
  });

  // const classificationResults: Result[] = [
  //   { id: 1, status: 'Seizure', confidence: '87%', timestamp: '2025-04-12 10:15:23' },
  //   { id: 2, status: 'LPD', confidence: '92%', timestamp: '2025-04-12 14:22:45'},
  //   { id: 3, status: 'GPD', confidence: '95%', timestamp: '2025-04-13 08:30:12' },
  //   { id: 4, status: 'LRDA', confidence: '88%', timestamp: '2025-04-12 10:15:23'},
  //   { id: 5, status: 'GRDA', confidence: '90%', timestamp: '2025-04-12 14:22:45'},
  //   { id: 6, status: 'Others', confidence: '94%', timestamp: '2025-04-13 08:30:12'},
  // ];

  // Trigger chart animation when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      setIsChartVisible(true);
    } else {
      setIsChartVisible(false);
    }
  }, [selectedPatient]);

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
    setEEGData(processedData);
  } catch (error) {
    console.error('Error fetching EEG numpy data:', error);
  }
};

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
  <div className="w-full md:w-1/2 p-2" key={label}>
    <h3 className="text-lg font-semibold mb-1 text-center">{label} Spectrogram</h3>
    <div className="border rounded">
      <Plot
        data={[
          {
            z: matrix,
            type: 'heatmap',
            colorscale: 'Jet',
            zmin: 0,
            zmax: 1,
            showscale: true
          }
        ]}
        layout={{
          width: '300',
          height: 300,
          margin: { t: 30, l: 30, r: 30, b: 30 },
          title: `${label} Heatmap`,
        }}
        config={{ displayModeBar: false }}
      />
    </div>
  </div>
);

  // Real-time data fetching from numpy files
  useEffect(() => {
    if (!selectedPatient) {
      return;
    }
    fetchEEGFromNumpy(selectedPatient.id.toString());
    fetchSpectrogramFromNumpy(selectedPatient.id.toString());

    return;
  }, [selectedPatient]);

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
// Function to filter content based on report type
const getFilteredContent = (reportType, contentToPrint) => {
  if (!contentToPrint) return '';
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = contentToPrint.innerHTML;
  
  if (reportType === 'technical') {
    // For technical report: Remove patient info, keep only model-related, diagrams, graphs
    
    // Remove patient information section
    const patientInfoSections = tempDiv.querySelectorAll('h3');
    patientInfoSections.forEach(heading => {
      if (heading.textContent?.includes('Patient Information') || 
          heading.textContent?.includes('Vital Signs')) {
        const parentDiv = heading.closest('div');
        if (parentDiv) {
          parentDiv.remove();
        }
      }
    });
    
    // Remove patient name and ID from header
    const headerElements = tempDiv.querySelectorAll('*');
    headerElements.forEach(element => {
      if (element.textContent && element.textContent.includes('EEG Report -')) {
        element.textContent = 'EEG Technical Report';
      }
    });
    
    // Remove doctor's notes for technical report
    const doctorNotesSection = tempDiv.querySelector('h2');
    if (doctorNotesSection && doctorNotesSection.textContent?.includes("Doctor's Notes")) {
      const parentDiv = doctorNotesSection.parentElement;
      if (parentDiv) {
        parentDiv.remove();
      }
    }
    
  } else if (reportType === 'summary') {
    // For summary report: Include key information but condensed
    // Keep patient info, vital signs, latest classification, but remove detailed graphs
    
    const detailedCharts = tempDiv.querySelectorAll('.h-64, .min-h-64');
    detailedCharts.forEach(chart => {
      const placeholder = document.createElement('div');
      placeholder.className = 'chart-placeholder';
      placeholder.innerHTML = '<p style="color: #666;">Chart visualization available in comprehensive report</p>';
      chart.replaceWith(placeholder);
    });
  }
  // For comprehensive report, keep everything as is
  
  return tempDiv.innerHTML;
};

// Function to handle PDF export
const handleExportPDF = () => {
  if (!selectedPatient) {
    alert('Please select a patient first');
    return;
  }
  
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'absolute';
  printFrame.style.top = '-9999px';
  printFrame.style.left = '-9999px';
  document.body.appendChild(printFrame);
  
  const contentToPrint = printRef.current;
  if (!contentToPrint) return;
  
  const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
  if (!frameDoc) return;
  
  // Get filtered content based on report type
  const filteredContent = getFilteredContent(reportType, contentToPrint);
  
  // Determine report title based on type
  let reportTitle = 'EEG Report';
  if (reportType === 'technical') {
    reportTitle = 'EEG Technical Analysis Report';
  } else if (reportType === 'summary') {
    reportTitle = `EEG Summary Report - ${selectedPatient.name}`;
  } else {
    reportTitle = `EEG Comprehensive Report - ${selectedPatient.name}`;
  }
  
  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle}</title>
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
            font-style: italic;
            color: #666;
          }
          .notes {
            width: 100%;
            min-height: 150px;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 5px;
          }
          .technical-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 10px;
          }
          .model-stats {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
          }
          @media print {
            body {
              margin: 0;
              padding: 15px;
            }
            button {
              display: none;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        ${reportType === 'technical' ? `
          <div class="technical-header">
            <h1>EEG Technical Analysis Report</h1>
            <p><strong>Analysis Date:</strong> ${selectedDate}</p>
            <p><strong>Report ID:</strong> TECH-${Math.floor(Math.random() * 10000)}</p>
            <div class="model-stats">
              <h3>Model Performance Metrics</h3>
              <p><strong>Classification Accuracy:</strong> 93.2%</p>
              <p><strong>Model Version:</strong> EEG-Classifier v2.1.4</p>
              <p><strong>Processing Time:</strong> 2.3 seconds</p>
              <p><strong>Confidence Threshold:</strong> 85%</p>
            </div>
          </div>
        ` : ''}
        <div class="content">
          ${filteredContent}
        </div>
        <script>
          setTimeout(() => {
            document.title = "${reportTitle}";
            window.print();
          }, 500);
        </script>
      </body>
    </html>
  `);
  frameDoc.close();

  printFrame.onload = () => {
    try {
      const win = printFrame.contentWindow;
      if (win) {
        win.focus();
        win.print();
      }
      
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      document.body.removeChild(printFrame);
    }
  };
};

// Function to handle printing
const handlePrint = () => {
  if (!selectedPatient) {
    alert('Please select a patient first');
    return;
  }

  const contentToPrint = printRef.current;
  if (!contentToPrint) return;
  
  // Get filtered content based on report type
  const filteredContent = getFilteredContent(reportType, contentToPrint);
  
  // Determine report title based on type
  let reportTitle = 'EEG Report';
  if (reportType === 'technical') {
    reportTitle = 'EEG Technical Analysis Report';
  } else if (reportType === 'summary') {
    reportTitle = `EEG Summary Report - ${selectedPatient.name}`;
  } else {
    reportTitle = `EEG Comprehensive Report - ${selectedPatient.name}`;
  }
  
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
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }
      .chart-placeholder {
        height: 250px;
        background-color: #f8f9fa;
        border: 1px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
        font-style: italic;
        color: #666;
      }
      .technical-header {
        text-align: center;
        margin-bottom: 30px;
        padding: 20px;
        background-color: #f8f9fa;
        border-radius: 10px;
      }
      .model-stats {
        background-color: #e3f2fd;
        padding: 15px;
        border-radius: 8px;
        margin: 15px 0;
      }
      @media print {
        button {
          display: none;
        }
        .no-print {
          display: none;
        }
      }
    </style>
    <div style="padding: 20px;">
      ${reportType === 'technical' ? `
        <div class="technical-header">
          <h1>EEG Technical Analysis Report</h1>
          <p><strong>Analysis Date:</strong> ${selectedDate}</p>
          <p><strong>Report ID:</strong> TECH-${Math.floor(Math.random() * 10000)}</p>
          <div class="model-stats">
            <h3>Model Performance Metrics</h3>
            <p><strong>Classification Accuracy:</strong> 93.2%</p>
            <p><strong>Model Version:</strong> EEG-Classifier v2.1.4</p>
            <p><strong>Processing Time:</strong> 2.3 seconds</p>
            <p><strong>Confidence Threshold:</strong> 85%</p>
          </div>
        </div>
      ` : ''}
      ${filteredContent}
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
    const body = encodeURIComponent(`Please find attached the EEG Monitoring Report for ${selectedPatient.name} (${selectedPatient.id}) dated ${selectedDate}.`);
    
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
    onChange={(e) => {
      const selectedId = e.target.value;
      const patient = patients.find((p) => p.id.toString() === selectedId);
      setSelectedPatient(patient || null);
    }}
  >
    <option value="">Select a patient</option>
    {patients.map((patient) => (
      <option key={patient.id} value={patient.id}>
        {patient.name} - {patient.id}
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

            {/* <div className="space-y-3">
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
            </div> */}

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

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">EEG Sample Preview</h3>
                <div
                  className={`h-64 transition-all duration-500 ${
                    isChartVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                >
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
        <div className="font-medium">{selectedPatient.id}</div>
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
          <div className="font-medium">{selectedPatient.vital_signs?.heart_rate} BPM</div>
          <div className="text-gray-500">Blood Pressure:</div>
          <div className="font-medium">{selectedPatient.vital_signs?.blood_pressure} mmHg</div>
          <div className="text-gray-500">Temperature:</div>
          <div className="font-medium">{selectedPatient.vital_signs?.temperature} °F</div>
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
          <p className="text-gray-500">Model Accuracy:</p>
          <p className="text-xl font-bold">93%</p>
        </div>
        <div>
          <p className="text-gray-500">Detection Time:</p>
          <p className="font-medium">2025-06-09 15:02:45</p>
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
        </div>
      </div>
    </div>
  )}
</div>

{/* Spectrogram section moved outside the grid and spans full width */}
{includeGraph && (
  <div className="mt-6">
    <h3 className="text-lg font-medium text-gray-800 mb-4">Spectrogram Visualization</h3>
    <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
      <div
        className={`min-h-64 transition-all duration-500 ${
          isChartVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex flex-ro gap-4 overflow-x-auto">
          {Object.entries(spectrogramImages).map(([label, data]) =>
            renderSpectrogramHeatmap(label, data)
          )}
        </div>
      </div>
    </div>
  </div>
)}
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