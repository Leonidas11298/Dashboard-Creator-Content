-- Add is_read status for proper notifications
alter table team_messages 
add column if not exists is_read boolean default false;
