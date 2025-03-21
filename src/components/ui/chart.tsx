
import React from 'react';
import {
  Area,
  Bar,
  Line,
  Pie,
  Radar,
  ComposedChart,
  PieChart, 
  BarChart, 
  LineChart, 
  AreaChart,
  RadarChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

interface ChartProps {
  type: 'bar' | 'line' | 'area' | 'pie' | 'radar' | 'composed';
  data: any[];
  width?: number | string;
  height?: number | string;
  customColors?: string[];
  [key: string]: any;
}

export function Chart({ 
  type, 
  data, 
  width = '100%', 
  height = 300,
  customColors,
  ...rest 
}: ChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-40 text-gray-500 text-sm">No data available</div>;
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data} {...rest}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data} {...rest}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data} {...rest}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart {...rest}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            />
            <Tooltip />
          </PieChart>
        );
      case 'radar':
        return (
          <RadarChart outerRadius={90} data={data} {...rest}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={30} domain={[0, 150]} />
            <Radar name="Value" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Legend />
            <Tooltip />
          </RadarChart>
        );
      case 'composed':
        return (
          <ComposedChart data={data} {...rest}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="bar" fill="#8884d8" />
            <Line type="monotone" dataKey="line" stroke="#ff7300" />
          </ComposedChart>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <ResponsiveContainer width={width} height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
}
