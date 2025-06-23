import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VisitorSession {
  id: string;
  timestamp?: string;
  direction: string;
  person_id?: string;
  camera_id?: string;
  date?: string;
}

interface TheftAlert {
  id: string;
  timestamp?: string;
  snapshot_path: string;
  camera_id?: string;
  confidence?: number;
  alert_type?: string;
  person_id?: string;
  date?: string;
}

interface AnalyticsSummary {
  id: string;
  date: string;
  total_in: number;
  total_interest: number;
  total_out: number;
  total_theft: number;
}

interface InterestEvent {
  id: string;
  timestamp?: string;
  duration: number;
  person_id?: string;
  camera_id?: string;
  date?: string;
}

export const useAnalytics = () => {
  const { toast } = useToast();
  
  // Save visitor session to database
  const saveVisitorSession = async (sessionData: Omit<VisitorSession, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('visitor_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;
      
      console.log('Visitor session saved:', data);
      return data;
    } catch (error) {
      console.error('Error saving visitor session:', error);
      toast({
        title: "Error",
        description: "Failed to save visitor session",
        variant: "destructive",
      });
      return null;
    }
  };

  // Save theft alert to database with storage snapshot handling
  const saveTheftAlert = async (alertData: Omit<TheftAlert, 'id'>) => {
    try {
      // If snapshot_path doesn't start with http, assume it's a file in theftsnapshots bucket
      let finalSnapshotPath = alertData.snapshot_path;
      if (!finalSnapshotPath.startsWith('http')) {
        // Get public URL from theftsnapshots storage bucket
        const { data: { publicUrl } } = supabase.storage
          .from('theftsnapshots')
          .getPublicUrl(alertData.snapshot_path);
        finalSnapshotPath = publicUrl;
      }

      const { data, error } = await supabase
        .from('theft_alerts')
        .insert([{ ...alertData, snapshot_path: finalSnapshotPath }])
        .select()
        .single();

      if (error) throw error;
      
      console.log('Theft alert saved with storage snapshot:', data);
      toast({
        title: "Security Alert",
        description: "Theft alert recorded with snapshot",
      });
      return data;
    } catch (error) {
      console.error('Error saving theft alert:', error);
      toast({
        title: "Error",
        description: "Failed to save theft alert",
        variant: "destructive",
      });
      return null;
    }
  };

  // Save interest event to database
  const saveInterestEvent = async (eventData: Omit<InterestEvent, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('interest_events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;
      
      console.log('Interest event saved:', data);
      return data;
    } catch (error) {
      console.error('Error saving interest event:', error);
      toast({
        title: "Error",
        description: "Failed to save interest event",
        variant: "destructive",
      });
      return null;
    }
  };

  // Get recent theft alerts with storage snapshots
  const getRecentTheftAlerts = async (limit: number = 10) => {
    try {
      const { data, error } = await supabase
        .from('theft_alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      console.log('Retrieved theft alerts with snapshots:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching theft alerts:', error);
      return [];
    }
  };

  // Get analytics summary for today
  const getTodayAnalytics = async () => {
    try {
      // Fix: Use YYYY-MM-DD format to match database
      const today = new Date().toISOString().split('T')[0]; // This gives YYYY-MM-DD
      
      console.log('🔍 Debug: Looking for date in YYYY-MM-DD format:', today);
      
      // Only get today's data
      let { data, error } = await supabase
        .from('analytics_summary')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // No data for today, return zeros
        data = {
          id: 'none',
          date: today,
          total_in: 0,
          total_interest: 0,
          total_out: 0,
          total_theft: 0
        };
      }

      console.log('Today analytics from analytics_summary:', data);
      return data;
    } catch (error) {
      console.error('Error fetching today analytics:', error);
      return {
        id: 'none',
        date: new Date().toISOString().split('T')[0],
        total_in: 0,
        total_interest: 0,
        total_out: 0,
        total_theft: 0
      };
    }
  };

  // Update analytics summary for today
  const updateTodayAnalytics = async (metrics: {
    total_in: number;
    total_interest: number;
    total_out: number;
    total_theft: number;
  }) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('analytics_summary')
        .upsert([
          {
            date: today,
            ...metrics
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      console.log('Analytics summary updated:', data);
      return data;
    } catch (error) {
      console.error('Error updating analytics summary:', error);
      return null;
    }
  };

  // Upload snapshot to theftsnapshots storage bucket
  const uploadSnapshot = async (file: File, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('theftsnapshots')
        .upload(filename, file);

      if (error) throw error;
      
      // Get public URL from theftsnapshots bucket
      const { data: { publicUrl } } = supabase.storage
        .from('theftsnapshots')
        .getPublicUrl(filename);

      console.log('Snapshot uploaded to theftsnapshots bucket:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading snapshot to theftsnapshots:', error);
      toast({
        title: "Error",
        description: "Failed to upload snapshot to storage",
        variant: "destructive",
      });
      return null;
    }
  };

  // Calculate average dwell time from interest events for a specific date
  const calculateAverageDwellTime = async (date?: string) => {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      console.log('🔍 Debug: Calculating average dwell time for date:', targetDate);
      
      // Get data for the specific date only
      const { data, error } = await supabase
        .from('interest_events')
        .select('duration, timestamp')
        .eq('date', targetDate);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.log('🔍 Debug: No interest events data found for date:', targetDate);
        return '00:00';
      }
      
      console.log('🔍 Debug: Found', data.length, 'interest events for date:', targetDate);
      
      const totalDuration = data.reduce((sum, event) => sum + (event.duration || 0), 0);
      const averageDuration = Math.round(totalDuration / data.length);
      
      // Convert seconds to MM:SS format
      const minutes = Math.floor(averageDuration / 60);
      const seconds = averageDuration % 60;
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      console.log('🔍 Debug: Total duration:', totalDuration, 'Average:', averageDuration, 'Formatted:', formattedTime);
      return formattedTime;
    } catch (error) {
      console.error('Error calculating average dwell time:', error);
      return '00:00';
    }
  };

  // Get average dwell time for multiple dates (for historical records)
  const getDwellTimeForDates = async (dates: string[]) => {
    try {
      const results = [];
      
      for (const date of dates) {
        const dwellTime = await calculateAverageDwellTime(date);
        results.push({
          date,
          dwellTime
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error getting dwell times for multiple dates:', error);
      return [];
    }
  };

  // Get visitor data for chart (hourly breakdown)
  const getVisitorChartData = async (date?: string) => {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('visitor_sessions')
        .select('timestamp, direction')
        .eq('date', targetDate)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      
      // Initialize hourly data
      const hourlyData = {};
      for (let hour = 9; hour <= 21; hour++) {
        hourlyData[hour] = 0;
      }
      
      // Count visitors by hour
      if (data && data.length > 0) {
        data.forEach(session => {
          if (session.timestamp && session.direction === 'in') {
            const hour = new Date(session.timestamp).getHours();
            if (hourlyData[hour] !== undefined) {
              hourlyData[hour]++;
            }
          }
        });
      }
      
      // Convert to chart format
      const chartData = Object.keys(hourlyData).map(hour => ({
        hour: parseInt(hour),
        visitors: hourlyData[hour]
      }));
      
      console.log('Visitor chart data:', chartData);
      return chartData;
    } catch (error) {
      console.error('Error fetching visitor chart data:', error);
      // Return empty data if error
      return Array.from({ length: 13 }, (_, i) => ({
        hour: i + 9,
        visitors: 0
      }));
    }
  };

  // Get interested visitor data for chart (hourly breakdown)
  const getInterestedChartData = async (date?: string) => {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('interest_events')
        .select('timestamp')
        .eq('date', targetDate)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Initialize hourly data
      const hourlyData: { [hour: number]: number } = {};
      for (let hour = 9; hour <= 21; hour++) {
        hourlyData[hour] = 0;
      }

      // Count interest events by hour
      if (data && data.length > 0) {
        data.forEach(event => {
          if (event.timestamp) {
            const hour = new Date(event.timestamp).getHours();
            if (hourlyData[hour] !== undefined) {
              hourlyData[hour]++;
            }
          }
        });
      }

      // Convert to chart format
      const chartData = Object.keys(hourlyData).map(hour => ({
        hour: parseInt(hour),
        visitors: hourlyData[hour]
      }));

      console.log('Interested visitor chart data:', chartData);
      return chartData;
    } catch (error) {
      console.error('Error fetching interested visitor chart data:', error);
      // Return empty data if error
      return Array.from({ length: 13 }, (_, i) => ({
        hour: i + 9,
        visitors: 0
      }));
    }
  };

  return {
    saveVisitorSession,
    saveTheftAlert,
    saveInterestEvent,
    getRecentTheftAlerts,
    getTodayAnalytics,
    updateTodayAnalytics,
    uploadSnapshot,
    calculateAverageDwellTime,
    getDwellTimeForDates,
    getVisitorChartData,
    getInterestedChartData,
  };
};
