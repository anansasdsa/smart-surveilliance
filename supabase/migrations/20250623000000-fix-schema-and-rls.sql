-- Fix database schema and RLS policies for anonymous access
-- This migration fixes the issues with the current schema

-- Drop existing tables if they exist (for clean slate)
DROP TABLE IF EXISTS public.analytics_summary CASCADE;
DROP TABLE IF EXISTS public.theft_alerts CASCADE;
DROP TABLE IF EXISTS public.visitor_sessions CASCADE;
DROP TABLE IF EXISTS public.interest_events CASCADE;

-- Create analytics_summary table with correct schema
CREATE TABLE public.analytics_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_in INTEGER DEFAULT 0,
  total_interest INTEGER DEFAULT 0,
  total_out INTEGER DEFAULT 0,
  total_theft INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Create theft_alerts table with correct schema
CREATE TABLE public.theft_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  snapshot_path TEXT NOT NULL,
  camera_id TEXT DEFAULT 'Show Table Zone',
  confidence INTEGER DEFAULT 0,
  alert_type TEXT DEFAULT 'theft',
  person_id TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visitor_sessions table with correct schema
CREATE TABLE public.visitor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  direction TEXT NOT NULL,
  person_id TEXT,
  camera_id TEXT DEFAULT 'Show Table Zone',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interest_events table with correct schema
CREATE TABLE public.interest_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration INTEGER NOT NULL DEFAULT 0,
  person_id TEXT,
  camera_id TEXT DEFAULT 'Show Table Zone',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theft_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interest_events ENABLE ROW LEVEL SECURITY;

-- Create policies that allow anonymous users to read data
-- This is needed for the dashboard to work without authentication

-- Analytics summary policies
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

-- Theft alerts policies
CREATE POLICY "Allow anonymous read access to theft_alerts"
  ON public.theft_alerts
  FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert access to theft_alerts"
  ON public.theft_alerts
  FOR INSERT
  WITH CHECK (true);

-- Visitor sessions policies
CREATE POLICY "Allow anonymous read access to visitor_sessions"
  ON public.visitor_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert access to visitor_sessions"
  ON public.visitor_sessions
  FOR INSERT
  WITH CHECK (true);

-- Interest events policies
CREATE POLICY "Allow anonymous read access to interest_events"
  ON public.interest_events
  FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert access to interest_events"
  ON public.interest_events
  FOR INSERT
  WITH CHECK (true);

-- Insert some sample data for testing
INSERT INTO public.analytics_summary (date, total_in, total_interest, total_out, total_theft) VALUES
  (CURRENT_DATE, 45, 12, 38, 2),
  (CURRENT_DATE - INTERVAL '1 day', 52, 18, 45, 1),
  (CURRENT_DATE - INTERVAL '2 days', 38, 8, 35, 0);

INSERT INTO public.theft_alerts (timestamp, snapshot_path, camera_id, confidence, alert_type) VALUES
  (now() - INTERVAL '2 hours', 'https://via.placeholder.com/300x200/ff0000/ffffff?text=Theft+Alert+1', 'Camera 1', 85, 'theft'),
  (now() - INTERVAL '1 hour', 'https://via.placeholder.com/300x200/ff0000/ffffff?text=Theft+Alert+2', 'Camera 2', 92, 'theft'),
  (now() - INTERVAL '30 minutes', 'https://via.placeholder.com/300x200/ff0000/ffffff?text=Theft+Alert+3', 'Camera 1', 78, 'theft');

INSERT INTO public.visitor_sessions (timestamp, direction, camera_id) VALUES
  (now() - INTERVAL '3 hours', 'in', 'Camera 1'),
  (now() - INTERVAL '2 hours 30 minutes', 'out', 'Camera 1'),
  (now() - INTERVAL '2 hours', 'in', 'Camera 2'),
  (now() - INTERVAL '1 hour 45 minutes', 'out', 'Camera 2');

INSERT INTO public.interest_events (timestamp, duration, camera_id) VALUES
  (now() - INTERVAL '3 hours', 180, 'Camera 1'),
  (now() - INTERVAL '2 hours 30 minutes', 240, 'Camera 2'),
  (now() - INTERVAL '2 hours', 120, 'Camera 1'),
  (now() - INTERVAL '1 hour 45 minutes', 300, 'Camera 2'); 