-- FINAL PERMISSIONS FIX
-- Enables functionality for: Role Editing, Read Receipts, and Social Metrics saving.

-- 1. Enable RLS on all tables to be safe
alter table team_members enable row level security;
alter table team_messages enable row level security;
alter table content_posts enable row level security;
alter table platform_metrics enable row level security;
alter table goals enable row level security;
alter table transactions enable row level security;
alter table vault_assets enable row level security;

-- 2. TEAM MEMBERS (Role Changes)
-- First, drop restrictive 'update self' if it conflicts, or just add a new OR policy.
-- To be clean, we'll ensure a broad policy for admins exists.

create policy "Admins can update everyone"
on team_members for update
to authenticated
using (
  auth.uid() in (
    select user_id from team_members where role = 'admin'
  )
);

-- 3. TEAM MESSAGES (Read Receipts)
-- Allow users to update messages where they are the RECEIVER (to set is_read = true)
create policy "Receiver can update message status"
on team_messages for update
to authenticated
using (
  auth.uid() in (
    select user_id from team_members where id = receiver_id
  )
);

-- Allow everyone to Insert messages
create policy "Anyone can send messages"
on team_messages for insert
to authenticated
with check (true);

-- Allow everyone to Read messages (Simplification for MVP, ideal would be sender/receiver only)
create policy "Anyone can read messages"
on team_messages for select
to authenticated
using (true);

-- 4. DASHBOARD & SOCIAL (Metrics, Goals, Posts)
-- For this MVP, we will allow any authenticated team member to Manage Content & Metrics.
-- In a stricter system, you might restrict this to Editor/Manager roles.

create policy "Team can manage content_posts"
on content_posts for all
to authenticated
using (true)
with check (true);

create policy "Team can manage platform_metrics"
on platform_metrics for all
to authenticated
using (true)
with check (true);

create policy "Team can manage goals"
on goals for all
to authenticated
using (true)
with check (true);

create policy "Team can manage transactions"
on transactions for all
to authenticated
using (true)
with check (true);

create policy "Team can manage vault"
on vault_assets for all
to authenticated
using (true)
with check (true);
