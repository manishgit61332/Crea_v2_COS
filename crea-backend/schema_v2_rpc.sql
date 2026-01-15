-- RPC: Create Organization and set current user as Owner
create or replace function public.create_organization(org_name text)
returns uuid
language plpgsql
security definer -- Runs with admin privileges to bypass RLS for the setup
as $$
declare
  new_org_id uuid;
begin
  -- 1. Create Organization
  insert into public.organizations (name)
  values (org_name)
  returning id into new_org_id;

  -- 2. Update User Profile
  update public.profiles
  set organization_id = new_org_id,
      role = 'owner'
  where id = auth.uid();

  return new_org_id;
end;
$$;
