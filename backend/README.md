# Egypt Vacation Rentals — Backend

FastAPI + PostgreSQL backend for a local Egyptian vacation-rental platform.

> **Status:** All 6 backend modules complete — 49 endpoints.
>
> 1. **Foundation + Auth** — three roles (Guest / Host / Admin), phone-first
>    signup with SMS OTP, JWT sessions, Egyptian National ID capture & validation.
> 2. **Property management + Airbnb importer** — manual listing wizard, resort &
>    amenity catalog for hyper-local search, public search, Playwright-based
>    Airbnb scraper, and the admin moderation (pending-review) queue.
> 3. **Availability calendar + iCal sync** — sparse per-night availability,
>    host manual blocks, bidirectional iCal (import external feeds every 15 min,
>    export our own token-protected feed for Airbnb to pull).
> 4. **Booking engine** — quotes, عربون (deposit) vs full payment, and
>    atomic double-booking prevention via the unique `(property_id, date)`
>    constraint inside a savepoint; stale holds auto-expire.
> 5. **Payments** — card (mock gateway) + the Egyptian manual-verification flow
>    (InstaPay / Vodafone Cash receipt upload → admin confirms → booking confirmed).
> 6. **Escrow & payout ledger** — commission-aware host payouts on confirmation,
>    admin mark-paid, and guest/host dispute logging.

## Tech stack

| Layer            | Choice                                             |
| ---------------- | -------------------------------------------------- |
| Framework        | FastAPI                                            |
| ORM / migrations | SQLAlchemy 2.0 (async) + Alembic                   |
| Validation       | Pydantic v2                                        |
| Database         | PostgreSQL (asyncpg driver)                        |
| Auth             | JWT (access + refresh), bcrypt password/OTP hashes |

## Project layout

```
app/
  core/         config, async DB engine, security (JWT/hashing), exceptions
  models/       SQLAlchemy models (User, OtpCode) + enums
  schemas/      Pydantic request/response contracts
  services/     business logic (auth_service, otp_service, sms gateway)
  api/
    deps.py     DB session, current-user & role guards
    v1/         versioned routers + endpoints (auth, users)
  utils/        Egypt-specific validators (National ID, phone)
  main.py       app entrypoint
alembic/        migration environment + versions
```

## Setup (Windows / PowerShell)

```powershell
# 1. From the backend folder, create & activate a virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create your env file and fill in DATABASE_URL + JWT_SECRET_KEY
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(48))"   # paste into JWT_SECRET_KEY

# 4. Make sure PostgreSQL is running and the database exists, e.g.
#    createdb egypt_rentals   (or via pgAdmin)

# 5. Apply migrations
alembic upgrade head

# 6. (Optional) install the Airbnb importer browser
playwright install chromium

# 7. Run the API
uvicorn app.main:app --reload
```

Interactive docs: <http://localhost:8000/docs>  ·  Health: <http://localhost:8000/health>

## Auth flow (happy path)

1. `POST /api/v1/auth/register` → creates an **unverified** account, sends an OTP.
   In non-production the code is echoed back as `debug_otp` so you can test
   without a real SMS gateway.
2. `POST /api/v1/auth/verify-phone` → submit the code → returns an access +
   refresh token pair and marks the phone verified.
3. `POST /api/v1/auth/login` → phone + password → token pair (requires a
   verified phone).
4. `POST /api/v1/auth/refresh` → exchange a refresh token for a new access token.
5. `GET /api/v1/users/me` → current profile (send `Authorization: Bearer <access>`).
6. `PATCH /api/v1/users/me/national-id` → set & validate the 14-digit National ID.
7. `POST /api/v1/users/me/become-host` → add the Host role.

## Egypt-specific rules baked in

- **Phone numbers** are normalized to E.164 and validated against Egyptian
  carriers (010 / 011 / 012 / 015).
- **National ID** is validated for length, century digit, a real embedded birth
  date, and a known governorate code (`app/utils/validators.py` can also decode
  birth date, gender, and governorate).
- **SMS gateway** is pluggable (`app/services/sms.py`); a console provider ships
  for development, real providers (SMSMisr, Vodafone, Twilio…) drop in behind the
  same interface.

## Property & import flow (Module 2)

- `GET  /api/v1/catalog/resorts` · `GET /api/v1/catalog/amenities` — wizard data.
- `POST /api/v1/properties/import` *(host)* — paste an Airbnb `/rooms/<id>` URL →
  returns structured `ImportedListing` JSON (title, images, amenities, capacity,
  lat/lng) **to prefill the wizard**. Pricing/area/resort stay host-supplied.
- `POST /api/v1/properties` *(host)* — create a draft listing.
- `POST /api/v1/properties/{id}/submit` *(host)* — send to the review queue.
- `GET  /api/v1/properties` — public hyper-local search (`q`, `area`,
  `resort_id`, `property_type`, `min_price`, `max_price`, `guests`, paginated).
- `GET  /api/v1/admin/properties/pending` + `…/approve` / `…/reject` *(admin)*.

The Airbnb scraper is best-effort by design (Airbnb's markup shifts); it leans
on stable OpenGraph tags first and reports anything it couldn't fill in
`missing_fields`. Parser logic lives in `app/services/airbnb_parser.py`
(pure & unit-testable), separate from the Playwright fetcher.

## Calendar & iCal sync (Module 3)

Availability is stored **sparsely**: a `calendar_days` row exists only for a
blocked/booked night; a date with no row is available. A unique
`(property_id, date)` constraint underpins double-booking prevention (Module 4).

- `GET  /api/v1/properties/{id}/availability?start=&end=` — public availability.
- `GET  /api/v1/properties/{id}/calendar` *(host)* — owner view.
- `POST /api/v1/properties/{id}/calendar/block` · `/unblock` *(host)* — manual blocks.
- `GET/POST/DELETE /api/v1/properties/{id}/calendar/ical-sources` *(host)* — manage
  external feeds (e.g. the property's Airbnb export URL).
- `POST /api/v1/properties/{id}/calendar/sync` *(host)* — sync feeds now.
- `GET  /api/v1/properties/{id}/calendar/export-link` *(host)* — get the public feed URL.
- `GET  /ical/{id}/{token}.ics` — token-protected feed Airbnb pulls from us.

A background scheduler (`ENABLE_ICAL_SCHEDULER`, default on) re-syncs every feed
every `ICAL_SYNC_INTERVAL_MINUTES` (15). For multi-worker production, move
`calendar_service.sync_all_sources` to a Celery beat task. The iCal parser /
generator (`app/services/ical.py`) is pure and unit-tested (Airbnb's `DTEND` is
treated as the exclusive checkout day).

## Booking, payments & ledger (Modules 4–6)

- `POST /api/v1/bookings/quote` — price a stay (نights, عربون vs full, due-now/balance).
- `POST /api/v1/bookings` *(guest)* — create a hold; atomic against double-booking.
- `GET  /api/v1/bookings/mine` · `/hosting` *(host)* · `GET /{id}` · `POST /{id}/cancel`.
- `GET  /api/v1/bookings/{id}/payment-instructions?method=` — platform InstaPay/wallet details.
- `POST /api/v1/bookings/{id}/pay` — card (instant) or InstaPay/Vodafone (receipt → review).
- `POST /api/v1/bookings/{id}/dispute` *(guest/host)*.
- `GET  /api/v1/payouts/mine` *(host)* — pending/paid totals.
- Admin: `GET /admin/payments/pending` + `…/approve|reject`, `GET /admin/payouts` +
  `…/mark-paid`, `GET /admin/disputes` + `…/resolve`.

Double-booking is prevented by inserting one `BOOKED` `calendar_days` row per night
inside a `begin_nested()` savepoint — the unique `(property_id, date)` constraint
makes two simultaneous "Book Now" clicks impossible (the loser gets a clean 409).
Pricing math lives in the pure, unit-tested `app/services/pricing.py`. The
scheduler also expires stale `pending_payment` holds each cycle and releases their nights.

## Frontend

Production frontend is Next.js (App Router) + Tailwind + TS as a PWA (planned).
An interactive prototype of the full guest/host/admin experience was delivered
in-chat to validate the UX before building the real client.
