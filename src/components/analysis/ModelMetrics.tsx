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
  ...generateClusterData(-20, -15, 'seizure', 50),
  ...generateClusterData(15, 20, 'lpd', 40),
  ...generateClusterData(20, -15, 'gpd', 35),
  ...generateClusterData(-15, 15, 'lrda', 25),
  ...generateClusterData(20, 15, 'grda', 30),
  ...generateClusterData(20, 20, 'others', 45)
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
                        { x: 0, seizure: 0.1, lpd: 0.8, gpd: 0.3, lrda: 0.6, grda: 0.2, others: 0.9 },
                        { x: 5, seizure: 0.3, lpd: 0.9, gpd: 0.6, lrda: 0.8, grda: 0.5, others: 0.7 },
                        { x: 10, seizure: 0.6, lpd: 0.7, gpd: 0.9, lrda: 0.5, grda: 0.8, others: 0.4 },
                        { x: 15, seizure: 0.8, lpd: 0.5, gpd: 0.7, lrda: 0.9, grda: 0.4, others: 0.6 },
                        { x: 20, seizure: 0.9, lpd: 0.3, gpd: 0.5, lrda: 0.7, grda: 0.6, others: 0.8 },
                        { x: 25, seizure: 0.7, lpd: 0.6, gpd: 0.8, lrda: 0.4, grda: 0.9, others: 0.3 },
                        { x: 30, seizure: 0.5, lpd: 0.4, gpd: 0.2, lrda: 0.3, grda: 0.7, others: 0.1 },
                        { x: 35, seizure: 0.2, lpd: 0.1, gpd: 0.4, lrda: 0.2, grda: 0.9, others: 0.5 },
                        { x: 40, seizure: 0.05, lpd: 0.2, gpd: 0.1, lrda: 0.1, grda: 0.6, others: 0.3 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Power Density', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="seizure" stroke="#8884d8" name="Seizures" />
                      <Line type="monotone" dataKey="lpd" stroke="#82ca9d" name="LPD" />
                      <Line type="monotone" dataKey="gpd" stroke="#ffc658" name="GPD" />
                      <Line type="monotone" dataKey="lrda" stroke="#ff8042" name="LRDA" />
                      <Line type="monotone" dataKey="grda" stroke="#273746" name="GRDA" />
                      <Line type="monotone" dataKey="others" stroke="#F39C12" name="Others" />
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
          )}
        </div>
      </div>
    </div>
  );
}