-- FORCE FIX RLS POLICIES
-- Run this in Supabase SQL Editor

-- 1. Enable RLS (Ensure it's on)
alter table team_members enable row level security;

-- 2. DROP conflicting policies (to clean up previous attempts)
drop policy if exists "Enable read access for authenticated users" on team_members;
drop policy if exists "Enable insert for users based on user_id" on team_members;
drop policy if exists "Enable update for users based on user_id" on team_members;
drop policy if exists "Team members can view messages" on team_members;

-- 3. RE-CREATE Permissive Policies for Registration

-- Allow ANY authenticated user to INSERT their own row
create policy "Allow insert for self"
on team_members for insert
to authenticated
with check (auth.uid() = user_id);

-- Allow ANY authenticated user to READ all members (public directory)
create policy "Allow read all"
on team_members for select
to authenticated
using (true);

-- Allow users to UPDATE only their own profile
create policy "Allow update self"
on team_members for update
to authenticated
using (auth.uid() = user_id);
