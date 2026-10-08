"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { EarningsEstimator } from "@/components/EarningsEstimator";
import { ServicesCarousel } from "@/components/ServicesCarousel";
import { Pricing } from "@/components/Pricing";
import { FeatureBlock } from "@/components/FeatureBlock";
import { WHATSAPP_URL, AIRBNB_LISTING_URL } from "@/lib/site";

// Real photo of the Wild Dixie–managed unit (sunset from the balcony).
const HERO = "/listings/beachfront/05.jpg";

const STEPS = [
  { n: "١", t: "معاينة مجانية", d: "بنعاين وحدتك في السخنة، بنصوّرها احترافي، وبنتفق على باكدج الإدارة المناسب ليك." },
  { n: "٢", t: "إحنا بنشغّلها", d: "تسعير ديناميكي، استقبال الضيوف، نظافة فندقية، تصاريح البوابة — كل التشغيل علينا." },
  { n: "٣", t: "انت بتستلم", d: "كشف شهري واضح: إجمالي، عمولة، صافي — وفلوسك عبر إنستاباي أو فودافون كاش." },
];

const OWNER_FAQ: [string, string][] = [
  ["بتاخدوا عمولة قد إيه؟", "من ١٠٪ (لو بتدير بنفسك وإحنا بس بنعرض وحدتك) لغاية ٢٨٪ للإدارة الفندقية الكاملة. مفيش رسوم تأسيس ولا اشتراك شهري — بنكسب لما تكسب."],
  ["مين بيتحكم في التواريخ والأسعار؟", "انت. بتوافق على كل حجز، وتقدر تقفل أي تواريخ لنفسك في أي وقت. إحنا بنقترح التسعير وانت صاحب القرار النهائي."],
  ["إزاي بتحموا وحدتي؟", "كل ضيف بيتسجل برقمه القومي ولوحة عربيته لتصريح البوابة، وفيه تأمين أضرار قابل للاسترداد، وتوثيق بالصور قبل وبعد كل إقامة."],
  ["الفلوس بتوصلني إزاي؟", "تحويل شهري عبر إنستاباي أو فودافون كاش مع كشف مفصّل لكل حجز — إجمالي، عمولة، وصافي."],
  ["لو عايز أخرج من الاتفاق؟", "الاتفاق مرن — تقدر توقف أو تخرج بإشعار ٣٠ يوم من غير أي غرامات."],
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in-view"); obs.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function Home() {
  useReveal();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: OWNER_FAQ.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ═══ 1 · HERO — owners ═══ */}
      <section className="full-bleed relative flex min-h-[92dvh] flex-col items-center justify-center overflow-hidden">
        <Image
          src={HERO}
          alt="غروب على شاطئ العين السخنة"
          fill priority sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "center 40%" }}
        />
        <div className="hero-overlay-cinema absolute inset-0" />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 pt-20 text-center text-white">
          <h1
            className="fade-up max-w-3xl font-bold leading-[1.15] tracking-tight drop-shadow-lg"
            style={{ fontSize: "clamp(2.2rem, 6vw, 4.5rem)" }}
          >
            حوّل شاليهك في السخنة
            <span className="text-gold"> لدخل شهري ثابت</span>
            <br />— من غير ما تشيل همّه.
          </h1>
          <p className="fade-up mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            إدارة فندقية كاملة: تسعير، ضيوف، نظافة، تصاريح بوابة، وتحصيل — وانت بتستلم كشف شهري واضح.
          </p>
          <div className="fade-up mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="#estimator" className="btn-primary px-8 py-3.5 text-base shadow-[0_12px_32px_-8px_rgba(201,162,75,0.55)]">
              احسب دخلك مجانًا
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank" rel="noopener noreferrer"
              className="btn border border-white/30 bg-white/10 px-7 py-3.5 text-base text-white backdrop-blur-sm hover:bg-white/20"
            >
              كلّمنا واتساب
            </a>
          </div>
          {/* Guest door — one clearly separated banner */}
          <Link
            href="/sokhna"
            className="fade-up mt-10 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
          >
            مش مالك؟ عايز تحجز شاليه؟ ←
          </Link>
        </div>
      </section>

      {/* ═══ 2 · 3-STEP PROCESS ═══ */}
      <div className="mx-auto max-w-6xl px-4">
        <section id="how" className="scroll-mt-24 py-20">
          <div className="reveal mb-12 text-center">
            <span className="text-xs font-semibold tracking-widest text-gold-dark uppercase">إزاي بنشتغل</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">٣ خطوات وشاليهك بيكسب</h2>
          </div>
          <div className="relative grid gap-8 sm:grid-cols-3">
            <div className="absolute top-9 right-[16.7%] left-[16.7%] hidden h-px bg-gradient-to-l from-gold/40 via-gold/20 to-gold/40 sm:block" />
            {STEPS.map((s, i) => (
              <div key={s.n} className={`reveal d${i + 1} flex flex-col items-center text-center`}>
                <div className="relative mb-5 grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-brand text-3xl font-bold text-gold shadow-[0_0_0_6px_rgba(11,46,60,0.1)] ring-1 ring-brand/20">
                  {s.n}
                </div>
                <h3 className="text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-sm leading-7 text-black/55">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ═══ 3 · SERVICES ═══ */}
      <section id="services" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 pb-4 text-center">
          <span className="reveal text-xs font-semibold tracking-widest text-gold-dark uppercase">الخدمات</span>
          <h2 className="reveal mt-2 text-3xl font-bold sm:text-4xl">كل التشغيل — علينا</h2>
        </div>
        <ServicesCarousel />
      </section>

      <div className="mx-auto max-w-6xl px-4">

        {/* ═══ 4 · KEY FEATURE ═══ */}
        <section id="manage" className="scroll-mt-24 space-y-20 py-16">
          <FeatureBlock
            /* TODO: replace with real photo */
            image="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80"
            eyebrow="دخل بدون مجهود"
            title="انت بتقبض… واحنا بنشتغل"
            body="سيبلنا الضيوف، التسعير، التحصيل، والصيانة — واستلم دخلك كل شهر عبر إنستاباي مع كشف واضح."
            bullets={["كشف شهري شفّاف: إجمالي وعمولة وصافي","تحويل عبر إنستاباي / فودافون كاش","موافقتك على كل حجز + تملّك كامل"]}
          />
          <FeatureBlock
            reverse
            /* TODO: replace with real photo */
            image="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80"
            eyebrow="أمان الكمبوند"
            title="تصاريح البوابة من غير صداع"
            body="بندير تطبيق البوابة بإذنك ونصدر تصريح لكل ضيف برقمه القومي ولوحة عربيته — كل ضيف موثّق ومعروف."
            bullets={["تصاريح بوابة وأكواد شاطئ لكل ضيف","فحص بالرقم القومي + تأمين قابل للاسترداد","تنسيق كامل مع إدارة الكمبوند"]}
          />
        </section>

        {/* ═══ 5 · PRICING ═══ */}
        <section id="pricing" className="scroll-mt-24">
          <Pricing />
        </section>

        {/* ═══ 5b · WHO WE ARE — owner trust ═══ */}
        <section id="who" className="scroll-mt-24 py-16">
          <div className="reveal card overflow-hidden sm:flex">
            <div className="relative h-72 bg-brand-light sm:h-auto sm:w-2/5">
              <Image
                src="/team/founder.jpg"
                alt="مؤسس Wild Dixie"
                fill sizes="(max-width:640px) 100vw, 40vw"
                className="object-cover"
                style={{ objectPosition: "center 30%" }}
              />
            </div>
            <div className="flex flex-col justify-center p-7 sm:w-3/5">
              <span className="text-xs font-semibold tracking-widest text-gold-dark uppercase">مين وراء Wild Dixie</span>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                أنا مالك في الزعفرانة زيك — بديرها لنفسي قبل ما أديرها ليك.
              </h2>
              <p className="mt-3 text-sm leading-8 text-black/60">
                {/* TODO(Mohamed: تأكيد/تعديل نبذة المؤسس) */}
                خلفيتي بين العمارة والتشغيل، وعندي وحدة في إمباير ريزورت بديرها بنفسي — نفس النظام اللي بطبّقه على
                وحدتي هو اللي بشغّل بيه وحدتك: تسعير مدروس، ضيوف موثّقين، وكشف شهري واضح. مش شركة مجهولة على النت —
                ده شغلي وسمعتي في السوق اللي انت فيه.
              </p>
              {AIRBNB_LISTING_URL && (
                <a
                  href={AIRBNB_LISTING_URL}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-4 inline-flex text-sm font-semibold text-brand underline underline-offset-4"
                >
                  شوف تقييمات وحدتي الحقيقية على Airbnb ←
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ═══ 6 · ESTIMATOR ═══ */}
        <section id="estimator" className="scroll-mt-24 py-16">
          <div className="reveal mb-8 text-center">
            <span className="text-xs font-semibold tracking-widest text-gold-dark uppercase">الدخل المتوقع</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">اعرف دخل وحدتك المتوقّع</h2>
            <p className="mt-2 text-sm text-black/50">تقدير مبدئي — الرقم النهائي بعد المعاينة. من غير أي التزام.</p>
          </div>
          <EarningsEstimator />
        </section>

        {/* ═══ 7 · REAL SOCIAL PROOF — the live unit we operate ═══ */}
        <section className="py-12">
          <div className="reveal card overflow-hidden sm:flex">
            <div className="relative h-56 sm:h-auto sm:w-2/5">
              <Image
                src="/listings/beachfront/01.jpg"
                alt="شاليه الصف الأول على البحر — إمباير ريزورت، العين السخنة"
                fill sizes="(max-width:640px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-7 sm:w-3/5">
              <span className="text-xs font-semibold tracking-widest text-gold-dark uppercase">وحدة بندرها فعليًا</span>
              <h3 className="mt-2 text-2xl font-bold">Beachfront First Row — إمباير ريزورت</h3>
              <p className="mt-2 text-sm leading-7 text-black/55">
                أول صف على البحر مباشرة في العين السخنة — نفس الوحدة معروضة على Airbnb بتقييمات حقيقية،
                وبتتحجز مباشرة من موقعنا بدون رسوم خدمة.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/sokhna/beachfront-first-row" className="btn-navy px-6">شوف الوحدة</Link>
                {AIRBNB_LISTING_URL && (
                  <a href={AIRBNB_LISTING_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand underline underline-offset-4">
                    تقييماتنا على Airbnb ←
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 8 · OWNER FAQ + CONTACT ═══ */}
        <section id="faq" className="scroll-mt-24 py-16">
          <div className="reveal mb-8 text-center">
            <span className="text-xs font-semibold tracking-widest text-gold-dark uppercase">أسئلة المُلّاك</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">عندك سؤال؟</h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-2">
            {OWNER_FAQ.map(([q, a]) => (
              <details key={q} className="reveal card group overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 font-medium transition-colors hover:text-brand">
                  {q}
                  <span className="text-gold-dark text-lg transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="border-t border-brand/[0.06] px-6 py-4 text-sm leading-7 text-black/60">{a}</p>
              </details>
            ))}
          </div>
          <div className="reveal mt-12 rounded-3xl bg-brand px-8 py-12 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">جاهز تبدأ؟</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/65">كلمنا واتساب أو احسب دخلك — وهنرد عليك في نفس اليوم.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary px-8 py-3">
                واتساب مباشر
              </a>
              <Link href="#estimator" className="btn border border-white/25 bg-white/10 px-7 py-3 text-white hover:bg-white/20">
                احسب دخلك
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
