
import React from 'react';

interface Metrics {
  totalVisitors: number;
  interestedVisitors: number;
  avgDwellTime: string;
}

interface MetricsCardsProps {
  metrics: Metrics;
}

export const MetricsCards = ({ metrics }: MetricsCardsProps) => {
  const cards = [
    {
      title: 'Total Visitors',
      value: metrics.totalVisitors.toString(),
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Interested Visitors',
      value: metrics.interestedVisitors.toString(),
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    },
    {
      title: 'Avg Dwell Time',
      value: metrics.avgDwellTime,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} ${card.borderColor} border rounded-xl p-6 transition-all duration-200 hover:shadow-md`}
        >
          <h3 className="text-sm font-medium text-gray-600 mb-2">{card.title}</h3>
          <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};
