import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAnalytics } from '../hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { VisitorsChart } from './VisitorsChart';

interface HistoricalData {
  date: string;
  totalVisitors: number;
  interestedVisitors: number;
  avgDwellTime: string;
  theftAlerts: number;
  hourlyVisitors?: { hour: number; visitors: number }[];
}

export const HistoricalRecords = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  
  const { getTodayAnalytics, getRecentTheftAlerts, calculateAverageDwellTime } = useAnalytics();

  // Load historical data when date is selected
  useEffect(() => {
    const loadHistoricalData = async () => {
      if (!selectedDate) {
        setHistoricalData(null);
        return;
      }

      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      console.log('Loading historical data for:', selectedDateStr);
      
      try {
        // Get analytics data for the selected date
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('analytics_summary')
          .select('*')
          .eq('date', selectedDateStr)
          .single();

        if (analyticsError && analyticsError.code !== 'PGRST116') {
          console.error('Error fetching analytics:', analyticsError);
        }

        // Get theft alerts for the selected date
        const { data: alertsData, error: alertsError } = await supabase
          .from('theft_alerts')
          .select('*')
          .eq('date', selectedDateStr);

        if (alertsError) {
          console.error('Error fetching theft alerts:', alertsError);
        }

        // Get average dwell time for the selected date
        const avgDwellTime = await calculateAverageDwellTime(selectedDateStr);

        // Use data from analytics_summary or default to 0
        const totalVisitors = analyticsData?.total_in || 0;
        const interestedVisitors = analyticsData?.total_interest || 0;
        const theftAlertsCount = alertsData?.length || 0;

        setHistoricalData({
          date: selectedDateStr,
          totalVisitors,
          interestedVisitors,
          avgDwellTime: avgDwellTime || '00:00',
          theftAlerts: theftAlertsCount
        });

        console.log('Historical data loaded:', {
          date: selectedDateStr,
          totalVisitors,
          interestedVisitors,
          avgDwellTime,
          theftAlerts: theftAlertsCount
        });

      } catch (error) {
        console.error('Error loading historical data:', error);
        setHistoricalData({
          date: selectedDateStr,
          totalVisitors: 0,
          interestedVisitors: 0,
          avgDwellTime: '00:00',
          theftAlerts: 0
        });
      }
    };

    loadHistoricalData();
  }, [selectedDate, calculateAverageDwellTime]);

  // Disable dates older than 1 month and future dates
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const isDateDisabled = (date: Date) => {
    return date > new Date() || date < oneMonthAgo;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Historical Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Date</label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }}
                    disabled={isDateDisabled}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {historicalData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Total Visitors</h3>
                    <p className="text-2xl font-bold text-blue-700">{historicalData.totalVisitors}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Interested Visitors</h3>
                    <p className="text-2xl font-bold text-green-700">{historicalData.interestedVisitors}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Dwell Time</h3>
                    <p className="text-2xl font-bold text-purple-700">{historicalData.avgDwellTime}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Theft Alerts</h3>
                    <p className="text-2xl font-bold text-red-700">{historicalData.theftAlerts}</p>
                  </div>
                </div>
                {/* Hourly Breakdown Chart (if available) */}
                {historicalData.hourlyVisitors && historicalData.hourlyVisitors.length > 0 && (
                  <div className="mt-8">
                    <VisitorsChart data={historicalData.hourlyVisitors} />
                  </div>
                )}
              </>
            )}

            {selectedDate && !historicalData && (
              <div className="text-center text-gray-500 py-4">
                <p>Loading real data for {format(selectedDate, "PPP")}...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
