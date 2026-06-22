# ساحل — Frontend

Next.js 14 (App Router) + TypeScript + Tailwind, RTL Arabic, PWA. Talks to the
FastAPI backend in `../backend`.

## Run

```powershell
cd frontend
npm install
Copy-Item .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev                                 # http://localhost:3000
```

The backend must be running on `NEXT_PUBLIC_API_URL` (default
`http://localhost:8000/api/v1`).

## Structure

```
app/
  page.tsx                 home / hyper-local search
  properties/[id]/page.tsx listing detail + quote + booking
  bookings/page.tsx        my bookings
  bookings/[id]/page.tsx   checkout (card / InstaPay receipt)
  login, register, profile auth + National ID + become-host
  host/page.tsx            host dashboard + Airbnb importer
  admin/page.tsx           moderation + payment verification + disputes
lib/
  api.ts     typed fetch client (JWT in localStorage)
  types.ts   API types mirroring the backend schemas
  auth.tsx   AuthProvider context
  format.ts  EGP / Arabic label helpers
components/  Navbar, PropertyCard
```

## Notes

- Auth token is stored in `localStorage` and attached as a Bearer header.
- In development the registration OTP is echoed back by the API (`debug_otp`)
  and shown on the verify screen, so you can sign up without a real SMS gateway.
- App icons (`public/icon-192.png` / `icon-512.png`) are referenced by the PWA
  manifest — add real assets before shipping.
