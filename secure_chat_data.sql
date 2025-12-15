-- SECURE CHAT DATA (RLS)
-- Enables security for Channels and Messages

-- 1. CHANNELS
alter table channels enable row level security;

-- Read: Everyone can read public channels
create policy "Read all channels"
on channels for select
to authenticated
using (true);

-- Insert/Update: Only Admins (requires checking role in team_members via user_id)
-- Note: This is a bit complex in RLS without a helper function, so for now we'll imply Trust or use a simple check.
-- Let's check if the user is linked to an 'admin' team_member row.
create policy "Admin manage channels"
on channels for all
to authenticated
using (
  auth.uid() in (
    select user_id from team_members where role = 'admin'
  )
);


-- 2. MESSAGES
alter table team_messages enable row level security;

-- Read: Authenticated users can read messages
create policy "Read messages"
on team_messages for select
to authenticated
using (true);

-- Insert: Users can only send messages as themselves
-- We check that the 'sender_id' in the message matches the 'id' of the team_member linked to 'auth.uid()'
create policy "Insert own messages"
on team_messages for insert
to authenticated
with check (
  sender_id in (
    select id from team_members where user_id = auth.uid()
  )
);
