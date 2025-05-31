import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { BarChart2, PieChart as PieChartIcon, Activity } from 'lucide-react';
import ConfusionMatrix from '../components/analysis/ConfusionMatrix';

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
  { name: 'KL Divergence', value: 0.92 },
  { name: 'Train Test Validation', value: 0.87 },
];

// Updated confusion matrix data for train/test comparison
const confusionMatrixData = {
  accuracy: { train: 0.91, test: 0.89 },
  klDivergence: { train: 0.95, test: 0.92 },
  trainTestValidation: { train: 0.90, test: 0.87 },
};

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
  ...generateClusterData(15, 0, 'grda', 30),
  ...generateClusterData(-5, 0, 'others', 45)
];

export default function Analysis() {
  const [activeTab, setActiveTab] = useState('features');
  const [selectedModel, setSelectedModel] = useState('Random Forest');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          ML Analysis Dashboard
        </h1>
        <select 
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option>Random Forest</option>
          <option>LSTM</option>
          <option>CNN</option>
          <option>XGBoost</option>
          <option>SVM</option>
        </select>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'features' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('features')}
          >
            <BarChart2 className="inline-block w-4 h-4 mr-2" />
            Feature Analysis
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'performance' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            <Activity className="inline-block w-4 h-4 mr-2" />
            Model Performance
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="space-y-6">
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
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Model Metrics
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={modelPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Bar dataKey="value" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-600 mt-4">
        The {selectedModel} model shows strong performance across all metrics, with particularly high accuracy (0.89) and KL Divergence (0.92).
      </p>
      {/* Hyperparameters block moved here for full width and visual consistency */}
      <div className="mt-8 w-full">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Hyperparameters</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">Learning Rate</div>
            <div className="font-semibold text-base">0.001</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">Batch Size</div>
            <div className="font-semibold text-base">32</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">Epochs</div>
            <div className="font-semibold text-base">100</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">Optimizer</div>
            <div className="font-semibold text-base">Sankalp</div>
          </div>
        </div>
      </div>
    </div>

    {/* Updated Confusion Matrix Component */}
    <ConfusionMatrix 
      data={confusionMatrixData}
      title="Train vs Test Performance"
      className="lg:col-span-1"
    />
  </div>
)}
      </div>
    </div>
  );
}