
-- Create visitor sessions table
CREATE TABLE public.visitor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  dwell_time_seconds INTEGER,
  is_interested BOOLEAN DEFAULT false,
  snapshot_url TEXT,
  location TEXT DEFAULT 'Show Table Zone',
  confidence_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create theft alerts table
CREATE TABLE public.theft_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  snapshot_url TEXT NOT NULL,
  location TEXT DEFAULT 'Show Table Zone',
  confidence_score INTEGER NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics summary table for daily aggregates
CREATE TABLE public.analytics_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_visitors INTEGER DEFAULT 0,
  interested_visitors INTEGER DEFAULT 0,
  avg_dwell_time_seconds INTEGER DEFAULT 0,
  theft_alerts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Create storage bucket for snapshots
INSERT INTO storage.buckets (id, name, public) VALUES ('snapshots', 'snapshots', true);

-- Enable RLS on tables
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theft_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing authenticated users to read/write)
CREATE POLICY "Authenticated users can manage visitor sessions" 
  ON public.visitor_sessions 
  FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage theft alerts" 
  ON public.theft_alerts 
  FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage analytics summary" 
  ON public.analytics_summary 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create policies for storage
CREATE POLICY "Authenticated users can upload snapshots" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'snapshots' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view snapshots" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'snapshots');
