-- SERVER-SIDE TRIGGER FOR USER REGISTRATION
-- This bypasses Client-Side RLS issues by running on the database side with elevated privileges.

-- 1. Create the Function
create or replace function public.handle_new_user() 
returns trigger 
language plpgsql 
security definer set search_path = public
as $$
begin
  insert into public.team_members (user_id, name, role, status, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New Member'),
    'editor', -- Default role
    'online',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id
  );
  return new;
end;
$$;

-- 2. Create the Trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. (Optional) Cleanup any manual inserts if you had them, but this handles NEW users.
