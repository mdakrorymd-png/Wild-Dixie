# نشر Wild Dixie Escapes على Vercel (الدومين الحقيقي wilddixie.com)

`DEPLOY.md` بيوصف نشر على Render. لكن فحص DNS لـ `wilddixie.com` و`www.wilddixie.com` بيّن إنهم بيشاورا على **Vercel** (`cname.vercel-dns.com`) — يعني ده مسار النشر الفعلي المربوط بالدومين الحقيقي. الريبو فيه بالفعل كل اللي محتاجه للنشر على Vercel (الباك-إند شغال كـ serverless function عبر `backend/vercel.json` + `backend/api/index.py`)، بس مفيش توثيق ليه — الملف ده بيسدّ الفجوة دي.

**المشروع محتاج مشروعين منفصلين على Vercel** (نفس الريبو، Root Directory مختلف لكل واحد):

## ١) مشروع الفرونت-إند

- **Root Directory:** `frontend`
- Vercel بيكتشف Next.js تلقائيًا — مفيش إعداد إضافي مطلوب في vercel.json.
- **متغيرات البيئة (Environment Variables):**

| المتغيّر | القيمة |
|---|---|
| `NEXT_PUBLIC_API_URL` | `/api/v1` |
| `BACKEND_ORIGIN` | رابط مشروع الباك-إند على Vercel (مثلاً `https://wild-dixie-api.vercel.app`) |
| `API_INTERNAL_URL` | نفس الرابط + `/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.wilddixie.com` |
| `NEXT_PUBLIC_WHATSAPP` | `201033388003` |
| `NEXT_PUBLIC_GA_ID` | معرّف GA4 بتاعك (اختياري — لو موجود، التتبّع بيشتغل تلقائيًا، شوف `components/Analytics.tsx`) |
| `NEXT_PUBLIC_FB_PIXEL_ID` | معرّف Meta Pixel بتاعك (اختياري، نفس الفكرة) |

- **الدومين:** `wilddixie.com` و`www.wilddixie.com` مربوطين بالفعل (DNS شغال) — لازم بس تضيفهم في Vercel → Project Settings → Domains لو مش مضافين هناك.

## ٢) مشروع الباك-إند (FastAPI كـ Serverless Function)

- **Root Directory:** `backend`
- `vercel.json` الموجود بيحوّل كل الطلبات لـ `api/index.py`، اللي بيشغّل تطبيق FastAPI نفسه (`app.main.app`) — من غير أي تعديل إضافي.
- **قاعدة البيانات:** Vercel مبيوفّرش Postgres مُدمج بشكل افتراضي — محتاج قاعدة بيانات خارجية. الكود في `app/core/config.py` مكتوب عشان يشتغل تلقائيًا مع **Neon** (شريك Vercel الرسمي لـ Postgres، متاح من Vercel Marketplace مباشرة) أو أي مزوّد تاني بيدّي رابط `postgres://`.
- **متغيرات البيئة المطلوبة:**

| المتغيّر | القيمة | ملاحظة |
|---|---|---|
| `ENVIRONMENT` | `production` | |
| `DATABASE_URL` | رابط Neon/Postgres | الكود بيحوّله تلقائيًا لصيغة `asyncpg` |
| `JWT_SECRET_KEY` | قيمة عشوائية طويلة وسرّية | **لازم** تتغيّر عن أي قيمة تجريبية |
| `PLATFORM_COMMISSION_PERCENT` | `20` | يطابق باكدج "الإدارة الكاملة" |
| `PLATFORM_INSTAPAY_ADDRESS` | `wilddixie@instapay` | |
| `PLATFORM_WALLET_NUMBER` | `01033388003` | |
| `ENABLE_ICAL_SCHEDULER` | `false` | **مهم:** Vercel serverless مبيشغّلش عمليات خلفية دائمة زي الجدولة — سيبها `false` زي Render، واستخدم [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) لو محتاج مزامنة iCal دورية بدل الجدولة الداخلية |
| `SMS_PROVIDER` | `smsmisr` | لازم تتغيّر من `console` (الافتراضي التجريبي) قبل أي استخدام حقيقي |
| `SMSMISR_USERNAME` / `SMSMISR_PASSWORD` / `SMSMISR_SENDER` | بيانات حسابك الحقيقية | مطلوبة لو `SMS_PROVIDER=smsmisr` |
| `EXPOSE_DEBUG_OTP` | `false` | **لازم تتأكد إنها false** — لو فضلت `true` هتظهر أكواد الـ OTP في استجابة الـ API لأي حد، وده ثغرة أمنية حقيقية على الإنتاج |
| `PUBLIC_BASE_URL` | رابط الباك-إند على Vercel | مستخدم لبناء روابط iCal |

- **الهجرات (migrations):** مفيش خطوة `buildCommand` بتشغّل `alembic upgrade head` زي Render، لكن `app/main.py` فيه آلية `_apply_pending_migrations()` بتطبّق الهجرات تلقائيًا وبأمان في كل تشغيل (idempotent) — مصمّمة أصلاً عشان تشتغل صح على بيئة serverless زي دي من غير خطوة build منفصلة.

## اللي لازم تتأكد منه

1. **قاعدة البيانات فعلاً موصولة** (Neon أو غيرها) — من غير `DATABASE_URL` صحيح الباك-إند مش هيشتغل خالص على Vercel.
2. **`SMS_PROVIDER` مش لسه `console`** — لو لسه كده، أكواد التحقق (OTP) مش بتتبعت فعليًا للمستخدمين.
3. **`BACKEND_ORIGIN` / `API_INTERNAL_URL` في مشروع الفرونت-إند بيشاورا فعلاً على رابط مشروع الباك-إند** — الاتنين مشروعين منفصلين على Vercel، لازم تربطهم ببعض يدويًا بالمتغيرات دي.
4. **`NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_FB_PIXEL_ID`** — لو عايز التتبّع يشتغل قبل أي إعلانات (شوف تقرير المراجعة الكامل في `docs/wild-dixie-v2-audit.md`).
