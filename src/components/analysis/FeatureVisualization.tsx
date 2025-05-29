import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, 
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Area
} from 'recharts';
import { ChevronDown, BarChart2, Activity, PieChart, RadioTower } from 'lucide-react';

// Types for the component
type FeatureData = {
  name: string;
  value: number;
  category?: string;
};

type TimeSeriesData = {
  time: number;
  [key: string]: number;
};

type FrequencyBandData = {
  band: string;
  [key: string]: string | number;
};

interface FeatureVisualizationProps {
  featureImportance?: FeatureData[];
  eegTimeSeries?: TimeSeriesData[];
  frequencyBands?: FrequencyBandData[];
  className?: string;
  title?: string;
}

// Default mock data
const defaultFeatureImportance: FeatureData[] = [
  { name: 'Delta Power', value: 85, category: 'Frequency' },
  { name: 'Theta Power', value: 63, category: 'Frequency' },
  { name: 'Alpha Power', value: 42, category: 'Frequency' },
  { name: 'Beta Power', value: 77, category: 'Frequency' },
  { name: 'Gamma Power', value: 91, category: 'Frequency' },
  { name: 'Signal Variance', value: 68, category: 'Statistical' },
  { name: 'Peak Frequency', value: 49, category: 'Frequency' },
  { name: 'Line Length', value: 72, category: 'Morphological' },
  { name: 'Kurtosis', value: 57, category: 'Statistical' },
  { name: 'Entropy', value: 81, category: 'Statistical' }
];

const defaultEEGTimeSeries: TimeSeriesData[] = Array.from({ length: 100 }, (_, i) => ({
  time: i * 0.01,
  normal: Math.sin(i * 0.1) * 10 + Math.random() * 2,
  seizure: Math.sin(i * 0.1 + 1) * 15 + Math.random() * 5 + (i > 50 ? 10 * Math.sin(i * 0.3) : 0)
}));

const defaultFrequencyBands: FrequencyBandData[] = [
  { band: 'Delta (0.5-4 Hz)', normal: 40, seizure: 20, difference: 20 },
  { band: 'Theta (4-8 Hz)', normal: 25, seizure: 15, difference: 10 },
  { band: 'Alpha (8-13 Hz)', normal: 20, seizure: 10, difference: 10 },
  { band: 'Beta (13-30 Hz)', normal: 10, seizure: 25, difference: -15 },
  { band: 'Gamma (30-100 Hz)', normal: 5, seizure: 30, difference: -25 }
];

// Color configuration
const colors = {
  normal: '#4CAF50',
  seizure: '#F44336',
  frequencyBands: ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316'],
  categories: {
    Frequency: '#2196F3',
    Statistical: '#4CAF50',
    Morphological: '#FF9800',
    default: '#9C27B0'
  }
};

const FeatureVisualization: React.FC<FeatureVisualizationProps> = ({
  featureImportance = defaultFeatureImportance,
  eegTimeSeries = defaultEEGTimeSeries,
  frequencyBands = defaultFrequencyBands,
  className = '',
  title = 'Feature Analysis'
}) => {
  const [activeView, setActiveView] = useState<'importance' | 'timeSeries' | 'frequency' | 'radar'>('importance');
  const [sortBy, setSortBy] = useState<'value' | 'name' | 'category'>('value');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  
  // Extract unique categories
  const categories = Array.from(
    new Set(featureImportance.map(f => f.category || 'Other'))
  );
  
  // Sort and filter features
  const sortedFeatures = [...featureImportance]
    .filter(f => !filterCategory || f.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'value') return b.value - a.value;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      return 0;
    });
  
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded-lg ${activeView === 'importance' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveView('importance')}
            title="Feature Importance"
          >
            <BarChart2 size={16} />
          </button>
          <button
            className={`p-2 rounded-lg ${activeView === 'timeSeries' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveView('timeSeries')}
            title="Time Series"
          >
            <Activity size={16} />
          </button>
          <button
            className={`p-2 rounded-lg ${activeView === 'frequency' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveView('frequency')}
            title="Frequency Analysis"
          >
            <PieChart size={16} />
          </button>
          <button
            className={`p-2 rounded-lg ${activeView === 'radar' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveView('radar')}
            title="Radar Chart"
          >
            <RadioTower size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Controls for feature importance view */}
        {activeView === 'importance' && (
          <div className="flex mb-4 space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'value' | 'name' | 'category')}
              >
                <option value="value">Importance (High to Low)</option>
                <option value="name">Feature Name (A-Z)</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Category</label>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                value={filterCategory || ''}
                onChange={(e) => setFilterCategory(e.target.value || null)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {/* Feature Importance View */}
        {activeView === 'importance' && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedFeatures}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip 
                  formatter={(value) => [`${value}/100`, 'Importance']}
                  labelFormatter={(name) => `Feature: ${name}`}
                />
                <Legend />
                <Bar dataKey="value" name="Importance Score">
                  {sortedFeatures.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors.categories[entry.category as keyof typeof colors.categories] || colors.categories.default} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Time Series View */}
        {activeView === 'timeSeries' && (
          <>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                This chart shows EEG amplitude patterns for normal brain activity vs. seizure activity. Note the higher amplitude and more 
                chaotic patterns during seizure events (red line), particularly after the 0.5s mark.
              </p>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={eegTimeSeries}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -10 }} 
                  />
                  <YAxis 
                    label={{ value: 'Amplitude (μV)', angle: -90, position: 'insideLeft' }} 
                  />
                  <Tooltip formatter={(value) => [`${value} μV`, '']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="normal" 
                    stroke={colors.normal} 
                    name="Normal EEG" 
                    dot={false} 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="seizure" 
                    stroke={colors.seizure} 
                    name="Seizure EEG" 
                    dot={false} 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>