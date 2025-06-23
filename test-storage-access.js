// Test storage bucket access directly
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ltxmzkbbkeqxujshlwor.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eG16a2Jia2VxeHVqc2hsd29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTk2ODUsImV4cCI6MjA2NjA3NTY4NX0.bAD2qup_F7FxPB7JO8gF_J4R7qgiXQUxPH4fXpjUpKc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testStorageAccess() {
  console.log('🔍 Testing storage bucket access...\n');

  try {
    // Test 1: List files in the bucket
    console.log('📁 Testing bucket listing...');
    const { data: files, error: listError } = await supabase.storage
      .from('theftsnapshots')
      .list('theft_snapshots');

    if (listError) {
      console.error('❌ Error listing files:', listError);
    } else {
      console.log('✅ Files found:', files?.length || 0);
      files?.forEach((file, index) => {
        console.log(`  File ${index + 1}:`, file.name);
      });
    }

    // Test 2: Get public URL for a specific file
    if (files && files.length > 0) {
      const testFile = files[0].name;
      console.log(`\n🔗 Testing public URL for: ${testFile}`);
      
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('theftsnapshots')
        .getPublicUrl(`theft_snapshots/${testFile}`);

      if (urlError) {
        console.error('❌ Error getting public URL:', urlError);
      } else {
        console.log('✅ Public URL:', publicUrl);
        
        // Test 3: Try to fetch the image
        console.log('🌐 Testing image fetch...');
        try {
          const response = await fetch(publicUrl);
          console.log('📊 Response status:', response.status);
          console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
          
          if (response.ok) {
            console.log('✅ Image is accessible!');
          } else {
            console.log('❌ Image not accessible');
            const text = await response.text();
            console.log('📄 Response body:', text.substring(0, 200));
          }
        } catch (fetchError) {
          console.error('❌ Fetch error:', fetchError.message);
        }
      }
    }

    // Test 4: Check bucket info
    console.log('\n🏪 Testing bucket info...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
    } else {
      const theftBucket = buckets?.find(b => b.name === 'theftsnapshots');
      if (theftBucket) {
        console.log('✅ Theftsnapshots bucket found:');
        console.log('  Name:', theftBucket.name);
        console.log('  Public:', theftBucket.public);
        console.log('  Created:', theftBucket.created_at);
      } else {
        console.log('❌ Theftsnapshots bucket not found');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testStorageAccess(); 