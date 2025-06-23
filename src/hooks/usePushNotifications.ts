import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert } from '@/integrations/supabase/types';

// Replace with your own VAPID public key (Base64 URL-encoded)
const VAPID_PUBLIC_KEY = 'BP1KvsZu5HKQMjfh03c8_4o83pv4tYRYkxiavvi2JbaV-57-DZkBnO7k1FuisKWlUYGfT2ZzmqrhqR7U-BmiRlk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(userId: string | null) {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return;
    }

    async function subscribe() {
      try {
        // Register service worker
        const reg = await navigator.serviceWorker.register('/sw.js');
        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('Notification permission not granted');
          return;
        }
        // Subscribe to push
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        // Save subscription to Supabase
        const subData: TablesInsert<'push_subscriptions'> = {
          endpoint: sub.endpoint,
          keys: sub.toJSON().keys,
          user_id: userId || null,
        };
        await supabase.from('push_subscriptions').upsert(subData);
        console.log('Push subscription saved to Supabase');
      } catch (err) {
        console.error('Push subscription error:', err);
      }
    }

    subscribe();
  }, [userId]);
} 