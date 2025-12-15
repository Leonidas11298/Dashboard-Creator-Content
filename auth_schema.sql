
-- Add user_id to team_members to link with Supabase Auth
alter table team_members add column if not exists user_id uuid references auth.users(id);

-- Add unique constraint to ensure one member profile per auth user
alter table team_members add constraint team_members_user_id_key unique (user_id);

-- RLS Policies (Basic)
alter table team_members enable row level security;

-- Allow users to view all team members (so they can see who they are chatting with)
create policy "View all team members"
on team_members for select
using (true);

-- Allow users to update ONLY their own profile (status, etc.)
create policy "Update own profile"
on team_members for update
using (auth.uid() = user_id);

-- Allow insert is tricky without an admin panel, for now let's assume public or admin only
-- create policy "Admin insert" ...
