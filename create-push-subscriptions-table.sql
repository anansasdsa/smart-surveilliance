-- Create table for storing web push subscriptions
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  keys jsonb not null,
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null
); 