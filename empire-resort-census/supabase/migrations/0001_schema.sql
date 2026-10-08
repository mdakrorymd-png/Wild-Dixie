-- Empire Resort — Owners Census System
-- 0001_schema.sql
--
-- Core schema. Deliberate deviation from the literal spec DDL:
-- personal data (full_name, phone) is split into two SEPARATE tables
-- (owner_names, owner_phones) instead of columns on `owners`.
--
-- Why: Postgres RLS is ROW-level, not column-level. The access matrix
-- requires a volunteer to see an owner's name but NOT their phone for
-- units assigned to them, while a viewer sees neither. A single `owners`
-- row with both columns cannot express "show column A, hide column B"
-- through RLS alone — you'd need column-level GRANTs, which don't work
-- here because every authenticated user shares the same Postgres role
-- (`authenticated`); Supabase apps can't assign one Postgres role per
-- app-level role. Splitting into separate tables lets each one carry its
-- own row-level policy, which is real, table-level, unbypassable
-- enforcement — not a UI convention.

create extension if not exists pgcrypto;

-- project_stages
create table project_stages (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,              -- '2007' | '2010' | '2013'
  label text not null,                   -- 'المرحلة الأولى'
  declared_unit_count int,
  created_at timestamptz default now()
);

-- units (known in advance, no personal data)
create table units (
  id uuid primary key default gen_random_uuid(),
  unit_number text unique not null,
  stage_id uuid references project_stages(id) not null,
  building text,
  zone text,
  created_at timestamptz default now()
);

-- owners: statistical / operational fields only — NO personal data here.
create table owners (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) unique,
  unit_id uuid references units(id) unique not null,   -- prevents double-registration of a unit
  verification_status text not null default 'self_reported'
    check (verification_status in ('self_reported', 'confirmed', 'disputed')),
  contact_status text default 'لم يتم التواصل',
  contact_method text,
  last_contact_at timestamptz,
  census_status text default 'لم يبدأ'
    check (census_status in ('مكتمل', 'جزئي', 'لم يبدأ')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- owner_names: personal — visible to admin/manager, an assigned volunteer, and the owner themself.
create table owner_names (
  owner_id uuid primary key references owners(id) on delete cascade,
  full_name text not null,
  updated_at timestamptz default now()
);

-- owner_phones: personal & most sensitive — visible to admin/manager and the owner themself ONLY.
-- UNIQUE prevents the same phone number registering more than one unit.
create table owner_phones (
  owner_id uuid primary key references owners(id) on delete cascade,
  phone text unique not null,
  updated_at timestamptz default now()
);

-- topic_responses: 8 independent free-text sections, one row per topic per owner.
create table topic_responses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) not null,
  topic_key text not null
    check (topic_key in ('electricity','water','maintenance','management','developer','legal','collective','future')),
  stance text not null,
  updated_at timestamptz default now(),
  unique(owner_id, topic_key)
);

-- main_position_responses: multi-select from the 9 fixed options in the neutral questionnaire.
create table main_position_responses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) not null,
  position_text text not null,
  free_text text,   -- only used when position_text is the "رأي مختلف" free-text option
  created_at timestamptz default now(),
  unique(owner_id, position_text)
);

-- participation_responses: multi-select.
create table participation_responses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) not null,
  option_text text not null,
  created_at timestamptz default now(),
  unique(owner_id, option_text)
);

-- payment_status: kept fully separate from opinion data.
create table payment_status (
  owner_id uuid primary key references owners(id),
  status text not null default 'غير محدد'
    check (status in (
      'سدد الـ2000 جنيه','لم يسدد','ينوي السداد','لديه اعتراض على السداد',
      'يحتاج معلومات قبل السداد','يرى أن الملف يجب أن يسير قانونيًا','غير محدد'
    )),
  updated_at timestamptz default now()
);

-- volunteers
create table volunteers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) unique,
  full_name text,        -- personal — restricted, but this is the volunteer's OWN identity, not an owner's
  assigned_stage_id uuid references project_stages(id),
  created_at timestamptz default now()
);

-- contact_attempts: real record of outreach attempts.
create table contact_attempts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) not null,
  volunteer_id uuid references volunteers(id),
  method text,
  outcome text
    check (outcome in ('تم التواصل','لم يرد','رقم غير صحيح','سيعاود الاتصال','رفض المشاركة')),
  attempted_at timestamptz default now(),
  notes text
);

-- user_roles: the single source of truth for app-level authorization.
create table user_roles (
  auth_user_id uuid primary key references auth.users(id),
  role text not null check (role in ('super_admin','census_manager','volunteer','viewer','owner')),
  created_at timestamptz default now()
);

-- audit_logs: immutable. Only ever written by triggers (see 0002_audit.sql).
create table audit_logs (
  id bigint generated always as identity primary key,
  actor_auth_user_id uuid,
  entity text not null,
  entity_id uuid,
  field text,
  old_value text,
  new_value text,
  created_at timestamptz default now()
);
