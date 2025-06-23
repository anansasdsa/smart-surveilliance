// Test script to verify Supabase connection and data
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ltxmzkbbkeqxujshlwor.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eG16a2Jia2VxeHVqc2hsd29yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQ5OTY4NSwiZXhwIjoyMDY2MDc1Njg1fQ.yxGWpqoZ-aKyDLPFx2iBAxtZnQafzqMQyN4mOqFCjCc";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testDatabase() {
  console.log('🔍 Testing Supabase connection with service role key...\n');

  try {
    // Test 1: Check all analytics_summary data
    console.log('📊 Testing analytics_summary table (ALL DATA)...');
    const { data: allAnalytics, error: allAnalyticsError } = await supabase
      .from('analytics_summary')
      .select('*');

    if (allAnalyticsError) {
      console.error('❌ Error fetching all analytics_summary:', allAnalyticsError);
    } else {
      console.log('✅ ALL analytics_summary data:', allAnalytics);
      console.log('📅 Number of rows:', allAnalytics?.length || 0);
    }

    // Test 2: Check today's analytics specifically
    console.log('\n📈 Testing today\'s analytics specifically...');
    const today = new Date().toISOString().split('T')[0];
    console.log('🔍 Looking for date:', today);
    
    const { data: todayAnalytics, error: todayError } = await supabase
      .from('analytics_summary')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (todayError) {
      console.error('❌ Error fetching today\'s analytics:', todayError);
    } else {
      console.log('✅ Today\'s analytics:', todayAnalytics);
      if (!todayAnalytics) {
        console.log('⚠️  No data found for today\'s date!');
      }
    }

    // Test 3: Check table structure
    console.log('\n🏗️  Checking table structure...');
    const { data: structure, error: structureError } = await supabase
      .from('analytics_summary')
      .select('*')
      .limit(1);

    if (structureError) {
      console.error('❌ Error checking structure:', structureError);
    } else if (structure && structure.length > 0) {
      console.log('✅ Table structure (first row columns):', Object.keys(structure[0]));
      console.log('📋 Sample data:', structure[0]);
    }

    // Test 4: Check theft_alerts table
    console.log('\n🚨 Testing theft_alerts table...');
    const { data: alerts, error: alertsError } = await supabase
      .from('theft_alerts')
      .select('*')
      .limit(5);

    if (alertsError) {
      console.error('❌ Error fetching theft_alerts:', alertsError);
    } else {
      console.log('✅ theft_alerts data:', alerts);
      console.log('🚨 Number of alerts:', alerts?.length || 0);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testDatabase(); 