# Decisions & P0 Log — Wild Dixie / Egypt Rentals

Read this before starting work. Add a dated entry for every P0 Mohamed reports and every feature he rejects. Never re-introduce a rejected feature or regress a logged P0.

## P0s (fixed — must never regress)
- **2026-06-27 — /sokhna rendered «٠ عقار» (0 properties)** while property detail routes existed. A guest listing page with zero items is always P0, never a styling issue.
- **2026-06-28 — OTP code rendered on the page instead of arriving by SMS.** OTP delivery must be verified end-to-end (real phone receives SMS), not by observing the code in the UI.

## Content rules (standing)
- Testimonials on the site are **placeholders** — no fabricated names/reviews. Replace only with real content from Mohamed (`TODO(Mohamed)` markers).
- Unsplash/stock images are flagged for replacement with real property photos, not precedent for adding more.

## Rejected features
- (none logged yet — add entries here as `YYYY-MM-DD — <feature> — rejected because <reason>`)
