-- Empire Resort — Owners Census System
-- 0004_rls.sql — Row Level Security. This is the real access-control
-- layer: every rule here is enforced by Postgres itself, independent of
-- the frontend, so a direct PostgREST/API call is bound by exactly the
-- same rules as the app UI.

alter table project_stages enable row level security;
alter table units enable row level security;
alter table owners enable row level security;
alter table owner_names enable row level security;
alter table owner_phones enable row level security;
alter table topic_responses enable row level security;
alter table main_position_responses enable row level security;
alter table participation_responses enable row level security;
alter table payment_status enable row level security;
alter table volunteers enable row level security;
alter table contact_attempts enable row level security;
alter table user_roles enable row level security;
alter table audit_logs enable row level security;

-- Baseline table grants. RLS still filters every row; these grants only
-- say which *operations* are even on the table for `authenticated` before
-- RLS is evaluated. `anon` gets nothing anywhere in this system — there is
-- no unauthenticated read path.
revoke all on all tables in schema public from anon;
grant usage on schema public to authenticated;

grant select on project_stages, units to authenticated;
grant select, insert, update, delete on owners to authenticated;
grant select, insert, update, delete on owner_names to authenticated;
grant select, insert, update, delete on owner_phones to authenticated;
grant select, insert, update, delete on topic_responses to authenticated;
grant select, insert, update, delete on main_position_responses to authenticated;
grant select, insert, update, delete on participation_responses to authenticated;
grant select, insert, update, delete on payment_status to authenticated;
grant select, insert, update, delete on volunteers to authenticated;
grant select, insert on contact_attempts to authenticated;
grant select on user_roles to authenticated;
-- audit_logs: SELECT only. No INSERT/UPDATE/DELETE grant to any app role,
-- ever — the only writer is the SECURITY DEFINER trigger in 0003_audit.sql.
grant select on audit_logs to authenticated;

-- ── project_stages / units ──────────────────────────────────────────────
create policy stages_select_all on project_stages for select to authenticated using (true);
create policy stages_write_admin on project_stages for all to authenticated
  using (is_admin_or_manager()) with check (is_admin_or_manager());

create policy units_select_all on units for select to authenticated using (true);
create policy units_write_admin on units for all to authenticated
  using (is_admin_or_manager()) with check (is_admin_or_manager());

-- ── owners (statistical/operational fields, no personal data) ──────────
create policy owners_select_admin on owners for select to authenticated
  using (is_admin_or_manager());

create policy owners_select_volunteer on owners for select to authenticated
  using (
    current_app_role() = 'volunteer'
    and unit_id in (select id from units where stage_id = current_volunteer_stage_id())
  );

create policy owners_select_self on owners for select to authenticated
  using (auth_user_id = auth.uid());

create policy owners_insert on owners for insert to authenticated
  with check (auth_user_id = auth.uid() or is_admin_or_manager());

create policy owners_update on owners for update to authenticated
  using (auth_user_id = auth.uid() or is_admin_or_manager())
  with check (auth_user_id = auth.uid() or is_admin_or_manager());
  -- Note: trg_guard_owner_privileged_fields (0002_helpers.sql) further blocks
  -- a plain owner from changing verification_status / unit_id / auth_user_id
  -- even though this policy lets them update their own row.

create policy owners_delete_admin on owners for delete to authenticated
  using (is_admin_or_manager());

-- ── owner_names (personal: name) ────────────────────────────────────────
create policy owner_names_select on owner_names for select to authenticated
  using (
    is_admin_or_manager()
    or owner_id = current_owner_id()
    or (
      current_app_role() = 'volunteer'
      and owner_id in (
        select o.id from owners o
        join units u on u.id = o.unit_id
        where u.stage_id = current_volunteer_stage_id()
      )
    )
  );

create policy owner_names_write on owner_names for insert to authenticated
  with check (is_admin_or_manager() or owner_id = current_owner_id());
create policy owner_names_update on owner_names for update to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id())
  with check (is_admin_or_manager() or owner_id = current_owner_id());
create policy owner_names_delete on owner_names for delete to authenticated
  using (is_admin_or_manager());

-- ── owner_phones (personal & most sensitive: phone — NEVER to volunteer/viewer) ──
create policy owner_phones_select on owner_phones for select to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id());
create policy owner_phones_write on owner_phones for insert to authenticated
  with check (is_admin_or_manager() or owner_id = current_owner_id());
create policy owner_phones_update on owner_phones for update to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id())
  with check (is_admin_or_manager() or owner_id = current_owner_id());
create policy owner_phones_delete on owner_phones for delete to authenticated
  using (is_admin_or_manager());

-- ── survey response tables: owner sees/writes only their own; admin sees all;
--    volunteer and viewer see NEITHER row directly (viewer uses the
--    aggregated owners_public_stats view in 0005_views.sql) ──
create policy topic_responses_select on topic_responses for select to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id());
create policy topic_responses_insert on topic_responses for insert to authenticated
  with check (is_admin_or_manager() or owner_id = current_owner_id());
create policy topic_responses_update on topic_responses for update to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id())
  with check (is_admin_or_manager() or owner_id = current_owner_id());
create policy topic_responses_delete on topic_responses for delete to authenticated
  using (is_admin_or_manager());

create policy main_position_select on main_position_responses for select to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id());
create policy main_position_insert on main_position_responses for insert to authenticated
  with check (is_admin_or_manager() or owner_id = current_owner_id());
create policy main_position_delete on main_position_responses for delete to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id());

create policy participation_select on participation_responses for select to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id());
create policy participation_insert on participation_responses for insert to authenticated
  with check (is_admin_or_manager() or owner_id = current_owner_id());
create policy participation_delete on participation_responses for delete to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id());

-- ── payment_status: separate from opinion, same access shape ────────────
create policy payment_status_select on payment_status for select to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id());
create policy payment_status_insert on payment_status for insert to authenticated
  with check (is_admin_or_manager() or owner_id = current_owner_id());
create policy payment_status_update on payment_status for update to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id())
  with check (is_admin_or_manager() or owner_id = current_owner_id());
create policy payment_status_delete on payment_status for delete to authenticated
  using (is_admin_or_manager());

-- ── volunteers ───────────────────────────────────────────────────────────
create policy volunteers_select on volunteers for select to authenticated
  using (is_admin_or_manager() or auth_user_id = auth.uid());
-- Anyone can register themselves as a CANDIDATE volunteer (auth_user_id =
-- self, assigned_stage_id left null); only admin/manager can set
-- assigned_stage_id, which is what actually grants the volunteer's
-- elevated read access via owners_select_volunteer / owner_names_select.
create policy volunteers_insert on volunteers for insert to authenticated
  with check (is_admin_or_manager() or (auth_user_id = auth.uid() and assigned_stage_id is null));
create policy volunteers_update on volunteers for update to authenticated
  using (is_admin_or_manager() or auth_user_id = auth.uid())
  with check (is_admin_or_manager() or auth_user_id = auth.uid());
create policy volunteers_delete_admin on volunteers for delete to authenticated
  using (is_admin_or_manager());

-- ── contact_attempts ─────────────────────────────────────────────────────
create policy contact_attempts_select on contact_attempts for select to authenticated
  using (
    is_admin_or_manager()
    or volunteer_id in (select id from volunteers where auth_user_id = auth.uid())
  );
create policy contact_attempts_insert on contact_attempts for insert to authenticated
  with check (
    is_admin_or_manager()
    or (
      volunteer_id in (select id from volunteers where auth_user_id = auth.uid())
      and owner_id in (
        select o.id from owners o
        join units u on u.id = o.unit_id
        where u.stage_id = current_volunteer_stage_id()
      )
    )
  );
-- No update/delete policy for anyone but admin — a contact log is an append-only trail.
create policy contact_attempts_admin_all on contact_attempts for all to authenticated
  using (is_admin_or_manager()) with check (is_admin_or_manager());

-- ── user_roles ───────────────────────────────────────────────────────────
create policy user_roles_select on user_roles for select to authenticated
  using (is_admin_or_manager());
create policy user_roles_write on user_roles for insert to authenticated
  with check (is_super_admin());
create policy user_roles_update on user_roles for update to authenticated
  using (is_super_admin()) with check (is_super_admin());
create policy user_roles_delete on user_roles for delete to authenticated
  using (is_super_admin());

-- ── audit_logs: read-only for admin/manager, no write policy at all ─────
create policy audit_logs_select on audit_logs for select to authenticated
  using (is_admin_or_manager());
