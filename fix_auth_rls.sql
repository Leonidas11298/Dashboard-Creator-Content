-- Enable RLS on team_members (if not already handled)
alter table team_members enable row level security;

-- 1. Allow any authenticated user to READ team members (Public Directory)
create policy "Enable read access for authenticated users"
on team_members for select
to authenticated
using (true);

-- 2. Allow a user to CREATE their OWN profile (Critical for Registration)
create policy "Enable insert for users based on user_id"
on team_members for insert
to authenticated
with check (auth.uid() = user_id);

-- 3. Allow a user to UPDATE their OWN profile
create policy "Enable update for users based on user_id"
on team_members for update
to authenticated
using (auth.uid() = user_id);
