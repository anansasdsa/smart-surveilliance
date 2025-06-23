-- Create notifications table to track read status
-- This will persist notification read status across page refreshes

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theft_alert_id UUID REFERENCES public.theft_alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(theft_alert_id, user_id)
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications table
CREATE POLICY "Allow anonymous read access to notifications"
  ON public.notifications
  FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert access to notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to notifications"
  ON public.notifications
  FOR UPDATE
  USING (true);

-- Create function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(user_uuid UUID DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.notifications 
  SET read_at = now()
  WHERE (user_id = user_uuid OR user_uuid IS NULL)
    AND read_at IS NULL;
END;
$$;

-- Create function to mark specific notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(alert_uuid UUID, user_uuid UUID DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.notifications (theft_alert_id, user_id, read_at)
  VALUES (alert_uuid, user_uuid, now())
  ON CONFLICT (theft_alert_id, user_id) 
  DO UPDATE SET read_at = now();
END;
$$; 