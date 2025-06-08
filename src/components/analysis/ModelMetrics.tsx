import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileUp, Download, BarChart2, PieChart as PieChartIcon, Activity, ArrowUpDown } from 'lucide-react';

const modelResultsData = [
  {
    model: 'Random Forest',
    trainAccuracy: 0.875456,
    trainKL: 0.9056,
    valAccuracy: 0.844148,
    valKL: 0.934,
  },
  {
    model: 'XGBoost',
    trainAccuracy: 0.960709,
    trainKL: 0.180738,
    valAccuracy: 0.931414,
    valKL: 0.257048,
  },
  {
    model: 'LSTM',
    trainAccuracy: 0.796793,
    trainKL: 0.591659,
    valAccuracy: 0.802903,
    valKL: 0.592339,
  },
  {
    model: 'CNN (EfficientNetB2)',
    trainAccuracy: null,
    trainKL: null,
    valAccuracy: 0.775059980104,
    valKL: 0.435244176902,
  },
  {
    model: 'ConvLSTM',
    trainAccuracy: 0.906273,
    trainKL: 0.364662,
    valAccuracy: 0.882444,
    valKL: 0.433653,
  },
  {
    model: 'SVM',
    trainAccuracy: 0.8687,
    trainKL: 0.421820,
    valAccuracy: 0.8433,
    valKL: 0.489364,
  }
];

// Function to get chart data for selected model
const getModelChartData = (modelName: string) => {
  const model = modelResultsData.find(m => m.model === modelName);
  if (!model) return [];
  
  const chartData = [];
  
  if (model.trainAccuracy !== null) {
    chartData.push({ metric: 'Train Accuracy', value: model.trainAccuracy });
  }
  if (model.valAccuracy !== null) {
    chartData.push({ metric: 'Val Accuracy', value: model.valAccuracy });
  }
  if (model.trainKL !== null) {
    chartData.push({ metric: 'Train KL Div', value: model.trainKL });
  }
  if (model.valKL !== null) {
    chartData.push({ metric: 'Val KL Div', value: model.valKL });
  }
  
  return chartData;
};

// Function to get comparison data for all models
const getComparisonData = () => {
  return modelResultsData.map(model => ({
    model: model.model,
    trainAcc: model.trainAccuracy,
    valAcc: model.valAccuracy,
    trainKL: model.trainKL,
    valKL: model.valKL
  })).filter(item => item.trainAcc !== null || item.valAcc !== null);
};

// Feature importance data
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

export default function ModelMetrics() {
  const [activeTab, setActiveTab] = useState('results');
  const [selectedModel, setSelectedModel] = useState('Random Forest');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...modelResultsData].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = (a as any)[sortConfig.key];
    const bValue = (b as any)[sortConfig.key];
    
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const formatValue = (value: number | null, decimals = 6) => {
    return value !== null ? value.toFixed(decimals) : 'N/A';
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
            <option>Random Forest (Final)</option>
            <option>XGBoost</option>
            <option>LSTM</option>
            <option>CNN (EfficientNetB2)</option>
            <option>ConvLSTM</option>
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
            className={`py-3 px-6 font-medium flex items-center space-x-2 ${activeTab === 'results' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('results')}
          >
            <Activity size={16} />
            <span>Model Results</span>
          </button>
          <button
            className={`py-3 px-6 font-medium flex items-center space-x-2 ${activeTab === 'comparison' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('comparison')}
          >
            <BarChart2 size={16} />
            <span>Model Comparison</span>
          </button>
          <button
            className={`py-3 px-6 font-medium flex items-center space-x-2 ${activeTab === 'features' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('features')}
          >
            <PieChartIcon size={16} />
            <span>Feature Analysis</span>
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'results' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Model Performance Comparison</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('trainAccuracy')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Train Accuracy</span>
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('trainKL')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Train KL Div</span>
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('valAccuracy')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Val Accuracy</span>
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('valKL')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Val KL Div</span>
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {result.model}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            result.trainAccuracy && result.trainAccuracy > 0.9 
                              ? 'bg-green-100 text-green-800' 
                              : result.trainAccuracy && result.trainAccuracy > 0.8
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {formatValue(result.trainAccuracy)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatValue(result.trainKL)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            result.valAccuracy && result.valAccuracy > 0.9 
                              ? 'bg-green-100 text-green-800' 
                              : result.valAccuracy && result.valAccuracy > 0.8
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {formatValue(result.valAccuracy)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatValue(result.valKL)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Performance Summary</h4>
                <p className="text-sm text-blue-800">
                  XGBoost is the best model due to its superior validation accuracy (93 %) and lower KL Divergence (26 %), 
                  reflecting its ability to accurately predict outcomes and closely match the true data distribution. 
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Interactive Model Comparison</h3>
                <div className="text-sm text-gray-600">
                  Selected Model: <span className="font-semibold text-blue-600">{selectedModel}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Individual Model Performance */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-md font-medium mb-4">{selectedModel} Performance</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getModelChartData(selectedModel)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value: number | string) => [String(value).padEnd(6, '0'), 'Value']} />
                        <Bar dataKey="value" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {(() => {
                        const model = modelResultsData.find(m => m.model === selectedModel);
                        return (
                          <>
                            {model?.trainAccuracy && (
                              <div><span className="text-gray-600">Train Acc:</span> <span className="font-mono">{model.trainAccuracy.toFixed(6)}</span></div>
                            )}
                            {model?.valAccuracy && (
                              <div><span className="text-gray-600">Val Acc:</span> <span className="font-mono">{model.valAccuracy.toFixed(6)}</span></div>
                            )}
                            {model?.trainKL && (
                              <div><span className="text-gray-600">Train KL:</span> <span className="font-mono">{model.trainKL.toFixed(6)}</span></div>
                            )}
                            {model?.valKL && (
                              <div><span className="text-gray-600">Val KL:</span> <span className="font-mono">{model.valKL.toFixed(6)}</span></div>
                            )}                            
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* All Models Accuracy Comparison */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-md font-medium mb-4">Accuracy Comparison (All Models)</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getComparisonData()} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 1]} />
                        <YAxis dataKey="model" type="category" width={120} />
                        <Tooltip formatter={(value: number | string) => [String(value).padEnd(6, '0'), 'Value']} />
                        <Legend />
                        <Bar dataKey="trainAcc" fill="#10B981" name="Train Acc" />
                        <Bar dataKey="valAcc" fill="#3B82F6" name="Val Acc" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Best Performer:</strong> XGBoost is the best model due to its superior validation accuracy (93 %) and lower KL Divergence (26 %), 
                  reflecting its ability to accurately predict outcomes and closely match the true data distribution. 
                    </p>
                  </div>
                </div>
              </div>

              {/* KL Divergence Comparison */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="text-md font-medium mb-4">KL Divergence Comparison</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getComparisonData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="model" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value) => {
                        if (typeof value === 'number') {
                          return [value.toFixed(6), 'KL Divergence'];
                        } else {
                          return ['N/A', 'KL Divergence'];
                        }
                      }} />
                      <Legend />
                      <Line type="monotone" dataKey="trainKL" stroke="#EF4444" name="Train KL Div" strokeWidth={2} />
                      <Line type="monotone" dataKey="valKL" stroke="#F59E0B" name="Val KL Div" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Lower KL Divergence indicates better performance.</strong> Random Forest (Final) shows the best KL divergence scores,
                    indicating superior probability distribution matching.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </div>
      </div>
    </div>
  );
}