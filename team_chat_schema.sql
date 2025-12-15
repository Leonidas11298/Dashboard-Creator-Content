-- TEAM CHAT SCHEMA
-- Replaces old 'inbox' with internal team coordination

-- 1. Team Members (Admins, Editors, etc.)
create table if not exists team_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text check (role in ('admin', 'editor', 'manager', 'assistant')),
  avatar_url text,
  status text default 'offline', -- 'online', 'busy', 'offline'
  created_at timestamp with time zone default now()
);

-- 2. Channels (Topics)
create table if not exists channels (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique, -- e.g. '#general', '#ideas'
  name text, 
  description text,
  type text default 'public', -- 'public', 'private'
  created_at timestamp with time zone default now()
);

-- 3. Messages (Linked to Channel OR DM)
create table if not exists team_messages (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references channels(id), -- Null if DM
  sender_id uuid references team_members(id),
  content text,
  created_at timestamp with time zone default now()
);

-- SEED DATA
DO $$
DECLARE
  admin_id uuid;
  editor_id uuid;
  gen_channel_id uuid;
  ideas_channel_id uuid;
BEGIN
  -- Create Members
  insert into team_members (name, role, avatar_url, status)
  values ('Creator (You)', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', 'online')
  returning id into admin_id;

  insert into team_members (name, role, avatar_url, status)
  values ('Alex (Editor)', 'editor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 'busy')
  returning id into editor_id;

  insert into team_members (name, role, avatar_url, status)
  values ('Sarah (Manager)', 'manager', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'offline');

  -- Create Channels
  insert into channels (slug, name, description) values ('general', 'General Chat', 'Team announcements and chill') returning id into gen_channel_id;
  insert into channels (slug, name, description) values ('content-ideas', 'Content Factory', 'Brainstorming session') returning id into ideas_channel_id;
  insert into channels (slug, name, description) values ('edits', 'Editing Room', 'Feedback on drafts');

  -- Seed Messages
  insert into team_messages (channel_id, sender_id, content) values 
  (gen_channel_id, admin_id, 'Welcome to the new HQ!'),
  (gen_channel_id, editor_id, 'Love the new setup. Ready to work.'),
  (ideas_channel_id, admin_id, 'We need 3 concepts for next week.');
  
END $$;
