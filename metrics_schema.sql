-- METRICS SCHEMA
-- Stores daily snapshots of social performance

create table if not exists platform_metrics (
  id uuid default gen_random_uuid() primary key,
  date date not null default current_date,
  platform text not null check (platform in ('tiktok', 'instagram', 'twitter', 'facebook', 'telegram', 'youtube')),
  followers int default 0, -- Subscribers for Telegram
  views int default 0,     -- Reach/Impressions
  revenue numeric default 0,
  created_at timestamp with time zone default now(),
  unique(date, platform) -- Prevents duplicate logs for the same day/platform
);

-- OPTIONAL: SEED DATA (Fake history for visualization)
insert into platform_metrics (date, platform, followers, views, revenue)
values 
(current_date - interval '3 days', 'tiktok', 15000, 5000, 0),
(current_date - interval '2 days', 'tiktok', 15200, 12000, 10),
(current_date - interval '1 days', 'tiktok', 15500, 8000, 5),
(current_date, 'tiktok', 16000, 25000, 20),

(current_date - interval '3 days', 'telegram', 500, 400, 50),
(current_date - interval '2 days', 'telegram', 510, 450, 60),
(current_date - interval '1 days', 'telegram', 525, 600, 100),
(current_date, 'telegram', 550, 800, 120);
