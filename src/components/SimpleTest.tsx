import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const SimpleTest = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 SimpleTest: Starting fetch...');
        
        // Get the most recent analytics data
        const { data: analytics, error } = await supabase
          .from('analytics_summary')
          .select('*')
          .order('date', { ascending: false })
          .limit(1)
          .single();

        console.log('🔄 SimpleTest: Result:', { analytics, error });
        
        setData(analytics);
        setLoading(false);
      } catch (error) {
        console.error('🔄 SimpleTest: Error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="bg-green-100 p-4 rounded">🔄 Loading...</div>;
  }

  return (
    <div className="bg-green-100 p-4 rounded mb-4">
      <h3 className="font-bold text-green-800">✅ Simple Test - Direct Data</h3>
      <div className="mt-2">
        <p><strong>Total In:</strong> {data?.total_in || 'N/A'}</p>
        <p><strong>Total Interest:</strong> {data?.total_interest || 'N/A'}</p>
        <p><strong>Total Out:</strong> {data?.total_out || 'N/A'}</p>
        <p><strong>Total Theft:</strong> {data?.total_theft || 'N/A'}</p>
        <p><strong>Date:</strong> {data?.date || 'N/A'}</p>
      </div>
      <pre className="text-xs mt-2 bg-white p-2 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}; 