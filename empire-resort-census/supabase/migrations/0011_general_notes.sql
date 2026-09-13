-- Empire Resort — Owners Census System
-- 0011_general_notes.sql
--
-- A closing open-ended field for the survey, per explicit review feedback:
-- the 9 fixed topic sections can't anticipate every concern an owner
-- might have (security, facility upkeep, communication, subletting rules,
-- or anything else not on that list) — forcing an unrelated concern into
-- the wrong topic's box loses it. This is a genuine catch-all with no
-- fixed options, same shape as payment_status (one row per owner).

create table general_notes (
  owner_id uuid primary key references owners(id),
  note text,
  updated_at timestamptz default now()
);

alter table general_notes enable row level security;
grant select, insert, update, delete on general_notes to authenticated;

create policy general_notes_select on general_notes for select to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id());
create policy general_notes_insert on general_notes for insert to authenticated
  with check (is_admin_or_manager() or owner_id = current_owner_id());
create policy general_notes_update on general_notes for update to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id())
  with check (is_admin_or_manager() or owner_id = current_owner_id());
create policy general_notes_delete on general_notes for delete to authenticated
  using (is_admin_or_manager());

create trigger trg_audit_general_notes
  after insert or update or delete on general_notes
  for each row execute function public.write_audit_log();
