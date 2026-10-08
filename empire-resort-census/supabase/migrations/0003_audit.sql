-- Empire Resort — Owners Census System
-- 0003_audit.sql
--
-- audit_logs is written EXCLUSIVELY by this trigger function, which runs
-- SECURITY DEFINER as the table owner (the migration role). Because the
-- table owner is exempt from RLS by default (we never issue `FORCE ROW
-- LEVEL SECURITY`), this insert always succeeds regardless of the
-- caller's RLS policies — while `authenticated`/`anon` have no INSERT,
-- UPDATE, or DELETE grant on audit_logs at all (see 0004_rls.sql), so no
-- API endpoint or direct PostgREST call can write or erase a log row.

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cols text[];
  col text;
  old_val text;
  new_val text;
begin
  if tg_op = 'INSERT' then
    insert into audit_logs (actor_auth_user_id, entity, entity_id, field, old_value, new_value)
    values (auth.uid(), tg_table_name, new.id, null, null, 'row created');
    return new;
  elsif tg_op = 'DELETE' then
    insert into audit_logs (actor_auth_user_id, entity, entity_id, field, old_value, new_value)
    values (auth.uid(), tg_table_name, old.id, null, 'row existed', null);
    return old;
  end if;

  -- UPDATE: log each column that actually changed.
  select array_agg(key) into cols
  from jsonb_each_text(to_jsonb(new))
  where to_jsonb(new) ->> key is distinct from to_jsonb(old) ->> key;

  if cols is not null then
    foreach col in array cols loop
      old_val := to_jsonb(old) ->> col;
      new_val := to_jsonb(new) ->> col;
      insert into audit_logs (actor_auth_user_id, entity, entity_id, field, old_value, new_value)
      values (auth.uid(), tg_table_name, new.id, col, old_val, new_val);
    end loop;
  end if;

  return new;
end;
$$;

create trigger trg_audit_owners
  after insert or update or delete on owners
  for each row execute function public.write_audit_log();

create trigger trg_audit_owner_names
  after insert or update or delete on owner_names
  for each row execute function public.write_audit_log();

create trigger trg_audit_owner_phones
  after insert or update or delete on owner_phones
  for each row execute function public.write_audit_log();

create trigger trg_audit_topic_responses
  after insert or update or delete on topic_responses
  for each row execute function public.write_audit_log();

create trigger trg_audit_main_position_responses
  after insert or update or delete on main_position_responses
  for each row execute function public.write_audit_log();

create trigger trg_audit_participation_responses
  after insert or update or delete on participation_responses
  for each row execute function public.write_audit_log();

create trigger trg_audit_payment_status
  after insert or update or delete on payment_status
  for each row execute function public.write_audit_log();

create trigger trg_audit_user_roles
  after insert or update or delete on user_roles
  for each row execute function public.write_audit_log();
