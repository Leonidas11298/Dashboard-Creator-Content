-- FIX CHANNEL DELETION (SIMPLIFIED)
-- Reverts to using direct subqueries for maximum compatibility and debugging visibility.

-- 1. Drop old policies
drop policy if exists "Admin manage channels" on channels;
drop policy if exists "Read all channels" on channels;
drop policy if exists "Admin insert channels" on channels;
drop policy if exists "Admin update channels" on channels;
drop policy if exists "Admin delete channels" on channels;

-- 2. Drop the function if it exists (to clean up)
drop function if exists public.is_admin();

-- 3. Re-apply Policies using Subqueries
-- READ: Everyone
create policy "Read all channels"
on channels for select
to authenticated
using (true);

-- INSERT: Admin Only
create policy "Admin insert channels"
on channels for insert
to authenticated
with check (
  auth.uid() in ( select user_id from team_members where role = 'admin' )
);

-- UPDATE: Admin Only
create policy "Admin update channels"
on channels for update
to authenticated
using (
  auth.uid() in ( select user_id from team_members where role = 'admin' )
);

-- DELETE: Admin Only
create policy "Admin delete channels"
on channels for delete
to authenticated
using (
  auth.uid() in ( select user_id from team_members where role = 'admin' )
);
