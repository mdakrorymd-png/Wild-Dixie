I now have comprehensive coverage. I have the homepage end-to-end (including the homepage embeds the full pricing block and a free-estimate form section with "AI-powered performance estimate" copy), plus all subpages. I have enough to write the full extraction. The footer details came through on the About page (contact info). I have everything needed.

---

# Qualco.ca — Deep UX / Information-Architecture Extraction

A full-service vacation-rental management company (HQ: Brossard, QC; built on a Squarespace-style site). Below is everything a product team needs to build a better, Egyptian-tailored version. Where copy is in quotes, it is verbatim from the live site.

---

## 1) INFORMATION ARCHITECTURE (every nav item, dropdown, page, and purpose)

**Top nav (desktop), left→right:**

| Nav item | Type | URL | Purpose |
|---|---|---|---|
| Logo | link | `/` | Home |
| Home | link | `/` | Landing / master sales page |
| **All Services** | dropdown button | `/all-services` (folder) | Groups the service pages below |
| → Services | link | `/services` | Overview of the 8-core service set |
| → Revenue Management | link | `/revenue-management` | Dynamic-pricing standalone product (worldwide) |
| → Property Management | link | `/property-management` | Full-service local product (Montreal + intl) |
| → Listing Optimization | link | `/listing-optimization` | Listing/SEO/photo standalone product |
| Pricing | link | `/pricing` | Packages, commissions, comparison |
| **Vacation Rentals** | dropdown button | `/vacation-rentals` (folder) | The guest/booking side |
| → Escapade Chambly | external | `escapade.directstays.com` | Direct-booking microsite (their managed chalets) |
| → Qualco Properties | external | `qualcorentals.directstays.com` | Direct-booking microsite (Brossard apartments) |
| **More** | dropdown button | `/more` (folder) | Secondary content |
| → About | link | `/about` | Story, stats, contact |
| → FAQ | link | `/faq` | 10-question accordion |
| → Blog | link | `/blog` | SEO/content |
| Language picker | listbox | — | English (FR/AR/PT implied by copy) |
| **Get a Free Estimate** | CTA button | `/contact` | Primary conversion — persistent in header |
| Cart | link | `/cart` | Squarespace commerce (for paid subscriptions/cleaning) |

**Mobile nav** mirrors this as a drill-down folder structure (Home / All Services ▸ / Pricing / Vacation Rentals ▸ / More ▸), each folder with a "Back" affordance.

**Key IA insight:** the architecture cleanly splits into three audiences — **owner-acquisition pages** (Services, Revenue Mgmt, Property Mgmt, Listing Optimization, Pricing), **guest/booking** (two external DirectStays microsites), and **trust/SEO** (About, FAQ, Blog). The single persistent conversion action everywhere is "Get a Free Estimate" → `/contact`.

---

## 2) THE OWNER FUNNEL (how they convince owners to hand over a property)

### Homepage as the master funnel (sections in exact order)

1. **Hero.** H1: *"Maximize Your Rental Revenue with All-In-One Property Management Solution."* Sub: *"Qualco delivers peace of mind and peak performance for your property. We combine uncompromising standards of quality with data-driven strategy to protect your asset, satisfy your tenants, and maximize your returns."* Single CTA: **Get a Free Estimate**. (Themes: peace of mind + data-driven + protect your asset + maximize returns — emotional and rational at once.)

2. **Trust/logo band.** *"Trusted by property owners and featured on"* → Booking.com, Airbnb, Vrbo, Agoda, Expedia, Houfy, Hôtels au Québec. (Borrowed credibility from OTAs.)

3. **Exclusive partner offer.** "EXCLUSIVE PARTNER OFFER" with Inn directly — "DISCOUNT VALUE / 15$ OFF / First Year Subscription", "PROMO CODE / INN - QUALCO - 15". (Ecosystem/partner signal.)

4. **3-step process** — *"Our Simple 3-Step Process"*. Intro: *"Whether you're a first-time landlord or a seasoned portfolio owner, our solutions are built on a foundation of quality…"*
   - **Free Consultation** — "We learn about your property, your goals, and your expectations."
   - **Tailored Setup** — "We prepare your listing, pricing, and systems for maximum performance."
   - **Ongoing Management** — "Based on the package you choose, we provide the right level of support…"
   (Reduces perceived effort/risk of switching; "first-time landlord or seasoned portfolio owner" widens the funnel.)

5. **Service grid** — *"A Commitment to Excellence in Every Detail"* — 15 service cards (full list in §4). CTA: **Learn More**.

6. **Stats / results band** — *"Excellence Delivers Proven Results"*:
   - **"Up to 30% Increase in Net Revenue"** — "Our dynamic pricing and operational efficiency strategies consistently outperform market averages."
   - **"15+ Hours Saved Per Month"** — "…so you can enjoy a truly passive investment."
   - **"5-Star Tenant & Guest Satisfaction"** — "…longer leases, fewer vacancies, and a premium reputation for your asset."

7. **Testimonials** — *"What Our Partners Say"* (3, each targeting a different persona):
   - Sarah M., Montreal: "Qualco transformed my rental into a top-performing listing. I earn more and work less." (local owner)
   - Alex B., Portfolio Investor: "The data-driven approach is what sold me… optimized my portfolio's ROI… a true strategic partner." (investor)
   - David R., Remote Owner: "Managing my property from a distance was a major source of anxiety… complete peace of mind. I trust them implicitly to protect my asset." (absentee owner)

8. **Pricing block** (embedded on homepage too — see below).

9. **Benefits of Working With Us** — 6 reassurance tiles: Maximized Revenue / Peace of Mind / Time Savings ("reduces up to 70% of your operational workload") / Trusted Expertise ("9+ years") / Multilingual Service ("English, French, Portuguese, and Arabic") / Full Transparency ("no hidden fees").

10. **Closing free-estimate section** — *"See Your Property's Potential"* — *"Fill out the form below for a free, AI-powered performance estimate and consultation. No commitment required."*

### The "Free Estimate" / onboarding flow (`/contact`)

- Two parallel conversion paths on one page:
  - **Lead form** — H2: *"See Your Property's Potential"*; sub: *"Looking to maximize your rental income or take the stress out of managing your property? Share your details below and our team will reach out to you shortly."* (Form is an embedded widget — captures owner details; homepage variant frames it as a "free, AI-powered performance estimate.")
  - **Calendly booking** — H2: *"A quick call, no commitment"*; sub: *"Book a call via Calendly and let's discuss your needs, challenges, and next steps."*
- Friction-reducers repeated throughout: "free," "no commitment," "we'll reach out shortly," "AI-powered performance estimate."

### Trust signals inventory (reusable)

- OTA logo wall (Booking/Airbnb/Vrbo/Agoda/Expedia/Houfy).
- Hard stats: 30% revenue ↑, 15+ hrs/mo saved, 70% workload reduction, 5-star satisfaction.
- About-page proof stats: **250+ owners served, 2700+ guests hosted, 10+ countries, 150+ properties managed, 6+ years** (note: site says "9+ years" elsewhere — inconsistency to fix).
- Persona-segmented testimonials; named guest review on Listing page ("bookings increased by 40% in just two months!" — Sarah Cormier).
- Superhost / "4.98 ★ Rating" badges (Property Management page).
- Compliance credibility: CITQ, taxes, permits.
- "Satisfaction Guarantee Policy" link under each paid plan.

### Pricing / commission presentation (`/pricing`)

Header: *"Transparent pricing, tailored for your needs."* Four side-by-side cards, each a checklist with ✔/✗ markers, a badge, a price/commission, a one-line rationale, a CTA, and a "Satisfaction Guarantee Policy" link.

| Plan | Badge | Price model | Geography | CTA |
|---|---|---|---|---|
| **Qualco Boost** | "Bestselling" | **$149 / month / property** | Worldwide | "Optimize My Income" |
| **Elite** | "Recommended" | **18% of rental revenue** | Montreal · Boston · Dubai · Egypt · Morocco · Tunisia | "Book a Consultation" |
| **Advanced** | — | **15% of rental revenue** | (local markets) | "Book a Consultation" |
| **Cleaning & Turnover** | — | "Under Contract for STR" (per-turnover quote) | local | "Get a Free Estimate" |

- **Boost** = the low-commitment, keep-control SaaS-style tier: "Boost your profits without giving up control of your STR" (Revenue mgmt + 10+ platform marketing + listing optimization + reports + hosting partner).
- **Elite vs Advanced** uses the same checklist; Advanced shows the last 5 rows as **✗** (Restocking, Professional listing creation, Review management, Regulatory/CITQ support, Dedicated Hosting Partner) — a deliberate "good/better" upsell where the differentiators are the high-touch concierge items.
- Below the cards: **"Benefits of Working With Us"** 6-tile reassurance grid (same as homepage §9).

---

## 3) THE GUEST SIDE (booking + their own listings)

Guest booking is offloaded to two **DirectStays** direct-booking microsites linked from the "Vacation Rentals" dropdown:

- **Qualco Properties** (`qualcorentals.directstays.com`) — apartments in Brossard, QC. Hero value prop: *"Explore Comfortable Stays and save 10%-15% on platform fees"* (the book-direct savings hook). Listings shown as a **card grid**: hero image, title ("Lovely 2-bedroom Apt. in DIX30 close to DT"), location, capacity row (guests / bedrooms / bathrooms), card links to a property detail/booking page. Local-trust line: *"Locally based and committed to excellence, we're here to help you feel at home—wherever you stay."*
- **Escapade Chambly** (`escapade.directstays.com`) — a themed sub-brand for chalets/retreats. Hero: *"Relaxing retreats for families and groups with Jacuzzis, BBQs, and lake views"* / "perfect retreat in Chambly, Quebec." 3 listings (4–8 BR, 8–18 guests), amenity-led (hot tubs, BBQ/fire tables, waterfront, stocked kitchens). Dated guest reviews (Sept–Nov 2025) and per-property detail pages (e.g. `/property/escapade-chambly-4br-spa-retreat`).

**Guest-side pattern:** OTA-style card grid → property detail → date/guest selector → direct booking, with the differentiator being the **"book direct, save 10–15% on platform fees"** loyalty incentive. Note: the main Qualco brand keeps guest booking on separate microsites rather than on qualco.ca itself — a sub-brand strategy (Escapade is its own consumer brand; Qualco.ca stays B2B/owner-facing).

---

## 4) REUSABLE DESIGN PATTERNS / COMPONENTS (rebuildable spec)

**The 15 service cards** (used in the homepage grid; designer needs the full set): Revenue Management & Dynamic Pricing · Marketing across 10+ platforms · Listing Optimization & enhanced ranking · Detailed performance reports · Maintenance Support · Cleaning & laundry Services · Owner support & transparent communication · All-in-one automated system (reduce 70% of time & costs) · Guest communication · Interior Design Support · Restocking essentials · Professional listing creation & optimization · Review management · Regulatory compliance support (CITQ, taxes, permits) · Dedicated Remote Hosting Partner.

Concrete component specs:

- **Hero** — Full-bleed property photo, left-aligned bold H1 (benefit-led), one-paragraph subhead, single high-contrast CTA button. Section-specific heroes reuse the pattern with punchy fragments (Listing Optimization: *"First-Page Visibility. More Bookings. Zero Stress."*; Property Management: *"Full Property Management. Stress-Free Operations."*). Pattern: 3 short clauses separated by periods for rhythm.

- **Logo trust band** — single horizontal row of grayscale OTA logos under a small-caps lead-in ("Trusted by property owners and featured on"). Place immediately under hero.

- **3-step process** — 3 numbered cards in a row, each = icon + bold step title + one-sentence description. Variant on Property Mgmt page: "Audit & Setup → Local Onboarding → Go Live." Keep it to exactly 3 steps, plain verbs.

- **Service card grid** — responsive multi-column grid; each card = icon + bold title + 1–2 sentence description, uniform height. Section heading "A Commitment to Excellence in Every Detail." No CTA per card; one "Learn More" CTA below the grid.

- **Stats / results band** — contrasting (dark) background, 3 large numeric stats, each = big number/phrase (e.g. "Up to 30%") + supporting sentence. Used for both proof-of-results (homepage) and milestone counters (About: 250+/2700+/10+/150+/6+).

- **Testimonial block** — 3 cards, each = quotation-marked statement + "— Name, Persona/City." Deliberately one card per buyer persona (local owner / investor / remote owner). Heading "What Our Partners Say." (Currently static 3-up, not a slider — an Egyptian version should consider a slider/carousel here.)

- **Pricing cards** — 4 vertical cards in a row. Each card: badge ribbon ("Bestselling"/"Recommended") + plan name + price/commission (large) + geography line + ✔/✗ feature checklist (✗ used to visually downsell the cheaper tier) + primary CTA button + small "Satisfaction Guarantee Policy" link. Highlight the "Recommended" card visually.

- **Benefits grid** — 6 tiles, icon + bold title + one sentence; soft reassurance copy (Peace of Mind, Time Savings, Transparency). Sits near the bottom as a closing-objection-handler.

- **FAQ accordion** — single-column expandable list, 10 Q&As, no category grouping currently. Questions are objection-shaped: "What areas do you serve?", "What makes Qualco different…", "How do your service packages work?", "How do you maximize my rental income?", "Do you handle regulatory compliance?", "In which languages do you operate?" (A better version should group these: Coverage / Pricing / Operations / Compliance / Languages.)

- **CTA bands** — recurring full-width band repeating "Get a Free Estimate" / "Book a Consultation" between sections; the closing band pairs a lead form with a Calendly embed ("no commitment" reassurance).

- **Footer / contact** — company info block: Email `office@qualco.ca`, Phone `514-349-0031`, Address `410-6000 Boulevard de Rome, Brossard, QC J4Y0B6`, plus a mini "Any Questions? Just write a message" form.

### Premium / "comfortable" feel — how it's achieved (for the designer)

Big property photography, generous whitespace, benefit-led short headlines with period-separated clauses, consistent icon+title+sentence card rhythm, dark stat bands for emphasis contrast, repeated low-friction CTAs ("free," "no commitment"), and concierge-flavored language ("Dedicated Hosting Partner," "peace of mind," "protect your asset," "truly passive investment").

---

## Notes / gaps for the rebuild

- **Egypt is already in their footprint** (Elite plan geography lists "Egypt," Property Management lists "Montreal · Boston · Dubai · Egypt · Morocco · Tunisia") — so an Egyptian-tailored competitor is going head-to-head, not into white space. Differentiate on local depth: EGP pricing, local OTA/compliance (e.g. Egyptian tourism licensing analogous to their CITQ play), Arabic-first UI, local payment rails, Red Sea / North Coast / Cairo market segmentation.
- **Inconsistencies to avoid copying:** experience stated as both "9+ years" and "6+ years"; language list varies ("English, French and Arabic" vs "English, French, Portuguese, and Arabic"); minor typos ("maintenace", "Propreties").
- **Contact-form fields** could not be enumerated — they render inside an embedded widget/iframe (Calendly + a JS form). The visible framing is "Share your details below" + "AI-powered performance estimate." A rebuild should make the estimate form a first-class, instrumented component (address, # of properties, property type, market, current platform, expected ADR).
- **Guest booking lives on separate DirectStays microsites** under a distinct consumer sub-brand (Escapade), keeping qualco.ca purely owner-facing — a deliberate, copyable brand-architecture decision.

Relevant page URLs analyzed: `/`, `/services`, `/revenue-management`, `/property-management`, `/listing-optimization`, `/pricing`, `/about`, `/faq`, `/contact`, plus guest microsites `qualcorentals.directstays.com` and `escapade.directstays.com`.