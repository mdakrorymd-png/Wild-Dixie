# Empire Resort — نظام إحصاء الملاك

Owners census & positions system for Empire Resort (650 units, 3 contract
stages — 2007/2010/2013). This is a **separate module** inside the
Wild-Dixie repo — it does not share a database, auth, or codebase with the
vacation-rental app in `../backend` / `../frontend`. It uses its own
Supabase project (Postgres + Auth + RLS), per the original spec.

**Governing principle:** *Understand — Don't Influence.* This system exists
to know the real diversity of owner opinion, not to build a voting bloc or
pressure anyone. See the constraints below before changing anything.

## Layout

```
empire-resort-census/
  supabase/
    migrations/     schema, RLS, audit triggers, aggregate views (run in order)
    seed/           seed-demo.ts — DEMO DATA ONLY, dev project only
  app/               Next.js 14 (App Router) + TypeScript + Tailwind, RTL
```

## Setup

1. Create a **new, separate** Supabase project for this module (do not
   reuse any project backing the rental app).
2. In the Supabase SQL editor, run `supabase/migrations/*.sql` **in
   numeric order** (0001 → 0005). They are plain SQL, no Supabase CLI
   required, though `supabase db push` works too if you prefer the CLI.
3. **Email OTP is already enabled by default** in every Supabase project
   (it's the "Email" provider under Authentication → Providers) — no
   third-party gateway needed, and it's free. Login is email + one-time
   code (see `app/app/login/page.tsx`), not phone OTP: phone-based OTP
   would need a paid SMS gateway (Twilio et al.) with no viable free tier
   at 650-owner scale, so login went through email instead. The phone
   number is still collected and still DB-unique-enforced (see
   `owner_phones`) — it's just no longer the login channel. Supabase's
   built-in email sending is rate-limited (a handful of emails/hour),
   which is fine for testing; before onboarding real owners, switch to
   custom SMTP under Authentication → Settings → SMTP (Resend, SendGrid,
   etc. all have free tiers big enough for a one-time rollout).
4. `cd app && cp .env.local.example .env.local` and fill in your project's
   URL + anon key.
5. `npm install && npm run dev` → http://localhost:3000.
6. Load the 3 project stages into `project_stages` (2007/2010/2013,
   key + label) — not seeded by this repo. Units are **not** pre-loaded:
   an owner types their own unit number at registration and the app
   creates the `units` row on the fly if it doesn't exist yet (see
   deviation #3 below) — no need to source the real 650-unit roster
   before launch.
7. Bootstrap the first `super_admin`: after they sign up once through the
   app (so `auth.users` has their row), run in the SQL editor:
   ```sql
   insert into user_roles (auth_user_id, role)
   values ('<their-auth-uid>', 'super_admin');
   ```
   This is intentionally a manual, DB-side step — see §12 of the original
   spec: who holds this is a decision for the project owner, not something
   the app should let anyone self-assign.

## Demo data (dev only)

`supabase/seed/seed-demo.ts` fills a **separate dev project** with
synthetic units/owners/responses so you can see the dashboard populated.
It refuses to run against anything that doesn't look like a dev project
unless you explicitly set `I_UNDERSTAND_THIS_IS_A_DEV_PROJECT=1`. Needs
`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` for that dev project in
`supabase/seed/.env` (gitignored). **Never run it against production.**

```bash
cd empire-resort-census/app
npm run seed:demo
```

## Deliberate deviations from the literal spec DDL

The functional requirements (RLS matrix, verification model, neutral
survey text) are implemented as specified. Two structural changes were
made to actually *achieve* what the spec asks for, not to work around it:

1. **Personal data lives in two extra tables, not two columns.**
   `owners.full_name` / `owners.phone` from the spec's §5 DDL became
   `owner_names(owner_id, full_name)` and `owner_phones(owner_id, phone)`.
   Reason: Postgres RLS is **row-level**, and the access matrix requires
   *column*-level differences — e.g. a volunteer may see an assigned
   owner's name but never their phone. All authenticated users share one
   Postgres role (`authenticated`) in Supabase, so column-level GRANTs
   can't distinguish "volunteer" from "owner" from "manager". Splitting the
   sensitive columns into their own tables, each with its own RLS policy,
   makes that distinction a real, DB-enforced boundary instead of a
   convention the frontend has to remember to respect.

2. **`main_position_responses` gained a nullable `free_text` column.**
   The spec's option 9 ("لدي رأي مختلف وأريد شرحه — حقل نص حر اختياري") is
   a checkbox that reveals a free-text box; the given schema had nowhere
   to store that text. It's stored on the same row as that specific
   option, `null` for every other position.

Everything else — table names, the verification-status model (§4), the
survey copy (§6/§8) — is unchanged from spec.

## Where each non-negotiable constraint (spec §2) lives

| Constraint | Implementation |
|---|---|
| No fake auth | `app/login` uses only `supabase.auth.signInWithOtp` / `verifyOtp` (real email OTP — see the login-channel note above). No role picker anywhere touches authorization. |
| Real DB-level RLS | `supabase/migrations/0004_rls.sql` — every table, policies keyed off `auth.uid()` and `user_roles`, verified independent of the frontend. |
| Personal vs. statistical separation | `owner_names` / `owner_phones` (personal) vs. `owners` + `*_public_stats` views (statistical); see deviation #1 above. |
| No leading questions / no score | `app/lib/constants.ts` is the single source of survey copy, copied verbatim from spec §6/§8; nothing computes a stance/loyalty score anywhere. |
| No public exposure of name+position | Personal tables (`owner_names`, `owner_phones`) are never joined into any `*_public_stats` view; the export route (`app/api/export/route.ts`) reads exclusively from those views. |
| Unit de-duplication | `owners.unit_id` is `unique not null`, and `units.unit_number` is `unique` — both enforced by Postgres, not the UI. Free-typed unit numbers are normalized (case/whitespace/dash-insensitive) before matching so `A-101`/`a 101`/`A101` all resolve to the same unit. |
| Immutable audit log | `supabase/migrations/0003_audit.sql` — `write_audit_log()` is the only writer (via triggers, `security definer`); `authenticated`/`anon` have no INSERT/UPDATE/DELETE grant on `audit_logs` at all. |
| Identity check before official stats | There is no real verifiable identity source (spec §4) — self-reported data counts immediately; `verification_status = 'disputed'` is the one manual exception, and every `*_public_stats` view filters it out until a manager reverts it. |

## What's built vs. what's left

Built: schema + RLS + audit + aggregate views; email-OTP login; unit
self-registration (self-reported, immediate); the full 8-section + main
position + participation + payment survey; dashboard; stage comparison;
owners list (server-paginated, census_manager+); owner profile with
contact-attempt log and dispute/confirm actions; "اعرف جارك" volunteer
flow (self-registration → super_admin approval → assigned-stage owner
list); owner self-service page; role management + disputed-record review
under Admin; CSV export from the aggregate views only.

Not built (explicitly out of scope for this pass, spec marks step 5 as
optional pre-launch anyway): a dedicated bulk CSV importer for the real
650-unit roster (loaded via Supabase's own table-editor CSV import
instead, see Setup step 6); email/SMS notifications; PDF export (CSV
only). None of these affect the RLS/security model.

## Acceptance checklist (spec §11) — how to verify each item

- **OTP required, no bypass** — try `/login`; there is no other auth path in the code.
- **Cross-owner access blocked by RLS itself** — as a plain `owner`, run
  `select * from owners where id <> '<your id>'` in the SQL editor logged
  in as that user's JWT (or via `supabase.auth` session in the browser
  console) — zero rows, not just a hidden UI element.
- **Direct Postgres access enforces the same rules** — connect with
  `psql` using a JWT-scoped `authenticated` role (or `set role
  authenticated; set request.jwt.claims = '...'`) and repeat the query —
  same result as through the API, because it's the same policies.
- **Duplicate unit registration rejected by the DB** — try registering the
  same `unit_id` twice; the second `insert` fails with Postgres error
  `23505` (unique violation on `owners.unit_id`), surfaced as a plain
  Arabic error in `app/app/onboarding/actions.ts`.
- **Duplicate phone rejected by the DB** — same mechanism on
  `owner_phones.phone` (`23505`).
- **Every mutation lands in `audit_logs` automatically, unerasable via the
  app** — triggers cover `owners`, `owner_names`, `owner_phones`,
  `topic_responses`, `main_position_responses`, `participation_responses`,
  `payment_status`, `user_roles`; no route or RLS policy grants
  insert/update/delete on `audit_logs`.
- **Export contains numbers only** — open the CSV from `/dashboard` →
  "تصدير CSV" and confirm by eye there's no name/phone column; the query
  in `app/app/api/export/route.ts` only ever selects from `*_public_stats`.
- **`disputed` records vanish from public stats immediately, and only
  that** — mark one owner disputed from their profile page and refresh
  `/dashboard`; the total drops by exactly one. Reverting it (via
  "إعادة لتصريح ذاتي" / "تأكيد الهوية") restores it.
- **Self-reported rows count immediately, no pending gate** — register a
  new unit in `/onboarding`; `/dashboard`'s registered count increments on
  the next load, with no admin action in between.
- **Survey text matches spec §6 verbatim** — every label in `/survey`
  traces back to `app/lib/constants.ts`, which was copied character-for-
  character from the spec.
