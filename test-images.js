// Test script to check theft alert images
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ltxmzkbbkeqxujshlwor.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eG16a2Jia2VxeHVqc2hsd29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTk2ODUsImV4cCI6MjA2NjA3NTY4NX0.bAD2qup_F7FxPB7JO8gF_J4R7qgiXQUxPH4fXpjUpKc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testImages() {
  console.log('🔍 Testing theft alert images...\n');

  try {
    // Get theft alerts
    const { data: alerts, error } = await supabase
      .from('theft_alerts')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('❌ Error fetching alerts:', error);
      return;
    }

    console.log('✅ Theft alerts found:', alerts.length);
    
    alerts.forEach((alert, index) => {
      console.log(`\n📸 Alert ${index + 1}:`);
      console.log('  ID:', alert.id);
      console.log('  Time:', alert.timestamp);
      console.log('  Snapshot URL:', alert.snapshot_path);
      console.log('  Camera:', alert.camera_id);
      console.log('  Confidence:', alert.confidence);
      
      // Test if the image URL is accessible
      if (alert.snapshot_path) {
        console.log('  🔗 Testing image URL...');
        fetch(alert.snapshot_path)
          .then(response => {
            if (response.ok) {
              console.log('  ✅ Image URL is accessible');
            } else {
              console.log('  ❌ Image URL returned status:', response.status);
            }
          })
          .catch(err => {
            console.log('  ❌ Image URL error:', err.message);
          });
      }
    });

    // Also test storage bucket access
    console.log('\n🔍 Testing storage bucket access...');
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('theftsnapshots')
      .list('theft_snapshots');

    if (storageError) {
      console.error('❌ Storage error:', storageError);
    } else {
      console.log('✅ Storage files found:', storageFiles?.length || 0);
      if (storageFiles && storageFiles.length > 0) {
        storageFiles.forEach((file, index) => {
          console.log(`  File ${index + 1}:`, file.name);
          const { data: { publicUrl } } = supabase.storage
            .from('theftsnapshots')
            .getPublicUrl(`theft_snapshots/${file.name}`);
          console.log('  Public URL:', publicUrl);
        });
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testImages(); 