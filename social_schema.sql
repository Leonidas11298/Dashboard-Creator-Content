-- SOCIAL PLANNER SCHEMA

-- 1. Content Posts (Videos/Posts in progress)
create table if not exists content_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  platform text check (platform in ('tiktok', 'instagram', 'twitter', 'youtube', 'other')),
  status text not null check (status in ('idea', 'scripting', 'filming', 'editing', 'ready', 'posted')),
  scheduled_date timestamp with time zone,
  caption text,
  hashtags text[], -- e.g. ['#fyp', '#viral']
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- SEED DATA
insert into content_posts (title, platform, status, caption, hashtags)
values 
('Morning Routine', 'tiktok', 'idea', 'Showing my morning vibes', ARRAY['#morning', '#routine']),
('Q&A Sunday', 'instagram', 'scripting', 'Answering fan questions', ARRAY['#qanda', '#fans']),
('Custom Request for Steve', 'other', 'filming', 'Feet content', ARRAY['#custom']),
('Vlog: Behind the scenes', 'youtube', 'editing', 'Day in the life', ARRAY['#vlog', '#bts']);
