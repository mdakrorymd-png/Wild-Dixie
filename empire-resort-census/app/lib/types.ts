// Hand-written types mirroring supabase/migrations/*.sql. Regenerate with
// `supabase gen types typescript` against the real project once it exists,
// and replace this file — this is a stand-in so the app type-checks
// without a live project during development.

export type AppRole = "super_admin" | "census_manager" | "volunteer" | "viewer" | "owner";
export type VerificationStatus = "self_reported" | "confirmed" | "disputed";

export interface ProjectStageRow {
  id: string;
  key: "2007" | "2010" | "2013";
  label: string;
  declared_unit_count: number | null;
  created_at: string;
}

export interface UnitRow {
  id: string;
  unit_number: string;
  stage_id: string;
  building: string | null;
  zone: string | null;
  created_at: string;
}

export interface OwnerRow {
  id: string;
  auth_user_id: string | null;
  unit_id: string;
  verification_status: VerificationStatus;
  contact_status: string | null;
  contact_method: string | null;
  last_contact_at: string | null;
  census_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnerNameRow {
  owner_id: string;
  full_name: string;
  updated_at: string;
}

export interface OwnerPhoneRow {
  owner_id: string;
  phone: string;
  updated_at: string;
}

export interface TopicResponseRow {
  id: string;
  owner_id: string;
  topic_key: string;
  stance: string;
  detail: string | null;
  updated_at: string;
}

export interface MainPositionResponseRow {
  id: string;
  owner_id: string;
  position_text: string;
  free_text: string | null;
  created_at: string;
}

export interface ParticipationResponseRow {
  id: string;
  owner_id: string;
  option_text: string;
  created_at: string;
}

export interface PaymentStatusRow {
  owner_id: string;
  status: string;
  updated_at: string;
}

export interface MaintenancePaymentRow {
  id: string;
  owner_id: string;
  charge_year: "2025" | "2026";
  amount_declared: number | null;
  receipt_path: string;
  note: string | null;
  created_at: string;
}

export interface VolunteerRow {
  id: string;
  auth_user_id: string | null;
  full_name: string | null;
  assigned_stage_id: string | null;
  created_at: string;
}

export interface ContactAttemptRow {
  id: string;
  owner_id: string;
  volunteer_id: string | null;
  method: string | null;
  outcome: string | null;
  attempted_at: string;
  notes: string | null;
}

export interface UserRoleRow {
  auth_user_id: string;
  role: AppRole;
  created_at: string;
}

export interface AuditLogRow {
  id: number;
  actor_auth_user_id: string | null;
  entity: string;
  entity_id: string | null;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface OwnersPublicStatsRow {
  total_units: number;
  total_registered: number;
  total_confirmed: number;
  total_self_reported: number;
  total_disputed: number;
  contacted_count: number;
  not_contacted_count: number;
  census_complete_count: number;
  census_partial_count: number;
  census_not_started_count: number;
}

export interface StagePublicStatsRow {
  stage_id: string;
  stage_key: string;
  stage_label: string;
  declared_unit_count: number | null;
  unit_count: number;
  registered_count: number;
  contacted_count: number;
  census_complete_count: number;
}

export interface MainPositionPublicStatsRow {
  position_text: string;
  response_count: number;
  response_percent: number;
}

export interface PaymentPublicStatsRow {
  status: string;
  owner_count: number;
  owner_percent: number;
}

export interface ParticipationPublicStatsRow {
  option_text: string;
  response_count: number;
}

export interface UnitAvailableRow {
  id: string;
  unit_number: string;
  stage_id: string;
  building: string | null;
  zone: string | null;
}

// Minimal Database shape for the supabase-js generic. Not exhaustive
// (Insert/Update variants collapse to Partial<Row>), but enough for the
// app's own query call sites to be type-checked.
type TableDef<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row> };

export interface Database {
  public: {
    Tables: {
      project_stages: TableDef<ProjectStageRow>;
      units: TableDef<UnitRow>;
      owners: TableDef<OwnerRow>;
      owner_names: TableDef<OwnerNameRow>;
      owner_phones: TableDef<OwnerPhoneRow>;
      topic_responses: TableDef<TopicResponseRow>;
      main_position_responses: TableDef<MainPositionResponseRow>;
      participation_responses: TableDef<ParticipationResponseRow>;
      payment_status: TableDef<PaymentStatusRow>;
      maintenance_payments: TableDef<MaintenancePaymentRow>;
      volunteers: TableDef<VolunteerRow>;
      contact_attempts: TableDef<ContactAttemptRow>;
      user_roles: TableDef<UserRoleRow>;
      audit_logs: TableDef<AuditLogRow>;
    };
    Views: {
      owners_public_stats: { Row: OwnersPublicStatsRow };
      stage_public_stats: { Row: StagePublicStatsRow };
      main_position_public_stats: { Row: MainPositionPublicStatsRow };
      payment_public_stats: { Row: PaymentPublicStatsRow };
      participation_public_stats: { Row: ParticipationPublicStatsRow };
      units_available: { Row: UnitAvailableRow };
    };
  };
}
