import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { TheftAlertLog } from '../components/TheftAlertLog';
import { useAnalytics } from '../hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { VisitorsChart } from '../components/VisitorsChart';

interface DetailedHistoricalData {
  date: string;
  totalVisitors: number;
  interestedVisitors: number;
  avgDwellTime: string;
  theftAlerts: number;
  hourlyVisitors: Array<{ hour: number; visitors: number }>;
  theftAlertDetails: Array<{
    id: number;
    time: string;
    snapshot: string;
    location: string;
    confidence: number;
  }>;
  peakHour: number;
  conversionRate: number;
}

const Recent = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [detailedData, setDetailedData] = useState<DetailedHistoricalData | null>(null);
  const navigate = useNavigate();
  const { calculateAverageDwellTime, getInterestedChartData } = useAnalytics();

  // Load real detailed data when date is selected
  useEffect(() => {
    const loadDetailedData = async () => {
      if (!selectedDate) {
        setDetailedData(null);
        return;
      }

      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      console.log('Loading real detailed data for:', selectedDateStr);
      
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
          .eq('date', selectedDateStr)
          .order('timestamp', { ascending: false });

        if (alertsError) {
          console.error('Error fetching theft alerts:', alertsError);
        }

        // Get interested visitors for hourly breakdown
        const hourlyVisitors = await getInterestedChartData(selectedDateStr);
        let peakHour = 12;
        let maxVisitors = 0;
        if (hourlyVisitors && hourlyVisitors.length > 0) {
          hourlyVisitors.forEach(({ hour, visitors }) => {
            if (visitors > maxVisitors) {
              maxVisitors = visitors;
              peakHour = hour;
            }
          });
        }

        // Get average dwell time for the selected date
        const avgDwellTime = await calculateAverageDwellTime(selectedDateStr);

        // Format theft alerts
        const theftAlertDetails = (alertsData || []).map((alert, index) => ({
          id: index + 1,
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

        // Use real data from database
        const totalVisitors = analyticsData?.total_in || 0;
        const interestedVisitors = analyticsData?.total_interest || 0;
        const theftAlertsCount = alertsData?.length || 0;
        const conversionRate = totalVisitors > 0 ? Math.round((interestedVisitors / totalVisitors) * 100) : 0;

        setDetailedData({
          date: selectedDateStr,
          totalVisitors,
          interestedVisitors,
          avgDwellTime: avgDwellTime || '00:00',
          theftAlerts: theftAlertsCount,
          hourlyVisitors,
          theftAlertDetails,
          peakHour,
          conversionRate
        });

        console.log('Real detailed data loaded for', selectedDateStr, {
          totalVisitors,
          interestedVisitors,
          avgDwellTime,
          theftAlerts: theftAlertsCount,
          peakHour,
          conversionRate
        });

      } catch (error) {
        console.error('Error loading detailed data:', error);
        setDetailedData({
          date: selectedDateStr,
          totalVisitors: 0,
          interestedVisitors: 0,
          avgDwellTime: '00:00',
          theftAlerts: 0,
          hourlyVisitors: Array.from({ length: 13 }, (_, i) => ({ hour: i + 9, visitors: 0 })),
          theftAlertDetails: [],
          peakHour: 12,
          conversionRate: 0
        });
      }
    };

    loadDetailedData();
  }, [selectedDate, calculateAverageDwellTime, getInterestedChartData]);

  // Disable dates older than 1 month and future dates
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const isDateDisabled = (date: Date) => {
    return date > new Date() || date < oneMonthAgo;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Historical Data</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon size={20} />
              <span>Select Date</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                className="rounded-md border pointer-events-auto"
              />
            </div>
          </CardContent>
        </Card>

        {detailedData && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Visitors</h3>
                <p className="text-2xl font-bold text-blue-700">{detailedData.totalVisitors}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Interested Visitors</h3>
                <p className="text-2xl font-bold text-green-700">{detailedData.interestedVisitors}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Dwell Time</h3>
                <p className="text-2xl font-bold text-purple-700">{detailedData.avgDwellTime}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Peak Hour</h3>
                <p className="text-2xl font-bold text-orange-700">{detailedData.peakHour}:00</p>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Conversion Rate</h3>
                <p className="text-2xl font-bold text-teal-700">{detailedData.conversionRate}%</p>
              </div>
            </div>

            {/* Hourly Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Hourly Visitor Breakdown (Real Data)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <VisitorsChart data={detailedData.hourlyVisitors} />
                </div>
              </CardContent>
            </Card>

            {/* Theft Alerts Section */}
            {detailedData.theftAlerts > 0 ? (
              <div>
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-red-700">
                      Real Theft Alerts for {format(selectedDate, 'PPPP')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Total Theft Alerts</h3>
                      <p className="text-2xl font-bold text-red-700">{detailedData.theftAlerts}</p>
                    </div>
                  </CardContent>
                </Card>
                <TheftAlertLog alerts={detailedData.theftAlertDetails} />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">
                    Security Status for {format(selectedDate, 'PPPP')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <p className="text-lg font-medium text-green-700">No theft alerts recorded</p>
                    <p className="text-sm text-green-600 mt-2">This was a secure day with no incidents</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!selectedDate && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a date from the calendar above to view real database data</p>
                <p className="text-sm mt-2">All data comes directly from your Supabase database</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Recent;
