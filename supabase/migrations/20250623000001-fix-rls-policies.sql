-- Fix RLS policies to allow anonymous read access
-- This is needed for the frontend to work with the anon key

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access to analytics_summary" ON public.analytics_summary;
DROP POLICY IF EXISTS "Allow anonymous insert access to analytics_summary" ON public.analytics_summary;
DROP POLICY IF EXISTS "Allow anonymous update access to analytics_summary" ON public.analytics_summary;

DROP POLICY IF EXISTS "Allow anonymous read access to theft_alerts" ON public.theft_alerts;
DROP POLICY IF EXISTS "Allow anonymous insert access to theft_alerts" ON public.theft_alerts;

DROP POLICY IF EXISTS "Allow anonymous read access to visitor_sessions" ON public.visitor_sessions;
DROP POLICY IF EXISTS "Allow anonymous insert access to visitor_sessions" ON public.visitor_sessions;

DROP POLICY IF EXISTS "Allow anonymous read access to interest_events" ON public.interest_events;
DROP POLICY IF EXISTS "Allow anonymous insert access to interest_events" ON public.interest_events;

-- Create new policies that allow anonymous read access
CREATE POLICY "Allow anonymous read access to analytics_summary"
  ON public.analytics_summary
  FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert access to analytics_summary"
  ON public.analytics_summary
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to analytics_summary"
  ON public.analytics_summary
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow anonymous read access to theft_alerts"
  ON public.theft_alerts
  FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert access to theft_alerts"
  ON public.theft_alerts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous read access to visitor_sessions"
  ON public.visitor_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert access to visitor_sessions"
  ON public.visitor_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous read access to interest_events"
  ON public.interest_events
  FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert access to interest_events"
  ON public.interest_events
  FOR INSERT
  WITH CHECK (true);

-- Also ensure storage policies allow public read access
CREATE POLICY "Allow public read access to theftsnapshots"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'theftsnapshots');

CREATE POLICY "Allow authenticated users to upload theftsnapshots"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'theftsnapshots' AND
    auth.role() = 'authenticated'
  ); 