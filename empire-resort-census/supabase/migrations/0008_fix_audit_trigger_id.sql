-- Empire Resort — Owners Census System
-- 0008_fix_audit_trigger_id.sql
--
-- Bug fix: write_audit_log() (0003_audit.sql) unconditionally read
-- new.id/old.id, but owner_names, owner_phones, and payment_status use
-- owner_id as their primary key instead of a separate id column. Any
-- INSERT/UPDATE/DELETE on those three tables crashed with
-- `record "new" has no field "id"` — this was never caught earlier
-- because it was never exercised against a live database until now.
--
-- Fix: fall back to owner_id when id doesn't exist on the row.

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
  row_id uuid;
begin
  if tg_op = 'INSERT' then
    row_id := coalesce((to_jsonb(new)->>'id')::uuid, (to_jsonb(new)->>'owner_id')::uuid);
    insert into audit_logs (actor_auth_user_id, entity, entity_id, field, old_value, new_value)
    values (auth.uid(), tg_table_name, row_id, null, null, 'row created');
    return new;
  elsif tg_op = 'DELETE' then
    row_id := coalesce((to_jsonb(old)->>'id')::uuid, (to_jsonb(old)->>'owner_id')::uuid);
    insert into audit_logs (actor_auth_user_id, entity, entity_id, field, old_value, new_value)
    values (auth.uid(), tg_table_name, row_id, null, 'row existed', null);
    return old;
  end if;

  row_id := coalesce((to_jsonb(new)->>'id')::uuid, (to_jsonb(new)->>'owner_id')::uuid);

  select array_agg(key) into cols
  from jsonb_each_text(to_jsonb(new))
  where to_jsonb(new) ->> key is distinct from to_jsonb(old) ->> key;

  if cols is not null then
    foreach col in array cols loop
      old_val := to_jsonb(old) ->> col;
      new_val := to_jsonb(new) ->> col;
      insert into audit_logs (actor_auth_user_id, entity, entity_id, field, old_value, new_value)
      values (auth.uid(), tg_table_name, row_id, col, old_val, new_val);
    end loop;
  end if;

  return new;
end;
$$;
