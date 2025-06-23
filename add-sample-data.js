// Script to add sample visitor session data
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ltxmzkbbkeqxujshlwor.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eG16a2Jia2VxeHVqc2hsd29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTk2ODUsImV4cCI6MjA2NjA3NTY4NX0.bAD2qup_F7FxPB7JO8gF_J4R7qgiXQUxPH4fXpjUpKc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addSampleData() {
  const today = new Date().toISOString().split('T')[0];
  
  // Sample visitor sessions for today (spread throughout the day)
  const sampleSessions = [
    { timestamp: `${today}T09:15:00Z`, direction: 'in', camera_id: 'Camera 1' },
    { timestamp: `${today}T10:30:00Z`, direction: 'in', camera_id: 'Camera 1' },
    { timestamp: `${today}T10:45:00Z`, direction: 'out', camera_id: 'Camera 1' },
    { timestamp: `${today}T11:20:00Z`, direction: 'in', camera_id: 'Camera 2' },
    { timestamp: `${today}T12:10:00Z`, direction: 'in', camera_id: 'Camera 1' },
    { timestamp: `${today}T12:45:00Z`, direction: 'out', camera_id: 'Camera 2' },
    { timestamp: `${today}T13:30:00Z`, direction: 'in', camera_id: 'Camera 1' },
    { timestamp: `${today}T14:15:00Z`, direction: 'in', camera_id: 'Camera 2' },
    { timestamp: `${today}T14:30:00Z`, direction: 'out', camera_id: 'Camera 1' },
    { timestamp: `${today}T15:45:00Z`, direction: 'in', camera_id: 'Camera 1' },
    { timestamp: `${today}T16:20:00Z`, direction: 'out', camera_id: 'Camera 2' },
    { timestamp: `${today}T17:10:00Z`, direction: 'in', camera_id: 'Camera 1' },
    { timestamp: `${today}T18:30:00Z`, direction: 'out', camera_id: 'Camera 1' },
    { timestamp: `${today}T19:15:00Z`, direction: 'in', camera_id: 'Camera 2' },
    { timestamp: `${today}T20:00:00Z`, direction: 'out', camera_id: 'Camera 2' },
  ];

  try {
    const { data, error } = await supabase
      .from('visitor_sessions')
      .insert(sampleSessions);

    if (error) {
      console.error('Error adding sample data:', error);
    } else {
      console.log('✅ Sample visitor sessions added successfully!');
      console.log('Added', sampleSessions.length, 'sessions');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addSampleData(); 