import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart, Legend, Label } from 'recharts';

interface VisitorData {
  hour: number;
  visitors: number;
}

interface VisitorsChartProps {
  data: VisitorData[];
}

export const VisitorsChart = ({ data }: VisitorsChartProps) => {
  return (
    <div className="h-96 w-full">
      <div className="text-lg font-semibold text-gray-800 mb-2 text-center">Hourly Visitor Breakdown</div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
          <defs>
            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="hour" 
            stroke="#6b7280"
            fontSize={13}
            tickFormatter={(value) => `${value}:00`}
          >
            <Label value="Hour of Day" offset={-10} position="insideBottom" />
          </XAxis>
          <YAxis 
            stroke="#6b7280"
            fontSize={13}
            allowDecimals={false}
            label={{ value: 'Visitors', angle: -90, position: 'insideLeft', offset: 10 }}
          />
          <Tooltip formatter={(value) => [value, 'Visitors']} labelFormatter={label => `Hour: ${label}:00`} />
          <Area 
            type="monotone" 
            dataKey="visitors" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorVisitors)"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle"/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
