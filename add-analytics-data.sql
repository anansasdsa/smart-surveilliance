-- Add sample analytics_summary data for the dashboard
-- This will populate the total visitors and interested visitors metrics

-- Clear existing analytics_summary data (optional)
-- DELETE FROM public.analytics_summary;

-- Insert sample analytics data for the last 5 days
INSERT INTO public.analytics_summary (date, total_in, total_interest, total_out, total_theft) VALUES
  -- Today
  (CURRENT_DATE, 45, 12, 38, 2),
  
  -- Yesterday
  (CURRENT_DATE - INTERVAL '1 day', 52, 18, 45, 1),
  
  -- 2 days ago
  (CURRENT_DATE - INTERVAL '2 days', 38, 8, 35, 0),
  
  -- 3 days ago
  (CURRENT_DATE - INTERVAL '3 days', 61, 22, 58, 3),
  
  -- 4 days ago
  (CURRENT_DATE - INTERVAL '4 days', 47, 15, 42, 1)
ON CONFLICT (date) DO UPDATE SET
  total_in = EXCLUDED.total_in,
  total_interest = EXCLUDED.total_interest,
  total_out = EXCLUDED.total_out,
  total_theft = EXCLUDED.total_theft,
  updated_at = now();

-- This will give you realistic visitor counts:
-- Today: 45 total visitors, 12 interested visitors
-- Yesterday: 52 total visitors, 18 interested visitors
-- etc. 