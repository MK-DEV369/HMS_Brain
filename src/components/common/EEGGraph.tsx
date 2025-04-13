import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface EEGDataPoint {
  timestamp: number;
  value: number;
  channel?: string;
}

interface EEGGraphProps {
  data: EEGDataPoint[];
  height?: number;
  channels?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  isLive?: boolean;
}

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2'];

const EEGGraph: React.FC<EEGGraphProps> = ({
  data,
  height = 300,
  channels = ['EEG1'],
  showGrid = true,
  showLegend = true,
  isLive = false,
}) => {
  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => `${value}s`}
          />
          <YAxis
            label={{ value: 'Amplitude (μV)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                    <p className="text-sm font-medium">
                      Time: {payload[0].payload.timestamp}s
                    </p>
                    {payload.map((entry, index) => (
                      <p
                        key={index}
                        className="text-sm"
                        style={{ color: entry.color }}
                      >
                        {entry.name}: {entry.value.toFixed(2)} μV
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          {showLegend && <Legend />}
          {channels.map((channel, index) => (
            <Line
              key={channel}
              type="monotone"
              dataKey={(item: EEGDataPoint) =>
                item.channel === channel ? item.value : null
              }
              name={channel}
              stroke={COLORS[index % COLORS.length]}
              dot={false}
              isAnimationActive={!isLive}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EEGGraph;