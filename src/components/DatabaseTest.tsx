import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TestData {
  analytics: any[];
  alerts: any[];
  sessions: any[];
  events: any[];
  todayAnalytics: any;
  loading: boolean;
  error: string | null;
}

export const DatabaseTest = () => {
  const [testData, setTestData] = useState<TestData>({
    analytics: [],
    alerts: [],
    sessions: [],
    events: [],
    todayAnalytics: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const testDatabase = async () => {
      try {
        setTestData(prev => ({ ...prev, loading: true, error: null }));

        // Test analytics_summary
        const { data: analytics, error: analyticsError } = await supabase
          .from('analytics_summary')
          .select('*')
          .limit(5);

        if (analyticsError) throw new Error(`Analytics error: ${analyticsError.message}`);

        // Test theft_alerts
        const { data: alerts, error: alertsError } = await supabase
          .from('theft_alerts')
          .select('*')
          .limit(5);

        if (alertsError) throw new Error(`Alerts error: ${alertsError.message}`);

        // Test visitor_sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('visitor_sessions')
          .select('*')
          .limit(5);

        if (sessionsError) throw new Error(`Sessions error: ${sessionsError.message}`);

        // Test interest_events
        const { data: events, error: eventsError } = await supabase
          .from('interest_events')
          .select('*')
          .limit(5);

        if (eventsError) throw new Error(`Events error: ${eventsError.message}`);

        // Test today's analytics
        const today = new Date().toISOString().split('T')[0];
        const { data: todayAnalytics, error: todayError } = await supabase
          .from('analytics_summary')
          .select('*')
          .eq('date', today)
          .maybeSingle();

        if (todayError) throw new Error(`Today analytics error: ${todayError.message}`);

        setTestData({
          analytics: analytics || [],
          alerts: alerts || [],
          sessions: sessions || [],
          events: events || [],
          todayAnalytics,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Database test error:', error);
        setTestData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    testDatabase();
  }, []);

  if (testData.loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Connection Test</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Testing database connection...</p>
        </div>
      </div>
    );
  }

  if (testData.error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-900 mb-4">Database Connection Test - ERROR</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Connection Failed:</p>
          <p className="text-red-700 mt-1">{testData.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Connection Test - SUCCESS ✅</h2>
      
      <div className="space-y-6">
        {/* Today's Analytics */}
        <div>
          <h3 className="text-md font-medium text-gray-800 mb-2">Today's Analytics:</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <pre className="text-sm text-green-800 overflow-auto">
              {JSON.stringify(testData.todayAnalytics, null, 2)}
            </pre>
          </div>
        </div>

        {/* Analytics Summary */}
        <div>
          <h3 className="text-md font-medium text-gray-800 mb-2">Analytics Summary ({testData.analytics.length} records):</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <pre className="text-sm text-blue-800 overflow-auto">
              {JSON.stringify(testData.analytics, null, 2)}
            </pre>
          </div>
        </div>

        {/* Theft Alerts */}
        <div>
          <h3 className="text-md font-medium text-gray-800 mb-2">Theft Alerts ({testData.alerts.length} records):</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <pre className="text-sm text-red-800 overflow-auto">
              {JSON.stringify(testData.alerts, null, 2)}
            </pre>
          </div>
        </div>

        {/* Visitor Sessions */}
        <div>
          <h3 className="text-md font-medium text-gray-800 mb-2">Visitor Sessions ({testData.sessions.length} records):</h3>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <pre className="text-sm text-purple-800 overflow-auto">
              {JSON.stringify(testData.sessions, null, 2)}
            </pre>
          </div>
        </div>

        {/* Interest Events */}
        <div>
          <h3 className="text-md font-medium text-gray-800 mb-2">Interest Events ({testData.events.length} records):</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <pre className="text-sm text-yellow-800 overflow-auto">
              {JSON.stringify(testData.events, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}; 