// Test script to check interest_events data
const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and service role key
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInterestEvents() {
  console.log('🔍 Testing interest_events table...');
  
  try {
    // Check if table exists and has data
    const { data, error } = await supabase
      .from('interest_events')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ Found', data.length, 'records in interest_events');
    console.log('📊 Sample data:', data);
    
    // Calculate average dwell time
    const { data: allData, error: avgError } = await supabase
      .from('interest_events')
      .select('duration');
    
    if (avgError) {
      console.error('❌ Error calculating average:', avgError);
      return;
    }
    
    if (allData && allData.length > 0) {
      const totalDuration = allData.reduce((sum, event) => sum + (event.duration || 0), 0);
      const averageDuration = Math.round(totalDuration / allData.length);
      console.log('📈 Total records:', allData.length);
      console.log('📈 Total duration:', totalDuration);
      console.log('📈 Average dwell time:', averageDuration, 'seconds');
      console.log('📈 Average dwell time:', Math.round(averageDuration / 60), 'minutes');
    } else {
      console.log('❌ No data found in interest_events table');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testInterestEvents(); 