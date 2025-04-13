import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { FileUp, Download, BarChart2, PieChart as PieChartIcon, Activity } from 'lucide-react';

// Mock data for visualizations
const featureImportanceData = [
  { name: 'Delta Power', value: 85 },
  { name: 'Theta Power', value: 63 },
  { name: 'Alpha Power', value: 42 },
  { name: 'Beta Power', value: 77 },
  { name: 'Gamma Power', value: 91 },
  { name: 'Signal Variance', value: 68 },
  { name: 'Peak Frequency', value: 49 },
  { name: 'Line Length', value: 72 }
];

const modelPerformanceData = [
  { name: 'Accuracy', value: 0.89 },
  { name: 'Precision', value: 0.92 },
  { name: 'Recall', value: 0.87 },
  { name: 'F1 Score', value: 0.90 },
  { name: 'AUC', value: 0.94 }
];

const confusionMatrixData = [
  { name: 'True Negatives', value: 145 },
  { name: 'False Positives', value: 12 },
  { name: 'False Negatives', value: 18 },
  { name: 'True Positives', value: 156 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Create clusters of data for the t-SNE visualization
const generateClusterData = (centerX: number, centerY: number, label: string, count: number) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      x: centerX + (Math.random() - 0.5) * 10,
      y: centerY + (Math.random() - 0.5) * 10,
      z: 10,
      label
    });
  }
  return data;
};

const tsneData = [
  ...generateClusterData(-20, -15, 'Normal', 50),
  ...generateClusterData(15, 20, 'Focal Seizure', 40),
  ...generateClusterData(20, -15, 'General Seizure', 35),
  ...generateClusterData(-15, 15, 'Status Epilepticus', 25)
];

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState('features');
  const [selectedModel, setSelectedModel] = useState('Random Forest');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // In a real app, you would process the file here
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ML Analysis Dashboard</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.json"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
            >
              <FileUp size={16} />
              <span>Upload Dataset</span>
            </label>
          </div>
          <select
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option>Random Forest</option>
            <option>LSTM</option>
            <option>1D CNN</option>
            <option>XGBoost</option>
          </select>
        </div>
      </div>
      
      {uploadedFile && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>File uploaded: {uploadedFile.name}</span>
          <button className="text-green-700 hover:text-green-900">
            <Download size={16} />
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex border-b">
          <button
            className={`py-3 px-6 font-medium flex items-center space-x-2 ${activeTab === 'features' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('features')}
          >
            <BarChart2 size={16} />
            <span>Feature Analysis</span>
          </button>
          <button
            className={`py-3 px-6 font-medium flex items-center space-x-2 ${activeTab === 'performance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('performance')}
          >
            <PieChartIcon size={16} />
            <span>Model Performance</span>
          </button>
          <button
            className={`py-3 px-6 font-medium flex items-center space-x-2 ${activeTab === 'clusters' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('clusters')}
          >
            <Activity size={16} />
            <span>Data Clusters</span>
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'features' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Feature Importance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={featureImportanceData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Importance Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Feature importance scores show that Gamma Power and Delta Power are the most significant predictors for seizure detection.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Feature Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { x: 0, normal: 0.2, focal: 0.1, general: 0.05, status: 0.02 },
                        { x: 5, normal: 0.5, focal: 0.2, general: 0.1, status: 0.05 },
                        { x: 10, normal: 0.8, focal: 0.3, general: 0.2, status: 0.1 },
                        { x: 15, normal: 0.9, focal: 0.6, general: 0.4, status: 0.2 },
                        { x: 20, normal: 0.7, focal: 0.9, general: 0.6, status: 0.3 },
                        { x: 25, normal: 0.4, focal: 0.8, general: 0.9, status: 0.5 },
                        { x: 30, normal: 0.2, focal: 0.5, general: 0.7, status: 0.9 },
                        { x: 35, normal: 0.1, focal: 0.3, general: 0.4, status: 0.7 },
                        { x: 40, normal: 0.05, focal: 0.1, general: 0.2, status: 0.4 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Power Density', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="normal" stroke="#8884d8" name="Normal" />
                      <Line type="monotone" dataKey="focal" stroke="#82ca9d" name="Focal Seizure" />
                      <Line type="monotone" dataKey="general" stroke="#ffc658" name="General Seizure" />
                      <Line type="monotone" dataKey="status" stroke="#ff8042" name="Status Epilepticus" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  The frequency distributions show clear separation between normal brain activity and different seizure types.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'performance' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Model Metrics</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  The {selectedModel} model shows strong performance across all metrics, with particularly high precision (0.92) and AUC (0.94).
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Confusion Matrix</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={confusionMatrixData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {confusionMatrixData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-green-700">91.3%</div>
                    <div className="text-sm text-green-600">Accuracy</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-700">92.9%</div>
                    <div className="text-sm text-blue-600">Precision</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-yellow-700">89.7%</div>
                    <div className="text-sm text-yellow-600">Recall</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-purple-700">91.2%</div>
                    <div className="text-sm text-purple-600">F1 Score</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'clusters' && (
            <div>
              <h3 className="text-lg font-medium mb-4">t-SNE Visualization of EEG Data</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis type="number" dataKey="x" name="t-SNE Dimension 1" />
                    <YAxis type="number" dataKey="y" name="t-SNE Dimension 2" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                      content={({ payload }) => {
                        if (payload && payload.length) {
                          return (
                            <div className="bg-white p-2 border border-gray-300 rounded-md shadow-sm">
                              <p className="font-medium">{payload[0].payload.label}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Scatter 
                      name="Normal" 
                      data={tsneData.filter(d => d.label === 'Normal')} 
                      fill="#8884d8" 
                    />
                    <Scatter 
                      name="Focal Seizure" 
                      data={tsneData.filter(d => d.label === 'Focal Seizure')} 
                      fill="#82ca9d" 
                    />
                    <Scatter 
                      name="General Seizure" 
                      data={tsneData.filter(d => d.label === 'General Seizure')} 
                      fill="#ffc658" 
                    />
                    <Scatter 
                      name="Status Epilepticus" 
                      data={tsneData.filter(d => d.label === 'Status Epilepticus')} 
                      fill="#ff8042" 
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                The t-SNE plot shows clear clustering of EEG data by seizure type, indicating that our feature extraction process effectively captures the distinguishing characteristics of each class.
              </p>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Model Architecture: {selectedModel}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Preprocessing Steps</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      <li>Bandpass filtering (0.5-70Hz)</li>
                      <li>Artifact removal (ICA-based)</li>
                      <li>Signal normalization</li>
                      <li>Segmentation into 10s epochs</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Feature Extraction</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      <li>Power spectral density (5 frequency bands)</li>
                      <li>Wavelet coefficients</li>
                      <li>Time-domain statistical features</li>
                      <li>Complexity measures (entropy, fractal dimension)</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Hyperparameters</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="text-xs text-gray-500">Learning Rate</div>
                      <div className="font-medium">0.001</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="text-xs text-gray-500">Batch Size</div>
                      <div className="font-medium">32</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="text-xs text-gray-500">Epochs</div>
                      <div className="font-medium">100</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="text-xs text-gray-500">Optimizer</div>
                      <div className="font-medium">Adam</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}