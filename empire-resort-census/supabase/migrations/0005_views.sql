-- Empire Resort — Owners Census System
-- 0005_views.sql
--
-- Aggregate-only statistical views. These are the ONLY way the `viewer`
-- role (and everyone else, for dashboard purposes) sees census data — no
-- personal columns exist here, and every view excludes `disputed` rows
-- from the public count until a manager re-confirms them.
--
-- Owned by the migration role (table owner) and created with the default
-- security_invoker = false, so they run with the owner's privileges and
-- therefore bypass RLS on the underlying tables — this is what makes them
-- safe to expose broadly: the view itself is the security boundary,
-- because its SELECT list physically contains no personal column.

create view owners_public_stats
with (security_invoker = false)
as
select
  (select count(*) from units) as total_units,
  count(*) filter (where verification_status <> 'disputed') as total_registered,
  count(*) filter (where verification_status = 'confirmed') as total_confirmed,
  count(*) filter (where verification_status = 'self_reported') as total_self_reported,
  count(*) filter (where verification_status = 'disputed') as total_disputed,
  count(*) filter (where contact_status = 'تم التواصل' and verification_status <> 'disputed') as contacted_count,
  count(*) filter (where contact_status = 'لم يتم التواصل' and verification_status <> 'disputed') as not_contacted_count,
  count(*) filter (where census_status = 'مكتمل' and verification_status <> 'disputed') as census_complete_count,
  count(*) filter (where census_status = 'جزئي' and verification_status <> 'disputed') as census_partial_count,
  count(*) filter (where census_status = 'لم يبدأ' and verification_status <> 'disputed') as census_not_started_count
from owners;

create view stage_public_stats
with (security_invoker = false)
as
select
  ps.id as stage_id,
  ps.key as stage_key,
  ps.label as stage_label,
  ps.declared_unit_count,
  count(u.id) as unit_count,
  count(o.id) filter (where o.verification_status <> 'disputed') as registered_count,
  count(o.id) filter (where o.contact_status = 'تم التواصل' and o.verification_status <> 'disputed') as contacted_count,
  count(o.id) filter (where o.census_status = 'مكتمل' and o.verification_status <> 'disputed') as census_complete_count
from project_stages ps
left join units u on u.stage_id = ps.id
left join owners o on o.unit_id = u.id
group by ps.id, ps.key, ps.label, ps.declared_unit_count;

create view main_position_public_stats
with (security_invoker = false)
as
select
  mpr.position_text,
  count(*) as response_count,
  round(
    100.0 * count(*) / nullif((select count(*) from owners where verification_status <> 'disputed'), 0),
    1
  ) as response_percent
from main_position_responses mpr
join owners o on o.id = mpr.owner_id and o.verification_status <> 'disputed'
group by mpr.position_text;

create view payment_public_stats
with (security_invoker = false)
as
select
  ps.status,
  count(*) as owner_count,
  round(
    100.0 * count(*) / nullif((select count(*) from owners where verification_status <> 'disputed'), 0),
    1
  ) as owner_percent
from payment_status ps
join owners o on o.id = ps.owner_id and o.verification_status <> 'disputed'
group by ps.status;

create view participation_public_stats
with (security_invoker = false)
as
select
  pr.option_text,
  count(*) as response_count
from participation_responses pr
join owners o on o.id = pr.owner_id and o.verification_status <> 'disputed'
group by pr.option_text;

grant select on owners_public_stats, stage_public_stats, main_position_public_stats,
  payment_public_stats, participation_public_stats to authenticated;

-- units_available: lets any authenticated user see which units are still
-- unregistered (for the onboarding unit picker) WITHOUT exposing owners
-- rows or any personal data — a plain authenticated user has no RLS
-- access to `owners` at all, so this view is the only legitimate way to
-- know a unit is taken.
create view units_available
with (security_invoker = false)
as
select u.id, u.unit_number, u.stage_id, u.building, u.zone
from units u
where not exists (select 1 from owners o where o.unit_id = u.id);

grant select on units_available to authenticated;
