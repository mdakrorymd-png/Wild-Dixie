# Running the full stack locally

The project runs three processes: a portable **PostgreSQL 16** (in `./pgsql`,
data in `./pgdata`), the **FastAPI backend** (port 8000), and the **Next.js
frontend** (port 3000).

## One-command start

**Easiest — double-click `start-all.cmd`** (works regardless of PowerShell policy).
It opens Postgres + backend + frontend in separate windows. Stop with `stop-all.cmd`.

Then open **http://localhost:3000**.

> PowerShell's default `Restricted` policy blocks `.ps1` scripts. To use
> `start-all.ps1` instead, run it with a one-time bypass:
> ```
> powershell -ExecutionPolicy Bypass -File "C:\Users\mdakr\egypt-rentals\start-all.ps1"
> ```

## Demo accounts (password: `Passw0rd!`)

| Role  | Phone           |
| ----- | --------------- |
| Admin | +201000000001   |
| Host  | +201000000002   |
| Guest | +201000000003   |

All three already have a verified phone + National ID and the guest can book
immediately. Three published listings are seeded (Marassi, Hacienda Bay, El Gouna).

## Manual start (if you prefer)

```powershell
# 1) Postgres
./pgsql/bin/pg_ctl.exe -D ./pgdata -l ./pg.log -o "-p 5432" start

# 2) Backend  (from ./backend, with .env present)
cd backend
python -m uvicorn app.main:app --port 8000      # http://localhost:8000/docs

# 3) Frontend (from ./frontend, with .env.local present)
cd ../frontend
npm run dev                                      # http://localhost:3000
```

## Reset the database

```powershell
cd backend
python -m alembic downgrade base
python -m alembic upgrade head
python -m scripts.seed
```

## Notes

- Postgres uses `trust` auth on localhost (no password) — local development only.
- Registration OTPs print to the backend console (and are returned as `debug_otp`
  outside production), so you can sign up new accounts without a real SMS gateway.
- The iCal sync scheduler is disabled via `.env` for a quiet local run.
