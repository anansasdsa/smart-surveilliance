-- Add sample data for average dwell time calculation
-- This populates the interest_events table with realistic duration data

-- Clear existing interest_events data (optional)
-- DELETE FROM public.interest_events;

-- Insert sample interest events with various durations (in seconds)
-- These represent customers showing interest in products
-- Note: date column is generated automatically from timestamp
INSERT INTO public.interest_events (timestamp, duration, camera_id, person_id) VALUES
  -- Today's data
  (now() - INTERVAL '2 hours 30 minutes', 180, 'Show Table Zone', 'person_001'),
  (now() - INTERVAL '2 hours 15 minutes', 240, 'Show Table Zone', 'person_002'),
  (now() - INTERVAL '2 hours', 120, 'Show Table Zone', 'person_003'),
  (now() - INTERVAL '1 hour 45 minutes', 300, 'Show Table Zone', 'person_004'),
  (now() - INTERVAL '1 hour 30 minutes', 90, 'Show Table Zone', 'person_005'),
  (now() - INTERVAL '1 hour 15 minutes', 210, 'Show Table Zone', 'person_006'),
  (now() - INTERVAL '1 hour', 150, 'Show Table Zone', 'person_007'),
  (now() - INTERVAL '45 minutes', 180, 'Show Table Zone', 'person_008'),
  (now() - INTERVAL '30 minutes', 270, 'Show Table Zone', 'person_009'),
  (now() - INTERVAL '15 minutes', 120, 'Show Table Zone', 'person_010'),
  (now() - INTERVAL '10 minutes', 200, 'Show Table Zone', 'person_011'),
  (now() - INTERVAL '5 minutes', 160, 'Show Table Zone', 'person_012'),
  
  -- Yesterday's data
  (now() - INTERVAL '1 day 2 hours', 220, 'Show Table Zone', 'person_013'),
  (now() - INTERVAL '1 day 1 hour 45 minutes', 190, 'Show Table Zone', 'person_014'),
  (now() - INTERVAL '1 day 1 hour 30 minutes', 280, 'Show Table Zone', 'person_015'),
  (now() - INTERVAL '1 day 1 hour 15 minutes', 140, 'Show Table Zone', 'person_016'),
  (now() - INTERVAL '1 day 1 hour', 320, 'Show Table Zone', 'person_017'),
  (now() - INTERVAL '1 day 45 minutes', 170, 'Show Table Zone', 'person_018'),
  (now() - INTERVAL '1 day 30 minutes', 250, 'Show Table Zone', 'person_019'),
  (now() - INTERVAL '1 day 15 minutes', 110, 'Show Table Zone', 'person_020'),
  
  -- 2 days ago data
  (now() - INTERVAL '2 days 3 hours', 200, 'Show Table Zone', 'person_021'),
  (now() - INTERVAL '2 days 2 hours 45 minutes', 160, 'Show Table Zone', 'person_022'),
  (now() - INTERVAL '2 days 2 hours 30 minutes', 290, 'Show Table Zone', 'person_023'),
  (now() - INTERVAL '2 days 2 hours 15 minutes', 130, 'Show Table Zone', 'person_024'),
  (now() - INTERVAL '2 days 2 hours', 180, 'Show Table Zone', 'person_025'),
  (now() - INTERVAL '2 days 1 hour 45 minutes', 240, 'Show Table Zone', 'person_026'),
  (now() - INTERVAL '2 days 1 hour 30 minutes', 150, 'Show Table Zone', 'person_027'),
  (now() - INTERVAL '2 days 1 hour 15 minutes', 310, 'Show Table Zone', 'person_028'),
  (now() - INTERVAL '2 days 1 hour', 100, 'Show Table Zone', 'person_029'),
  (now() - INTERVAL '2 days 45 minutes', 220, 'Show Table Zone', 'person_030'),
  
  -- 3 days ago data
  (now() - INTERVAL '3 days 4 hours', 170, 'Show Table Zone', 'person_031'),
  (now() - INTERVAL '3 days 3 hours 45 minutes', 260, 'Show Table Zone', 'person_032'),
  (now() - INTERVAL '3 days 3 hours 30 minutes', 140, 'Show Table Zone', 'person_033'),
  (now() - INTERVAL '3 days 3 hours 15 minutes', 190, 'Show Table Zone', 'person_034'),
  (now() - INTERVAL '3 days 3 hours', 230, 'Show Table Zone', 'person_035'),
  (now() - INTERVAL '3 days 2 hours 45 minutes', 120, 'Show Table Zone', 'person_036'),
  (now() - INTERVAL '3 days 2 hours 30 minutes', 280, 'Show Table Zone', 'person_037'),
  (now() - INTERVAL '3 days 2 hours 15 minutes', 160, 'Show Table Zone', 'person_038'),
  (now() - INTERVAL '3 days 2 hours', 210, 'Show Table Zone', 'person_039'),
  (now() - INTERVAL '3 days 1 hour 45 minutes', 180, 'Show Table Zone', 'person_040'),
  
  -- 4 days ago data
  (now() - INTERVAL '4 days 5 hours', 250, 'Show Table Zone', 'person_041'),
  (now() - INTERVAL '4 days 4 hours 45 minutes', 130, 'Show Table Zone', 'person_042'),
  (now() - INTERVAL '4 days 4 hours 30 minutes', 200, 'Show Table Zone', 'person_043'),
  (now() - INTERVAL '4 days 4 hours 15 minutes', 170, 'Show Table Zone', 'person_044'),
  (now() - INTERVAL '4 days 4 hours', 290, 'Show Table Zone', 'person_045'),
  (now() - INTERVAL '4 days 3 hours 45 minutes', 110, 'Show Table Zone', 'person_046'),
  (now() - INTERVAL '4 days 3 hours 30 minutes', 240, 'Show Table Zone', 'person_047'),
  (now() - INTERVAL '4 days 3 hours 15 minutes', 150, 'Show Table Zone', 'person_048'),
  (now() - INTERVAL '4 days 3 hours', 220, 'Show Table Zone', 'person_049'),
  (now() - INTERVAL '4 days 2 hours 45 minutes', 180, 'Show Table Zone', 'person_050');

-- This will give you a realistic average dwell time around 190-200 seconds (3+ minutes)
-- The data spans 5 days with varying durations to simulate real customer behavior 