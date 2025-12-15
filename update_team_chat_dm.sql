-- Add receiver_id for Direct Messages
alter table team_messages 
add column if not exists receiver_id uuid references team_members(id);

-- Add logic: 
-- If channel_id is NOT NULL, it's a channel message.
-- If receiver_id is NOT NULL, it's a DM (channel_id should be NULL).
