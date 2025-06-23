// Supabase Edge Function: send-theft-push-notification
import { serve } from 'std/server';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'https://esm.sh/web-push@3.5.4';

// TODO: Replace with your VAPID keys
const VAPID_PUBLIC_KEY = 'BP1KvsZu5HKQMjfh03c8_4o83pv4tYRYkxiavvi2JbaV-57-DZkBnO7k1FuisKWlUYGfT2ZzmqrhqR7U-BmiRlk';
const VAPID_PRIVATE_KEY = 'lNdx4gKgI5-Qx_JcVQm7Oj5LpddMpxX_vKnOIUJvkU4';
const VAPID_SUBJECT = 'mailto:your@email.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

serve(async (req) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Parse request body
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { title, body: notifBody, url } = body;

  // Create Supabase client
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Get all push subscriptions
  const { data: subs, error } = await supabase.from('push_subscriptions').select('*');
  if (error) {
    return new Response('Failed to fetch subscriptions', { status: 500 });
  }

  // Send notification to each subscription
  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: sub.keys,
      }, JSON.stringify({
        title: title || 'Theft Alert!',
        body: notifBody || 'A theft alert has been triggered.',
        url: url || '/',
      }));
      sent++;
    } catch (err) {
      // Ignore errors for now (could be expired subscription)
    }
  }

  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } });
}); 