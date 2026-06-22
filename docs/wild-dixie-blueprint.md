I have full context now. The blueprint below is the complete deliverable — opinionated, build-ready, and mapped to the existing codebase.

---

# Wild Dixie Escapes — Build-Ready Strategy & Design Blueprint
### Premium full-service vacation-rental management • Ain Sokhna first • Egyptian-tailored

---

## A) BRAND

### The name — how to use it
**"Wild Dixie Escapes"** is an English, slightly Americana/coastal name. In Egypt's RTL Arabic market, fight on two fronts at once: keep the English wordmark as the premium "imported standard" signal, but give it a confident Arabic lockup so it doesn't read as foreign-only.

- **Primary wordmark (logo):** `Wild Dixie Escapes` set in English, always. This is the badge — premium, ownable, hard to copy.
- **Short form / app name / favicon:** **"WDX"** or **"Wild Dixie"** (drop "Escapes" when space is tight). Use **WDX** as the operational shorthand (gate-pass cards, statements, WhatsApp signature).
- **Arabic treatment — DO NOT translate literally.** "Dixie" has no clean Arabic equivalent and a literal translation kills the premium feel. Use a **transliteration lockup + an Arabic descriptor tagline**:
  - Transliterated lockup (for Arabic body contexts): **وايلد ديكسي** with the descriptor beneath: **لإدارة الشاليهات والوحدات الساحلية**.
  - So the Arabic-page header reads: **وايلد ديكسي إسكيبس — إدارة متكاملة لوحدتك الساحلية**.
- **Rule:** the *logo* is always English; the *value proposition* is always Arabic. Arabic carries the trust ("ندير وحدتك بالكامل")، English carries the prestige.

### Taglines (3 options, EN + AR)
Each is benefit-led and uses qualco's "short clauses" rhythm, but Egyptianized to **trust + passive income + you keep ownership**:

1. **"Your chalet. Fully managed. Truly passive."**
   AR: **«شاليهك… بإدارة كاملة… ودخل بدون مجهود.»**
   *(Best all-rounder — leads on the owner's #1 want: hands-off income.)*

2. **"We hold the keys. You keep the income."**
   AR: **«إحنا بنشيل الهم… وانت بتقبض.»**
   *(Most colloquial/Egyptian, highest emotional resonance, great for WhatsApp/ads.)*

3. **"Premium management for Egypt's coast — starting in Ain Sokhna."**
   AR: **«إدارة فندقية لوحدتك على البحر — نبدأ من العين السخنة.»**
   *(Most positioning-explicit; use as the homepage H1 sub.)*

> **Recommendation:** Use #1 as the master tagline, #2 in ads/social/WhatsApp, #3 as homepage subhead.

### Brand tone
- **Calm, confident, concierge — never hypey.** Qualco's "peace of mind / protect your asset" voice, but warmer and more personal (Egypt buys on relationship, not on funnels).
- **Arabic register:** Egyptian colloquial-but-respectful (يا فندم / حضرتك tone in support, clean MSA-lite in headers). Avoid stiff formal Arabic — it reads like a government form.
- **Always lead with trust + transparency**, never with "list on Airbnb." Three voice pillars: **مطمّن (reassuring)، شفّاف (transparent)، محترف (professional).**
- **WhatsApp-first voice:** short, human, fast. "تمام يا فندم، الحجز اتأكد ✅ هبعتلك كشف الشهر آخر الشهر."

### Color palette (premium + coastal + Egyptian — replaces the generic teal)
The current teal/coral is generic SaaS. Go for a **deep-sea navy + warm gold** premium scheme — Red Sea depth + Egyptian gold, which reads luxurious and is distinct from every teal competitor.

| Token | Hex | Role |
|---|---|---|
| `--wdx-navy` (primary) | **`#0B2E3C`** | Deep Red Sea navy — headers, nav, dark stat bands, footer |
| `--wdx-gold` (accent) | **`#C9A24B`** | Egyptian gold — primary CTAs, price pills, badges, underlines |
| `--wdx-sand` (surface) | **`#F4EDE1`** | Warm sand — section backgrounds, cards (not cold white) |
| `--wdx-aqua` (secondary) | **`#2E8B9E`** | Muted Sokhna aqua — links, icons, secondary accents |
| `--wdx-coral` (alert/limited) | **`#E2725B`** | Terracotta — "spots limited"/cancellation/urgency only |
| `--wdx-ink` (text) | **`#10222A`** | Body text on light |
| `--wdx-mist` (muted) | **`#7C8A91`** | Secondary text, captions |

**Why this wins:** navy+gold = "fund-managed asset, premium hospitality"; sand backgrounds avoid the cold-tech feel; aqua keeps the coastal cue without being another teal startup. **Gold CTA on navy is the signature** — distinctive, premium, and screenshots well on WhatsApp/FB.

> Migration note for the codebase: keep your existing coral as `--wdx-coral` (urgency role only) so you don't throw away work; add navy/gold/sand/aqua to `tailwind.config` and retheme `globals.css` tokens.

---

## B) POSITIONING

**One-paragraph positioning:**
> Wild Dixie Escapes is **Egypt's first trust-first, full-service management company for coastal second homes — purpose-built for Ain Sokhna**. Unlike qualco.ca, a foreign operator that lists "Egypt" as one of many far-flung markets with no local feet, no Arabic-first product, and no answer to gate passes or InstaPay, we are **on the ground, Arabic-first, and built around the exact way Egyptian compounds, payments, and owners actually work**. And unlike the informal Facebook/WhatsApp brokers who take a finder's fee, vanish, report nothing, and let your عربون disappear, we run **every pound through a managed account, document every check-in/out with photos, handle the gate app and guest passes ourselves, and send you a clean monthly statement** — gross, fees, and net, side by side. We don't just rent your chalet; we **turn an idle inflation-hedge into truly passive, transparent income while you keep full ownership and veto control.**

**Core OWNER promise:**
> **"Hand us the keys, keep the ownership — get a clean monthly statement and InstaPay payout, with zero hassle."** No upfront fee, a cancel-anytime trial, you approve bookings, we handle gate passes, cleaning, guests, maintenance and money — and you see every pound.

**Core GUEST promise:**
> **"Verified, professionally managed Ain Sokhna chalets — real photos, gate access sorted, instant WhatsApp support, no broker games."** What you book is what you get; check-in, gate pass, and help are handled by one accountable team.

---

## C) FULL SITE INFORMATION ARCHITECTURE

Brand-architecture decision (copying qualco's smart move, improved): **one domain, two clearly-signposted doors** — owner-acquisition and guest-booking — instead of splitting to a separate guest microsite. Egypt's referral-driven market benefits from one trusted brand. Use a top-level audience switch.

### Top navigation (RTL — reads right→left)
```
[ Logo: Wild Dixie Escapes ]   الرئيسية | لمُلّاك الوحدات ▾ | احجز في السخنة ▾ | الخدمات | الأسعار | من نحن ▾ | [🟡 احسب دخلك مجانًا]  | [واتساب] | [دخول]
```
- **لمُلّاك الوحدات (Owners) ▾** → كيف نعمل · خدماتنا · حاسبة الدخل · لوحة المالك · ليه وايلد ديكسي · الأسئلة الشائعة
- **احجز في السخنة (Book) ▾** → كل الشاليهات · حسب الكمبوند (Azha/La Vista/Malibu...) · العروض · مناطق قادمة (waitlist)
- **من نحن ▾** → قصتنا · التراخيص والثقة · المدونة · تواصل معنا
- **Persistent primary CTA (gold):** **احسب دخلك مجانًا** → owner estimator/lead (the qualco "Get a Free Estimate" equivalent, but a real instrumented tool).
- **Persistent secondary:** floating **WhatsApp** button (bottom-left RTL), present on every page.

### Footer (4 columns + bar)
- **Col 1 — Wild Dixie Escapes:** logo, one-line positioning, "مرخّص — وزارة السياحة" trust line, social.
- **Col 2 — للمُلّاك:** سجّل وحدتك · حاسبة الدخل · كيف نعمل · لوحة المالك · الأسعار.
- **Col 3 — للضيوف:** احجز في السخنة · حسب الكمبوند · سياسة الإلغاء · الدفع (InstaPay/فودافون كاش) · المرافق على الضيف.
- **Col 4 — تواصل:** WhatsApp (primary), phone, email, Ain Sokhna address, "مناطق قادمة: الساحل · الجونة" waitlist link.
- **Bar:** © Wild Dixie Escapes 2026 · الشروط · الخصوصية · رخصة التشغيل #.

### OWNER side — page-by-page

| Page | Purpose | Key sections / tabs / lists |
|---|---|---|
| **/owners (Owners landing)** | Convert owners → free estimate / lead | Hero · trust band · 3-step · services grid · **earnings estimator** · stats · testimonials · pricing · FAQ · lead form (full §E) |
| **/owners/how-it-works** | De-risk the switch | 3 steps (استشارة مجانية → تجهيز وتسعير → إدارة كاملة) · timeline · "you keep veto + no lock-in" · what we need from you (national ID, gate-app auth, keys) · onboarding checklist |
| **/owners/services** | The full service stack | Tabbed/grid 14 services (see below) · per-compound gate-pass handling · cleaning/linen · dynamic pricing · maintenance cap (≤EGP 1,500) · reporting · guest vetting · what's included vs add-on |
| **/owners/calculator** | Standalone earnings estimator (deep link) | Inputs (area→compound, bedrooms, season, pool y/n) → est. monthly EGP gross / your net after 22% / occupancy unlocked · "this is an estimate" disclaimer · CTA → book consult |
| **/owners/dashboard** *(authed)* | The transparency moat made real | Tabs: **الكشف الشهري (statement)** · **الحجوزات** · **التقويم** · **المدفوعات/InstaPay** · **الصيانة** · **الموافقات (approve bookings)** · documents/license |
| **/owners/why-us** | Beat qualco + brokers head-on | Comparison table (WDX vs qualco vs Facebook broker) · licensing · transparency proof (sample statement) · referral wall by compound |
| **/owners/faq** | Objection-handling | Grouped accordion: التغطية · العمولة والأسعار · الثقة والأمان · الكمبوند والبوابة · المدفوعات · الإلغاء |

**The 14 owner services (rebuilt from qualco, Egyptianized):**
تسعير ديناميكي (weekend/holiday/season tiering) · توزيع على المنصات (Airbnb/Booking + our direct site) · تحسين القائمة والصور الاحترافية · **تصاريح البوابة وأكواد الشاطئ (gate/QR passes)** · نظافة وتغيير مفروشات موثّق بالصور · صيانة عند الطلب بسقف مصاريف · فحص الضيوف (National ID + تأمين) · تحصيل المدفوعات عبر InstaPay/فودافون كاش · كشف شهري شفّاف (gross/fees/net) · تواصل الضيوف 24/7 واتساب · إدارة التقييمات · استلام/تسليم المفاتيح موثّق · الامتثال ورخصة التشغيل · شريك إدارة مخصص لكل مالك (dedicated manager).

### GUEST side — page-by-page

| Page | Purpose | Key sections / tabs / lists |
|---|---|---|
| **/sokhna (Browse — guest home for the market)** | OTA-style discovery | Hero (Sokhna) · filter bar (compound, dates, guests, bedrooms, pool, price) · **card grid** (cover, title, compound, capacity row, price/night pill, "مُدار بواسطة وايلد ديكسي" badge) · map · "مناطق قادمة" waitlist strip |
| **/sokhna/compound/[name]** | Hyper-local SEO + trust | Compound hero + intro · gate/beach-access note · stays in this compound grid |
| **/stays/[id] (Property detail)** | Convert to booking | Gallery · title/compound/capacity · **amber "المرافق على الضيف" badge** · amenities · gate-pass & access section · house rules · **strict cancellation note (coral)** · map · sticky booking card (dates → quote → عربون 25%) · ShareProperty (WhatsApp/OG) · "مُدار باحتراف" trust block |
| **/book/[id] (Booking flow)** | Take the booking | Date/guest select → quote (عربون vs full) → guest details (National ID + **car plate for gate**) → payment (InstaPay/Vodafone receipt upload or card) → pending_approval → confirmed · WhatsApp confirmation |
| **/guest/bookings** *(authed)* | Guest self-service | List + detail (receipt upload, gate-pass status, check-in info, cancel w/ fee warning) |

---

## D) HOMEPAGE — exact section-by-section

> The homepage is the **owner master-funnel** (qualco model) with a clear guest door. RTL. Gold CTAs on navy.

**1. Hero** (full-bleed Sokhna chalet photo, navy overlay, left/right-aligned RTL)
- H1: **«شاليهك على البحر… بإدارة كاملة ودخل بدون مجهود.»**
- Sub: **«وايلد ديكسي إسكيبس بتدير وحدتك في العين السخنة من الألف للياء — تسعير، ضيوف، نظافة، تصاريح البوابة، وتحصيل عبر إنستاباي — وانت بتستلم كشف شهري واضح. تملّكك للوحدة بالكامل، وموافقتك على كل حجز.»**
- Primary CTA (gold): **«احسب دخل وحدتك مجانًا»** · Secondary (ghost): **«اعرف إزاي بنشتغل»**
- Small line under buttons: **«من غير مقدّم • تقدر تلغي في أي وقت • مرخّص»**

**2. Trust band** (sand bg, grayscale row)
- Lead-in: **«موثوق من ملّاك العين السخنة — وموزّعون على»** → Airbnb · Booking.com · + «مُرخّص من وزارة السياحة» · «تحصيل عبر InstaPay / فودافون كاش».

**3. How it works — 3 steps** (3 numbered cards)
- **استشارة مجانية** — «نتعرّف على وحدتك وأهدافك وتوقعاتك للدخل.»
- **تجهيز وتسعير** — «تصوير احترافي، قائمة محسّنة، وتسعير ديناميكي يلتقط فرق نهاية الأسبوع والمواسم.»
- **إدارة كاملة** — «نتولّى الضيوف، النظافة، البوابة، الصيانة، والتحصيل — وانت بتستلم كشف وفلوس كل شهر.»

**4. Services grid** (sand, 14 cards icon+title+sentence — list in §C)
- Heading: **«اهتمام بأدق التفاصيل»** · CTA below: **«شوف كل الخدمات»**

**5. Stats band** (dark navy bg, 3 big gold numbers — Egyptianized, honest framing)
- **«+9–10 شهور تأجير في السنة»** — «العين السخنة قريبة من القاهرة وطلبها قوي طول السنة، مش موسم واحد بس.»
- **«شفافية 100% في الكشف الشهري»** — «إجمالي، عمولة، وصافي — جنب بعض. حاجة الـ Facebook brokers مبيعملوهاش.»
- **«كل جنيه عبر حساب مُدار»** — «تحصيل وتوثيق عبر InstaPay — مفيش كاش بيلف، ومفيش عربون بيضيع.»

> (Use real qualco-style "up to 30% more revenue / 15+ hrs saved" once you have local data — for launch, lead with year-round occupancy + transparency, which you *can* defend.)

**6. Featured Ain Sokhna stays** (card grid, 6 units — the guest door on the owner homepage)
- Heading: **«شاليهات مختارة في العين السخنة»** · each card: cover, title, compound, capacity, price/night gold pill, **«مُدار بواسطة وايلد ديكسي»** badge · CTA: **«شوف كل الشاليهات»** → /sokhna.

**7. Owner CTA band** (gold band on navy, the conversion repeat)
- **«وحدتك قاعدة فاضية؟ خلّيها تكسب.»** → **«احسب دخلك مجانًا»** + **«كلّمنا واتساب»**.

**8. Testimonials** (3-up → slider; one per persona, qualco improved)
- Heading: **«المُلّاك بيقولوا إيه»**
- مالك مقيم في القاهرة: «وحدتي في أزها كانت قاعدة طول السنة. دلوقتي بتكسب وأنا مش بعمل حاجة — والكشف بيوصلني آخر كل شهر.»
- مالكة مغتربة: «كنت خايفة أسلّم المفتاح. التوثيق بالصور والكشف الشهري طمّنوني تمامًا.»
- مالك مستثمر (٣ وحدات): «التسعير الديناميكي رفع دخلي بشكل واضح في الويك-إند والمواسم.»

**9. FAQ** (grouped accordion — التغطية / الأسعار / الثقة / البوابة / المدفوعات / الإلغاء)

**10. Closing estimator/lead section** ("See your property's potential" equivalent)
- H2: **«اعرف دخل وحدتك المتوقّع»** · Sub: **«املا البيانات وفريقنا هيتواصل معاك على واتساب في أسرع وقت — من غير أي التزام.»**
- The earnings estimator inline + lead form (name, WhatsApp, compound, bedrooms).

**11. Footer** (per §C).

---

## E) OWNERS LANDING PAGE — section-by-section

**1. Hero** — H1 **«حوّل شاليهك الفاضي لدخل شهري ثابت — في العين السخنة.»** · sub: trust + no-lock-in · gold CTA «احسب دخلك مجانًا».

**2. Trust/credibility band** — مرخّص وزارة السياحة · InstaPay payouts · توثيق بالصور · موزّع على Airbnb/Booking.

**3. Problem→promise** — «وحدتك أصل بيتآكل بالتضخم وقاعد فاضي. إحنا بنحوّله لدخل — وانت محتفظ بالملكية الكاملة والموافقة على كل حجز.»

**4. How it works (3 steps)** — استشارة مجانية → تجهيز وتسعير → إدارة كاملة (+ "no upfront fee, 3-month cancellable trial, you keep veto").

**5. Services grid** — 14 cards (§C).

**6. EARNINGS ESTIMATOR** *(the hero feature — concept spec)*

> A real, instrumented tool (not qualco's vague "AI estimate"). Client-side calc with a server lead-capture.

- **Inputs:**
  1. **المنطقة/الكمبوند** (select: Ain Sokhna live → Azha / La Vista / Malibu / Porto Sokhna / Telal / "أخرى". North Coast / El Gouna shown **disabled with "قريبًا — انضم لقائمة الانتظار"**).
  2. **عدد الغرف** (1 / 2 / 3 / 4+).
  3. **الموسم** (toggle/segmented: شتاء off-peak · ربيع/خريف · صيف peak — or "متوسط السنة").
  4. **حمام سباحة خاص؟** (yes/no — material to ADR).
  5. *(optional)* نهاية الأسبوع فقط vs طول الأسبوع.
- **Calc model (defensible, from the brief — bake as a config table):**
  - Base ADR by bedrooms (EGP): 1BR ≈ 3,000 · 2BR ≈ 4,500 · 3BR ≈ 6,500 · 4BR+ ≈ 9,000 (median anchor ≈ EGP 4,500–5,000 / ~$99).
  - Private pool multiplier ×1.3.
  - Season multiplier: off-peak ×0.55 · shoulder ×1.0 · peak ×1.8 (winter 40–50% below summer; weekend 50–100% premium folded into peak).
  - Compound premium factor (Azha/Telal higher).
  - Occupancy nights/mo: off-peak ~8–10 · shoulder ~12 · peak ~18–22.
- **Output (the reveal):**
  - **«الدخل الشهري المتوقّع: ~EGP 45,000–55,000»** (gross range)
  - **«نصيبك بعد عمولة 22%: ~EGP 35,000–43,000»** + **«+ النظافة على الضيف (مش بتتخصم منك)»**
  - **«الليالي اللي بنفتحها لك شهريًا: ~12–18»** (the "you'd have left this empty" frame)
  - Disclaimer: **«تقدير مبدئي بناءً على بيانات السوق — الرقم النهائي بيتحدد بعد معاينة وحدتك.»**
  - CTA: **«احجز استشارة مجانية»** → lead form prefilled with the inputs (instrument every field: compound, bedrooms, season, pool, computed estimate, source/UTM).

**7. Stats band** (navy/gold — year-round occupancy · transparency · managed account).

**8. Egypt-adapted trust signals block** (the differentiator wall — 6 tiles):
- **تصاريح البوابة وأكواد الشاطئ** — «بندير تطبيق البوابة بتاعك ونصدر تصريح لكل ضيف بإذن مكتوب — صداع اللوجستيات ده إحنا اللي بنشيله.»
- **فحص بالرقم القومي** — «كل ضيف برقمه القومي وتأمين قابل للاسترداد — تعرف مين في بيتك.»
- **تحصيل عبر InstaPay** — «كل جنيه عبر حساب مُدار، موثّق وفوري وبدون رسوم — مفيش كاش بيضيع.»
- **لوحة مالك شفّافة** — «شوف الحجوزات، التقويم، والكشف الشهري لحظة بلحظة.»
- **توثيق دخول/خروج بالصور** — «صور قبل وبعد كل ضيف + مطالبات أضرار موثّقة.»
- **مرخّص وموافقتك أولًا** — «رخصة تشغيل + موافقتك على كل حجز في البداية. من غير لوك-إن.»

**9. Comparison table** (WDX vs qualco.ca vs Facebook broker) — local feet, Arabic-first, gate passes, InstaPay, monthly statement, licensed: ✓/✗ grid.

**10. Pricing** — single honest model: **عمولة 22% من إجمالي الإيجار** (full-service) · «النظافة على الضيف» · «من غير مقدّم • تجربة 3 شهور قابلة للإلغاء» · "satisfaction/cancel-anytime" link. (Skip qualco's confusing 4-tier good/better; one clear number beats brokers' opaque finder's fee. Optionally add a future **«Lite — 15%»** half-service tier later.)

**11. Testimonials** (compound-referral framed — §D8).

**12. FAQ** (grouped).

**13. Lead form + WhatsApp** — name · WhatsApp · compound · bedrooms · "أحسن وقت نكلمك" → **«ابدأ مجانًا»**; parallel **«كلّمنا واتساب دلوقتي»** (the Egyptian "Calendly" = WhatsApp).

---

## F) EGYPTIAN ADAPTATIONS (baked into every surface)

| Adaptation | Where it lives in product | Status vs codebase |
|---|---|---|
| **InstaPay / Vodafone Cash payouts** | Owner dashboard payout section; guest checkout receipt-upload → AWAITING_REVIEW → admin approve. `users.instapay_handle` / `vodafone_cash_number` already exist. | **Built** — surface it harder on owner side. |
| **Security gate passes** | Property detail "access" section; booking collects `guest_car_plate` + National ID; owner service "ندير تطبيق البوابة"; per-compound access playbook. | Plate/ID **built**; add per-compound gate-pass workflow + status field. |
| **Gated-compound rules** | Per-compound page + onboarding compliance checklist (rentals allowed? pass fee? max occupancy? beach code?). `resorts` table → extend with `rental_allowed`, `gate_app`, `beach_code_required`. | **New** — add compound compliance fields. |
| **Utilities paid by guest** | Amber badge on detail + checkout (`utilities_paid_by_guest` default true). | **Built.** |
| **Strict cancellation** | Coral warning on detail/booking; <7d → 100% fee (`cancellation_fee_*`). | **Built.** |
| **WhatsApp-first comms** | Floating WA button site-wide; WA confirmation on booking; owner "كلّمنا واتساب"; estimator → WA lead. `ShareProperty` wa.me already exists. | Partial — make WA the **primary** CTA everywhere. |
| **Ain Sokhna-first + waitlist** | Estimator/nav/footer show Sokhna live, North Coast/Gouna **disabled "قريبًا" + waitlist capture**. 72 resorts already seeded w/ governorate. | Filter to Sokhna for launch; add waitlist email/WA capture. |
| **عربون + تأمين** | Quote shows عربون 25% vs full; refundable تأمين separate from commission base. | عربون **built**; expose تأمين (refundable deposit) distinctly. |

---

## G) PHASED IMPLEMENTATION PLAN (mapped to the existing codebase)

You already have the **engine** (auth, properties, calendar, bookings+locks, payments, payouts/commission, admin, 72 resorts, importer). The gap is **brand + the owner-acquisition front-end + Sokhna focus + gate/compound layer**. Prioritize ruthlessly: ship the owner funnel + rebrand to "hit hard" with Sokhna; defer everything not on that path.

### PHASE 1 — "Hit hard with Ain Sokhna" (rebrand + owner funnel) — **2–3 weeks, do first**
*Goal: a live, premium, Arabic-first Wild Dixie site that converts Sokhna owners.*
1. **Rebrand pass** — replace teal/coral with navy/gold/sand/aqua in `tailwind.config` + `globals.css`; new wordmark/logo "Wild Dixie Escapes"; update PWA name/icons; nav + footer per §C. *(Pure frontend; no DB.)*
2. **Owners landing `/owners`** — build §E sections as a Next.js page. Reuse existing service/stat/testimonial card patterns.
3. **Earnings estimator** — client-side calc component from §E config table + lead-capture POST (new lightweight `/leads` endpoint, or reuse contact). Instrument inputs + computed estimate + UTM (`lib/attribution.ts` already captures UTM).
4. **Sokhna-first filter** — default `/sokhna` browse to `area=Ain Sokhna` (use existing `?area=` mechanic + `/catalog/destinations`); North Coast/Gouna → **"قريبًا" + waitlist** capture.
5. **WhatsApp-first** — floating WA button site-wide; make WA the secondary CTA on hero/CTA bands (reuse `ShareProperty` wa.me).
6. **Homepage rebuild** — §D owner-master-funnel layout over the existing home route.
7. **Honest stats + comparison table** — year-round/transparency/managed-account (no fabricated %).

> Phase-1 ships entirely on the **existing backend**; only addition is a `/leads` capture endpoint + waitlist. This is the "hit hard" surface.

### PHASE 2 — Owner trust & ops depth (the moat) — **3–4 weeks**
1. **Owner dashboard `/owners/dashboard`** (authed) — tabs: monthly **statement** (gross/fees/net from existing payout+commission ledger), bookings, calendar, payouts/InstaPay, **approve-bookings (veto)**. *This is the transparency differentiator made real.*
2. **Monthly statement generator** — aggregate bookings/payments/commission per owner per month (data already in `bookings`/`payment`/`finance` models) → PDF/printable + WhatsApp send.
3. **Gate-pass + compound compliance** — extend `resorts` (rental_allowed, gate_app, beach_code, pass_fee); add per-booking gate-pass status; owner onboarding compliance checklist.
4. **عربون/تأمين split** — surface refundable security deposit distinctly from عربون at quote/checkout.
5. **Owner onboarding flow** — "list your property" → national ID + gate-app authorization + keys handover logging (extend host wizard at `/host/new`).

### PHASE 3 — Distribution, polish, scale-prep — **ongoing**
1. **Guest-side polish** — `/sokhna/compound/[name]` SEO pages, map, reviews; sharper OG cards.
2. **Multi-platform sync** — lean on existing iCal (move scheduler to Celery beat for prod, already flagged).
3. **Real PSP + SMS provider + Meta Pixel ID + real domain** (already flagged in memory).
4. **Blog/SEO** (من نحن ▾) for "إيجار شاليهات العين السخنة" capture.

### PHASE 4 — Expansion (only after Sokhna proof: 20–30 managed units)
1. Flip **North Coast/Sahel** from waitlist → live (reuse the entire playbook; seasonal ops staffing plan).
2. **El Gouna** as a separate playbook (foreign-guest, Orascom-governed) — distinct config, later.

---

### Ruthless priority call-out
**Do in Phase 1, nothing else matters first:** (1) rebrand to navy/gold Wild Dixie, (2) `/owners` landing with the **earnings estimator**, (3) Sokhna-first browse + waitlist, (4) WhatsApp-first CTAs. That quartet is the entire "hit hard with Ain Sokhna" thesis — everything in Phase 2+ deepens trust *after* the owner has raised their hand.

---

**Key files referenced (existing codebase):**
- Frontend: `C:\Users\mdakr\egypt-rentals\frontend` (Next.js 14, App Router, RTL, PWA) — rebrand `tailwind.config` + `globals.css`; add `/owners`, estimator component; `lib/attribution.ts` (UTM), `components/ShareProperty.tsx` (WhatsApp) already present.
- Backend: `C:\Users\mdakr\egypt-rentals\backend` (FastAPI) — reuse bookings/payments/payouts/commission ledger for owner statement; extend `resorts` for compound compliance; add `/leads` + waitlist endpoint.