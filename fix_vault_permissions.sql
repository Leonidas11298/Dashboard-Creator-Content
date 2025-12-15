-- FIX PERMISSIONS
-- Ensure the vault_assets table allows Deletion and Insertion

-- 1. Enable RLS (Good practice)
alter table vault_assets enable row level security;

-- 2. Create a policy that allows EVERYTHING for now (since we don't have auth users yet)
-- This allows select, insert, update, delete for the 'anon' role.
create policy "Allow all operations for everyone"
on vault_assets
for all
using (true)
with check (true);
