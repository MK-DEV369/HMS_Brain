import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ConfusionMatrixProps {
  data?: {
    accuracy: { train: number; test: number };
    klDivergence: { train: number; test: number };
    trainTestValidation: { train: number; test: number };
  };
  title?: string;
  className?: string;
}

const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({
  data = {
    accuracy: { train: 0.91, test: 0.89 },
    klDivergence: { train: 0.95, test: 0.92 },
    trainTestValidation: { train: 0.90, test: 0.87 },
  },
  title = "Model Performance Comparison",
  className = "",
}) => {
  const chartData = [
    {
      name: 'Accuracy',
      'Train Data': data.accuracy.train * 100,
      'Test Data': data.accuracy.test * 100,
    },
    {
      name: 'KL Divergence',
      'Train Data': data.klDivergence.train * 100,
      'Test Data': data.klDivergence.test * 100,
    },
    {
      name: 'Train Test Validation',
      'Train Data': data.trainTestValidation.train * 100,
      'Test Data': data.trainTestValidation.test * 100,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value.toFixed(1)}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      </div>
      
      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={{ stroke: '#ddd' }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={{ stroke: '#ddd' }}
              label={{ value: 'Performance (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            <Bar 
              dataKey="Train Data" 
              fill="#4CAF50" 
              radius={[4, 4, 0, 0]}
              name="Train Data"
            />
            <Bar 
              dataKey="Test Data" 
              fill="#2196F3" 
              radius={[4, 4, 0, 0]}
              name="Test Data"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {(data.accuracy.test * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Test Accuracy</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {(data.klDivergence.test * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Test KL Divergence</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {(data.trainTestValidation.test * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Test Validation</div>
        </div>
      </div>
    </div>
  );
};

export default ConfusionMatrix;