-- Empire Resort — Owners Census System
-- 0006_maintenance_payments.sql
--
-- New feature: owners record their own "فروق صيانة" (maintenance fee
-- difference) payments for 2025 and 2026, each with an uploaded
-- receipt/transfer-proof image as evidence.
--
-- Kept separate from payment_status (0001_schema.sql), which is a single
-- self-reported stance on the older one-off 2000 EGP payment — this is a
-- per-year, append-only log of actual submitted proof, one row per
-- submission (an owner may submit more than once, e.g. partial payments).
--
-- Append-only by design, same principle as contact_attempts: no
-- update/delete grant to anyone, including admin. A wrong upload is
-- superseded by a new row, never edited — the receipt trail stays honest.

create table maintenance_payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) not null,
  charge_year text not null check (charge_year in ('2025', '2026')),
  amount_declared numeric,
  receipt_path text not null,   -- object path in the 'payment-receipts' storage bucket
  note text,
  created_at timestamptz default now()
);

alter table maintenance_payments enable row level security;

-- No update/delete grant to `authenticated` at all — immutable log.
grant select, insert on maintenance_payments to authenticated;

create policy maintenance_payments_select on maintenance_payments for select to authenticated
  using (is_admin_or_manager() or owner_id = current_owner_id());

-- Deliberately owner-only insert, even for admin/manager: this is the
-- owner's own submitted proof of payment, not something staff enter on
-- their behalf — matches the self-reported model used everywhere else.
create policy maintenance_payments_insert on maintenance_payments for insert to authenticated
  with check (owner_id = current_owner_id());

create trigger trg_audit_maintenance_payments
  after insert on maintenance_payments
  for each row execute function public.write_audit_log();

-- ── Storage: private bucket for receipt images ──────────────────────────
-- Not public — receipts are financial documents. Access goes only through
-- signed URLs the app generates for whoever the maintenance_payments RLS
-- policy above already allows to see that row (the owner themself, or
-- admin/manager).
insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

-- Object path convention: '{owner_id}/{charge_year}/{filename}'.
create policy payment_receipts_owner_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'payment-receipts'
    and (storage.foldername(name))[1] = current_owner_id()::text
  );

create policy payment_receipts_owner_select on storage.objects for select to authenticated
  using (
    bucket_id = 'payment-receipts'
    and (storage.foldername(name))[1] = current_owner_id()::text
  );

create policy payment_receipts_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'payment-receipts' and is_admin_or_manager());

-- No update/delete storage policy for anyone — matches the table's
-- immutability; a corrected receipt is a new upload + new row.
