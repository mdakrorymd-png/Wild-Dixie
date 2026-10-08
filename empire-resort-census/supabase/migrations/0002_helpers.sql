-- Empire Resort — Owners Census System
-- 0002_helpers.sql
--
-- SECURITY DEFINER helper functions used by RLS policies.
-- They must be SECURITY DEFINER + not query through RLS themselves,
-- otherwise a policy on user_roles/owners that calls back into these
-- functions would recurse. Defined with a fixed search_path to avoid
-- search_path hijacking, and executable by `authenticated` only.

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from user_roles where auth_user_id = auth.uid();
$$;

create or replace function public.is_admin_or_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('super_admin', 'census_manager')
       from user_roles where auth_user_id = auth.uid()),
    false
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'super_admin' from user_roles where auth_user_id = auth.uid()),
    false
  );
$$;

-- The caller's own owners.id, or null if they have no owner record.
create or replace function public.current_owner_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from owners where auth_user_id = auth.uid();
$$;

-- The stage_id assigned to the caller if they are a volunteer, else null.
create or replace function public.current_volunteer_stage_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select assigned_stage_id from volunteers where auth_user_id = auth.uid();
$$;

revoke all on function public.current_app_role() from public;
revoke all on function public.is_admin_or_manager() from public;
revoke all on function public.is_super_admin() from public;
revoke all on function public.current_owner_id() from public;
revoke all on function public.current_volunteer_stage_id() from public;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin_or_manager() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.current_owner_id() to authenticated;
grant execute on function public.current_volunteer_stage_id() to authenticated;

-- Auto-assign the 'owner' app role the moment someone registers a unit,
-- so a brand-new self-reported registration is immediately governed by
-- the 'owner' RLS policies — no admin action, no pending gate (see spec §4).
create or replace function public.assign_owner_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into user_roles (auth_user_id, role)
  values (new.auth_user_id, 'owner')
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

create trigger trg_assign_owner_role
  after insert on owners
  for each row
  execute function public.assign_owner_role();

-- Owners must not be able to re-verify themselves or move to another unit
-- after the fact. Only super_admin / census_manager may change
-- verification_status or unit_id once the row exists.
create or replace function public.guard_owner_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_or_manager() then
    if new.verification_status is distinct from old.verification_status
       or new.unit_id is distinct from old.unit_id
       or new.auth_user_id is distinct from old.auth_user_id then
      raise exception 'Only census managers may change verification status, unit, or account linkage';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_guard_owner_privileged_fields
  before update on owners
  for each row
  execute function public.guard_owner_privileged_fields();

-- A volunteer must not be able to assign themselves to a stage — that
-- decision (and the elevated read access it grants) belongs to
-- census_manager/super_admin only.
create or replace function public.guard_volunteer_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_or_manager() then
    if new.assigned_stage_id is distinct from old.assigned_stage_id
       or new.auth_user_id is distinct from old.auth_user_id then
      raise exception 'Only census managers may assign a volunteer to a stage';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_guard_volunteer_privileged_fields
  before update on volunteers
  for each row
  execute function public.guard_volunteer_privileged_fields();
