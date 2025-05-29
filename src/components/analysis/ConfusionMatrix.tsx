import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ConfusionMatrixProps {
  data?: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
  };
  title?: string;
  className?: string;
}

const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({
  data = {
    truePositives: 145,
    falsePositives: 12,
    trueNegatives: 156,
    falseNegatives: 18,
  },
  title = "Confusion Matrix",
  className = "",
}) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  
  const total = data.truePositives + data.falsePositives + data.trueNegatives + data.falseNegatives;
  const accuracy = ((data.truePositives + data.trueNegatives) / total) * 100;
  const precision = (data.truePositives / (data.truePositives + data.falsePositives)) * 100;
  const recall = (data.truePositives / (data.truePositives + data.falseNegatives)) * 100;
  const f1Score = 2 * ((precision * recall) / (precision + recall));
  
  const pieData = [
    { name: 'True Positives', value: data.truePositives },
    { name: 'False Positives', value: data.falsePositives },
    { name: 'True Negatives', value: data.trueNegatives },
    { name: 'False Negatives', value: data.falseNegatives },
  ];
  
  const COLORS = ['#4CAF50', '#FF9800', '#2196F3', '#F44336'];
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.8;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };
  
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      
      <div className="p-4">
        {/* Visual Confusion Matrix */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div 
            className={`border-2 p-4 rounded flex items-center justify-center bg-green-100 ${
              hoveredCell === 'TP' ? 'border-green-500 ring-2 ring-green-300' : 'border-green-300'
            }`}
            onMouseEnter={() => setHoveredCell('TP')}
            onMouseLeave={() => setHoveredCell(null)}
          >
            <div className="text-center">
              <div className="text-xl font-bold text-green-700">{data.truePositives}</div>
              <div className="text-sm text-green-600">True Positives</div>
            </div>
          </div>
          
          <div 
            className={`border-2 p-4 rounded flex items-center justify-center bg-orange-100 ${
              hoveredCell === 'FP' ? 'border-orange-500 ring-2 ring-orange-300' : 'border-orange-300'
            }`}
            onMouseEnter={() => setHoveredCell('FP')}
            onMouseLeave={() => setHoveredCell(null)}
          >
            <div className="text-center">
              <div className="text-xl font-bold text-orange-700">{data.falsePositives}</div>
              <div className="text-sm text-orange-600">False Positives</div>
            </div>
          </div>
          
          <div 
            className={`border-2 p-4 rounded flex items-center justify-center bg-red-100 ${
              hoveredCell === 'FN' ? 'border-red-500 ring-2 ring-red-300' : 'border-red-300'
            }`}
            onMouseEnter={() => setHoveredCell('FN')}
            onMouseLeave={() => setHoveredCell(null)}
          >
            <div className="text-center">
              <div className="text-xl font-bold text-red-700">{data.falseNegatives}</div>
              <div className="text-sm text-red-600">False Negatives</div>
            </div>
          </div>
          
          <div 
            className={`border-2 p-4 rounded flex items-center justify-center bg-blue-100 ${
              hoveredCell === 'TN' ? 'border-blue-500 ring-2 ring-blue-300' : 'border-blue-300'
            }`}
            onMouseEnter={() => setHoveredCell('TN')}
            onMouseLeave={() => setHoveredCell(null)}
          >
            <div className="text-center">
              <div className="text-xl font-bold text-blue-700">{data.trueNegatives}</div>
              <div className="text-sm text-blue-600">True Negatives</div>
            </div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-green-700">{accuracy.toFixed(1)}%</div>
            <div className="text-sm text-green-600">Accuracy</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-700">{precision.toFixed(1)}%</div>
            <div className="text-sm text-blue-600">Precision</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-yellow-700">{recall.toFixed(1)}%</div>
            <div className="text-sm text-yellow-600">Recall</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-purple-700">{f1Score.toFixed(1)}%</div>
            <div className="text-sm text-purple-600">F1 Score</div>
          </div>
        </div>
        
        {/* Info */}
        <div className="mt-4 text-sm text-gray-600">
          <p>
            <span className="font-medium">True Positives (TP):</span> Correctly identified seizure activity.
          </p>
          <p>
            <span className="font-medium">False Positives (FP):</span> Normal activity incorrectly classified as seizure.
          </p>
          <p>
            <span className="font-medium">False Negatives (FN):</span> Missed seizure activity (classified as normal).
          </p>
          <p>
            <span className="font-medium">True Negatives (TN):</span> Correctly identified normal activity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfusionMatrix;