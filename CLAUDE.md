# Wild Dixie / Egypt Rentals — Project Rules

- Stack: FastAPI backend (`backend/`), Next.js 14 frontend (`frontend/`), Neon Postgres, deployed on Vercel (wild-dixie.vercel.app + wild-dixie-api.vercel.app). Local run: `start-all.cmd`. Read RUN.md before starting servers.
- Positioning: Egyptian Airbnb alternative — WhatsApp-conversion funnel + credibility layer. Homepage = owners (management packages); /sokhna = guests. Do not mix audiences on one page.
- Scope freeze: no new modules (payments, import integrations, host onboarding steps) unless requested in the current session. Existing auth/OTP is in scope for fixes.
- Primary CTA on every guest page is a WhatsApp link (`wa.me/20...`) and must resolve. A guest page with zero properties rendered is P0.
- Before starting work, read DECISIONS.md. Log every P0 Mohamed reports and every rejected feature there, dated. Never re-introduce a rejected feature or regress a logged P0.
