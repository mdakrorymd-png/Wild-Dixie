-- Empire Resort — Owners Census System
-- 0007_units_self_insert.sql
--
-- Registration switched from picking a unit off a pre-loaded list to free
-- text entry — no real 650-unit roster was ever provided (see README). An
-- owner now creates their own `units` row on registration if it doesn't
-- already exist (see app/onboarding/actions.ts). `units` carries no
-- personal data, so letting any authenticated user insert one is
-- low-risk; the real de-duplication guarantee still comes from
-- `units.unit_number` UNIQUE and `owners.unit_id` UNIQUE NOT NULL
-- (0001_schema.sql), enforced by Postgres regardless of who inserted the
-- row — and the app normalizes the text before insert/lookup so "A-101",
-- "a 101" and "A101" all resolve to the same unit.

create policy units_insert_self on units for insert to authenticated
  with check (true);
