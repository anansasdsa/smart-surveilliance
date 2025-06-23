import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const DebugInfo = () => {
  const [debugData, setDebugData] = useState({
    analytics: null,
    alerts: null,
    loading: true,
    error: null,
    searchDate: '',
    allAnalytics: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Debug: Starting data fetch...');
        
        // Test analytics_summary
        const today = new Date().toISOString().split('T')[0]; // This should give YYYY-MM-DD
        console.log('🔍 Debug: Looking for date:', today);
        console.log('🔍 Debug: Date type:', typeof today);
        
        // First, get ALL analytics to see what dates exist
        const { data: allAnalytics, error: allError } = await supabase
          .from('analytics_summary')
          .select('*');

        console.log('🔍 Debug: ALL analytics:', allAnalytics);
        if (allAnalytics && allAnalytics.length > 0) {
          console.log('🔍 Debug: First row date:', allAnalytics[0].date);
          console.log('🔍 Debug: First row date type:', typeof allAnalytics[0].date);
        }

        // Then try to get today's specific data
        const { data: analytics, error: analyticsError } = await supabase
          .from('analytics_summary')
          .select('*')
          .eq('date', today)
          .maybeSingle();

        console.log('🔍 Debug: Today analytics result:', { analytics, analyticsError });

        // Test theft_alerts
        const { data: alerts, error: alertsError } = await supabase
          .from('theft_alerts')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(5);

        console.log('🔍 Debug: Alerts result:', { alerts, alertsError });

        setDebugData({
          analytics,
          alerts,
          loading: false,
          error: analyticsError || alertsError,
          searchDate: today,
          allAnalytics: allAnalytics || []
        });

      } catch (error) {
        console.error('🔍 Debug: Unexpected error:', error);
        setDebugData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    fetchData();
  }, []);

  if (debugData.loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-yellow-800 font-medium">🔍 Debug: Loading...</h3>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-blue-800 font-medium mb-2">🔍 Debug Information</h3>
      
      <div className="mb-3">
        <p className="text-blue-700 text-sm font-medium">Searching for date: <span className="bg-white px-2 py-1 rounded">{debugData.searchDate}</span></p>
      </div>

      {debugData.error && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
          <p className="text-red-800 text-sm">❌ Error: {debugData.error}</p>
        </div>
      )}

      <div className="space-y-2">
        <div>
          <p className="text-blue-700 text-sm font-medium">ALL Analytics Summary (all dates):</p>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto">
            {JSON.stringify(debugData.allAnalytics, null, 2)}
          </pre>
        </div>

        <div>
          <p className="text-blue-700 text-sm font-medium">Today's Analytics (specific date):</p>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto">
            {JSON.stringify(debugData.analytics, null, 2)}
          </pre>
        </div>

        <div>
          <p className="text-blue-700 text-sm font-medium">Theft Alerts:</p>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto">
            {JSON.stringify(debugData.alerts, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}; 