import React, { useState, useEffect } from 'react';
import { MetricsCards } from '../components/MetricsCards';
import { VisitorsChart } from '../components/VisitorsChart';
import { TheftAlertLog } from '../components/TheftAlertLog';
import { HistoricalRecords } from '../components/HistoricalRecords';
import { Header } from '../components/Header';
import { useAnalytics } from '../hooks/useAnalytics';

const Index = () => {
  const {
    getRecentTheftAlerts,
    getTodayAnalytics,
    calculateAverageDwellTime,
    updateTodayAnalytics,
    getVisitorChartData,
  } = useAnalytics();

  const [metrics, setMetrics] = useState({
    totalVisitors: 0,
    interestedVisitors: 0,
    avgDwellTime: '00:00:00'
  });

  // Initialize with empty data - will be populated with real data
  const [visitorsData, setVisitorsData] = useState([
    { hour: 9, visitors: 0 },
    { hour: 10, visitors: 0 },
    { hour: 11, visitors: 0 },
    { hour: 12, visitors: 0 },
    { hour: 13, visitors: 0 },
    { hour: 14, visitors: 0 },
    { hour: 15, visitors: 0 },
    { hour: 16, visitors: 0 },
    { hour: 17, visitors: 0 },
    { hour: 18, visitors: 0 },
    { hour: 19, visitors: 0 },
    { hour: 20, visitors: 0 },
    { hour: 21, visitors: 0 }
  ]);

  const [theftAlerts, setTheftAlerts] = useState([]);

  console.log('Dashboard loaded - reading data from analytics_summary');

  // Format dwell time from seconds to HH:MM:SS (for backward compatibility)
  const formatDwellTime = (seconds) => {
    if (!seconds) return '00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load existing data from Supabase on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('Loading data from analytics_summary and interest_events...');
      
      // Load today's analytics from analytics_summary
      const todayAnalytics = await getTodayAnalytics();
      if (todayAnalytics) {
        console.log('Loaded analytics from analytics_summary:', todayAnalytics);
        
        // Calculate average dwell time from interest_events table (now returns formatted string)
        const avgDwellTimeFormatted = await calculateAverageDwellTime();
        
        // Use correct column names: total_in for total visitors, total_interest for interested visitors
        setMetrics({
          totalVisitors: todayAnalytics.total_in || 0,
          interestedVisitors: todayAnalytics.total_interest || 0,
          avgDwellTime: avgDwellTimeFormatted
        });
      } else {
        console.log('No analytics_summary data found - keeping zeros');
      }

      // Load visitor chart data
      const chartData = await getVisitorChartData();
      setVisitorsData(chartData);

      // Load today's theft alerts (daily ones)
      const alerts = await getRecentTheftAlerts(50); // Get more to filter by today
      if (alerts && alerts.length > 0) {
        // Filter alerts for today only
        const today = new Date().toISOString().split('T')[0];
        const todayAlerts = alerts.filter(alert => {
          const alertDate = new Date(alert.timestamp || '').toISOString().split('T')[0];
          return alertDate === today;
        });

        const formattedAlerts = todayAlerts.map(alert => ({
          id: parseInt(alert.id.split('-')[0], 16),
          time: new Date(alert.timestamp || '').toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).replace(',', ''),
          snapshot: alert.snapshot_path,
          location: alert.camera_id || 'Show Table Zone',
          confidence: alert.confidence || 0
        }));
        console.log('Loaded today\'s theft alerts:', formattedAlerts);
        setTheftAlerts(formattedAlerts);
      } else {
        console.log('No theft alerts found for today');
        setTheftAlerts([]);
      }
    };

    loadInitialData();
  }, []);

  // Refresh data every 5 seconds to check for new data
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      console.log('Checking for updated data...');
      
      // Check for updated analytics from analytics_summary
      const todayAnalytics = await getTodayAnalytics();
      if (todayAnalytics) {
        // Calculate average dwell time from interest_events (now returns formatted string)
        const avgDwellTimeFormatted = await calculateAverageDwellTime();
        
        // Use correct column names
        setMetrics({
          totalVisitors: todayAnalytics.total_in || 0,
          interestedVisitors: todayAnalytics.total_interest || 0,
          avgDwellTime: avgDwellTimeFormatted
        });
      }

      // Update visitor chart data
      const chartData = await getVisitorChartData();
      setVisitorsData(chartData);

      // Check for new daily theft alerts
      const alerts = await getRecentTheftAlerts(50);
      if (alerts && alerts.length > 0) {
        // Filter for today's alerts only
        const today = new Date().toISOString().split('T')[0];
        const todayAlerts = alerts.filter(alert => {
          const alertDate = new Date(alert.timestamp || '').toISOString().split('T')[0];
          return alertDate === today;
        });

        const formattedAlerts = todayAlerts.map(alert => ({
          id: parseInt(alert.id.split('-')[0], 16),
          time: new Date(alert.timestamp || '').toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).replace(',', ''),
          snapshot: alert.snapshot_path,
          location: alert.camera_id || 'Show Table Zone',
          confidence: alert.confidence || 0
        }));
        setTheftAlerts(formattedAlerts);
      } else {
        setTheftAlerts([]);
      }
    }, 5000);

    return () => clearInterval(refreshInterval);
  }, []);

  console.log('Current metrics (total_in, total_interest, avg from interest_events):', metrics);
  console.log('Current daily theft alerts:', theftAlerts.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <MetricsCards metrics={metrics} />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Visitors Over Time</h2>
          <VisitorsChart data={visitorsData} />
        </div>

        <HistoricalRecords />

        <TheftAlertLog alerts={theftAlerts} />
      </div>
    </div>
  );
};

export default Index;
