-- INBOX SCHEMA

-- 1. Contacts (Unified Users from TG, OF, Sheer)
create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  platform_id text not null, -- External ID (e.g. TG user ID)
  platform text not null check (platform in ('telegram', 'of', 'sheer', 'other')),
  name text,
  avatar_url text,
  ltv numeric default 0,
  tags text[], -- Array of strings e.g. ['whale', 'sub']
  notes text,
  created_at timestamp with time zone default now()
);

-- 2. Conversations (Threads)
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  contact_id uuid references contacts(id),
  platform text not null, -- Denormalized for easy filtering
  last_message_preview text,
  updated_at timestamp with time zone default now(),
  unread_count int default 0,
  status text default 'active' -- active, archived
);

-- 3. Messages
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id),
  direction text not null check (direction in ('inbound', 'outbound')), -- 'inbound' (from user), 'outbound' (from me)
  content text,
  created_at timestamp with time zone default now(),
  is_read boolean default false
);

-- SEED DATA (For Testing)
-- Run this ONCE to populate some data
DO $$
DECLARE
  c_id uuid;
  conv_id uuid;
BEGIN
  -- 1. Create a Contact (DaddySteve)
  insert into contacts (platform_id, platform, name, avatar_url, ltv, tags)
  values ('u_12345', 'of', 'DaddySteve_99', 'https://picsum.photos/200', 12500, ARRAY['Whale', 'Submissive'])
  returning id into c_id;

  -- 2. Create Conversation
  insert into conversations (contact_id, platform, last_message_preview, unread_count)
  values (c_id, 'of', 'I sent the tip, did you get it?', 1)
  returning id into conv_id;

  -- 3. Create Messages
  insert into messages (conversation_id, direction, content, created_at)
  values 
    (conv_id, 'inbound', 'Hey goddess, are you online?', now() - interval '10 minutes'),
    (conv_id, 'outbound', 'Always for you babe.', now() - interval '5 minutes'),
    (conv_id, 'inbound', 'I sent the tip, did you get it?', now());

END $$;
