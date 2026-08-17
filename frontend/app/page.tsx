"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PropertyListItem } from "@/lib/types";
import { PropertyCard } from "@/components/PropertyCard";
import { EarningsEstimator } from "@/components/EarningsEstimator";
import { ServicesCarousel } from "@/components/ServicesCarousel";
import { Pricing } from "@/components/Pricing";
import { FeatureBlock } from "@/components/FeatureBlock";
import { WARM_HERO } from "@/lib/images";

const HERO = WARM_HERO;

// Owner onboarding flow — this is the pre-inventory, pre-trust business Wild
// Dixie actually is today, so the homepage leads with it, not with guest booking.
const OWNER_STEPS = [
  { n: "١", t: "استشارة مجانية", d: "بنتعرّف على وحدتك، أهدافك، وتوقّعاتك للدخل — من غير أي التزام." },
  { n: "٢", t: "تجهيز وتسعير", d: "تصوير احترافي، قائمة محسّنة، وتسعير ديناميكي يلتقط فرق الويك-إند والمواسم." },
  { n: "٣", t: "إدارة كاملة", d: "نتولّى الضيوف، النظافة، البوابة، الصيانة، والتحصيل — واستلم كشف وفلوس كل شهر." },
];

// Why book direct vs. the global platforms — kept as supporting content for the
// guest sub-audience further down the page, not the homepage's opening pitch.
const COMPARE: { label: string; us: string; them: string }[] = [
  { label: "رسوم خدمة إضافية على الضيف", us: "صفر — السعر واضح ومباشر", them: "١٥-٢٠٪ رسوم بتتضاف على السعر" },
  { label: "تواصل مع المضيف / الإدارة", us: "واتساب مباشر وفوري", them: "عبر المنصة فقط — ممنوع الاتصال" },
  { label: "طريقة الدفع", us: "إنستاباي / محفظة / بالجنيه", them: "كارت دولاري أو تحويل دولي" },
  { label: "معرفة بالسخنة", us: "فريق محلي يعرف كل كمبوند", them: "دعم عام بالإنجليزي" },
  { label: "تصريح البوابة والكمبوند", us: "بنجيبه لك قبل الوصول", them: "انت مسؤول تتواصل مع المالك" },
];

const FAQ: [string, string][] = [
  ["هفقد السيطرة على وحدتي؟", "لأ. الوحدة ملكك بالكامل، وانت اللي بتوافق على كل حجز في البداية. تقدر تستخدمها شخصيًا وتقدر تلغي الاتفاق معانا في أي وقت."],
  ["فيه مقدّم أو التزام مدة معيّنة؟", "لأ — من غير مقدّم مبدئي، وتقدر تلغي الاتفاق في أي وقت. مفيش لوك-إن."],
  ["هعرف دخلي إزاي بالظبط؟", "بتستلم كشف شهري شفّاف من لوحة المالك: إجمالي الإيجار، العمولة، وصافي دخلك جنب بعض — وتحويل عبر إنستاباي."],
  ["فيه فرق بين الباكدجات التلاتة إيه؟", "«لايت» (١٥٪) لو هتدير النظافة والمفاتيح بنفسك واحنا بنجيب الحجوزات بس. «الإدارة الكاملة» (٢٠٪) نتولى كل حاجة. «بريميوم» (٢٨٪) زي الكاملة + تجهيز وديكور وتصوير سينمائي واستقبال VIP."],
  ["عندي شاليه بس مش عايز إدارة كاملة؟", "تقدر تعرض وحدتك بنفسك مجانًا (استيراد من Airbnb في ٢٠ ثانية أو إضافة يدوية) وتدفع عمولة ١٠٪ على الحجز بس — من غير أي إدارة منّا."],
];

export default function Home() {
  const [featured, setFeatured] = useState<PropertyListItem[]>([]);
  const [openFaq, setOpenFaq] = useState(-1);

  useEffect(() => {
    api.searchProperties({ area: "Ain Sokhna", limit: 6 }).then((p) => setFeatured(p.items)).catch(() => undefined);
  }, []);

  return (
    <div>
      {/* 1. Hero — owner-first: Wild Dixie is pre-inventory, pre-trust; the homepage's
          job is convincing an owner to hand over a property, not selling a booking. */}
      <section className="full-bleed relative mb-12 h-[600px] overflow-hidden sm:h-[670px]">
        <Image src={HERO} alt="شاليه على بحر العين السخنة وقت الغروب" fill priority className="object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 mx-auto flex max-w-4xl flex-col items-center justify-center px-5 pt-16 text-center text-white">
          <span className="mb-4 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur fade-up">
            إدارة متكاملة لوحدتك الساحلية — العين السخنة
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight drop-shadow sm:text-5xl fade-up">
            شاليهك في السخنة قاعد فاضي؟ حوّله لدخل شهري ثابت.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 fade-up">
            وايلد ديكسي إسكيبس بتدير وحدتك من الألف للياء — تسعير، ضيوف، نظافة، تصاريح البوابة، وتحصيل عبر إنستاباي — وانت بتستلم كشف شهري واضح. الوحدة تفضل ملكك بالكامل، وموافقتك على كل حجز.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 fade-up">
            <Link href="#estimator" className="btn-primary px-7 py-3 text-base">احسب دخلك مجانًا</Link>
            <a href="https://wa.me/201033388003" target="_blank" rel="noopener noreferrer" className="btn-outline border-white/40 bg-white/10 px-6 py-3 text-base text-white hover:bg-white/20">كلّمنا واتساب</a>
          </div>
          <p className="mt-3 text-xs text-white/60 fade-up">من غير مقدّم · تقدر تلغي في أي وقت</p>
          <Link href="/sokhna" className="mt-4 text-sm text-white/80 underline-offset-4 hover:text-white hover:underline fade-up">
            عايز تحجز شاليه بدل ما تعرض وحدتك؟ شوف الشاليهات المتاحة ←
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-1">
        {/* 2. Trust band — honest, defensible owner claims (no fabricated %). */}
        <section className="full-bleed mb-16 bg-brand py-16 text-white">
          <div className="mx-auto max-w-6xl px-4">
            <p className="mb-10 text-center text-sm font-semibold tracking-widest text-gold/80 uppercase">ليه وايلد ديكسي؟</p>
            <div className="grid gap-8 text-center sm:grid-cols-3">
              {[
                { n: "٩-١٠", label: "شهور تأجير في السنة", sub: "السخنة قريبة من القاهرة وطلبها قوي طول السنة، مش موسم صيفي بس." },
                { n: "١٠٠٪", label: "شفافية في الكشف الشهري", sub: "إجمالي، عمولة، وصافي جنب بعض — تشوف كل جنيه لحظة بلحظة." },
                { n: "٠", label: "مقدّم أو التزام مدة", sub: "تقدر تبدأ وتلغي في أي وقت — القرار في إيدك طول الوقت." },
              ].map(({ n, label, sub }) => (
                <div key={label} className="group">
                  <p className="text-6xl font-bold text-gold sm:text-7xl">{n}</p>
                  <p className="mt-2 text-base font-semibold">{label}</p>
                  <p className="mt-1 text-sm text-white/55">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Problem → promise */}
        <section className="mb-16 text-center">
          <h2 className="mx-auto max-w-2xl text-2xl font-bold sm:text-3xl">
            وحدتك أصل بيتآكل بالتضخم وهو فاضي — إحنا بنحوّله لدخل.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-black/55">
            وانت محتفظ بالملكية الكاملة وموافقتك على كل حجز — إحنا بس بنتولى التشغيل.
          </p>
        </section>

        {/* 4. How it works (owner onboarding) */}
        <section className="mb-16">
          <h2 className="mb-2 text-center text-3xl font-bold sm:text-4xl">إزاي بنشتغل</h2>
          <p className="mb-6 text-center text-sm text-black/55">من الاستشارة الأولى لأول كشف دخل — ٣ خطوات بسيطة.</p>
          <div className="grid gap-5 sm:grid-cols-3">
            {OWNER_STEPS.map((s) => (
              <div key={s.n} className="card p-6 text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gold text-xl font-bold text-brand-dark">{s.n}</div>
                <h3 className="font-bold">{s.t}</h3>
                <p className="mt-1.5 text-sm text-black/60">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Services + feature blocks */}
        <div className="mb-1 text-center">
          <span className="text-sm font-semibold tracking-wide text-gold-dark">للمالك اللي عايز يريّح باله تمامًا</span>
          <h2 className="mt-1 text-3xl font-bold sm:text-4xl">إدارة العقارات الكاملة</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-black/55">سيبلنا التشغيل كله — تسعير، ضيوف، نظافة، بوابة، وتحصيل — واستلم دخلك بكشف شهري واضح.</p>
        </div>
        <ServicesCarousel />

        <section className="mb-16 space-y-16">
          <FeatureBlock
            image="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80"
            eyebrow="نظافة وتجهيز"
            title="كل ضيف بيدخل على وحدة زي الفل"
            body="بنجهّز وحدتك بمعايير فندقية قبل كل وصول — تنظيف كامل، تغيير مفروشات، وتوثيق بالصور قبل وبعد كل ضيف. وحدتك دايمًا في أحسن صورة، وانت مش بتلمس حاجة."
            bullets={["تنظيف وتغيير مفروشات بين كل حجز", "توثيق بالصور قبل وبعد كل ضيف", "تجهيز ومستلزمات الضيافة جاهزة"]}
          />
          <FeatureBlock
            reverse
            image="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80"
            eyebrow="دخل بدون مجهود"
            title="انت بتقبض… واحنا بنشتغل"
            body="سيبلنا الضيوف، التسعير، التحصيل، والصيانة — واستلم دخلك كل شهر عبر إنستاباي مع كشف واضح. وحدتك بتشتغل لك حتى وانت مسافر، وانت اللي بتوافق على كل حجز."
            bullets={["كشف شهري شفّاف: إجمالي وعمولة وصافي", "تحويل عبر إنستاباي / فودافون كاش", "موافقتك على كل حجز + تملّك كامل"]}
          />
          <FeatureBlock
            image="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80"
            eyebrow="أمان الكمبوند"
            title="تصاريح البوابة من غير صداع"
            body="بندير تطبيق البوابة بإذنك ونصدر تصريح لكل ضيف برقمه القومي ولوحة عربيته — كل ضيف موثّق ومعروف. وحدتك وجيرانك في أمان، والبوابة مش هتبقى مشكلتك."
            bullets={["تصاريح بوابة وأكواد شاطئ لكل ضيف", "فحص بالرقم القومي + تأمين قابل للاسترداد", "تنسيق كامل مع إدارة الكمبوند"]}
          />
        </section>

        {/* 6. Management packages */}
        <Pricing />

        {/* 7. Owner earnings estimator */}
        <section id="estimator" className="mb-16 scroll-mt-24">
          <h2 className="mb-2 text-center text-3xl font-bold sm:text-4xl">اعرف دخل وحدتك المتوقّع</h2>
          <p className="mb-6 text-center text-sm text-black/55">اختار الباكدج اللي يناسبك، واملا البيانات — وفريقنا هيتواصل معاك على واتساب من غير أي التزام.</p>
          <EarningsEstimator />
        </section>

        {/* 8. Founder trust — real claim about the founder, not invented guest/owner
            quotes. We don't have real reviews yet; showing fabricated ones would be
            worse than showing none. This comes down the day real reviews exist. */}
        <section className="mb-16">
          <div className="mx-auto max-w-2xl rounded-3xl border border-brand/10 bg-white p-7 text-center shadow-[var(--shadow-soft)] sm:p-9">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-light text-xl font-bold text-brand">م</div>
            <p className="text-lg leading-8 text-black/80">
              «أنا نفسي مالك وحدة في الزعفرانة، وبدير وحدتي بنفس النظام قبل ما أدير وحدتك — نفس التوثيق بالصور، نفس الكشف الشهري.»
            </p>
            <p className="mt-3 text-sm font-bold text-brand">محمد — مؤسس وايلد ديكسي إسكيبس</p>
            <p className="mt-4 text-xs text-black/40">لسه في بداية رحلتنا — أول ما يكون عندنا حجوزات وتقييمات حقيقية من عملاء، هتلاقيها هنا بدل الكلام ده.</p>
          </div>
        </section>

        {/* 9. Guest door — secondary, real inventory, not the homepage's main pitch */}
        <section className="mb-16">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">مش مالك؟ شاليهات متاحة للحجز في السخنة</h2>
              <p className="mt-1 text-sm text-black/55">حجز مباشر — من غير رسوم الحجز الزيادة بتاعة المنصات العالمية.</p>
            </div>
            <Link href="/sokhna" className="shrink-0 text-sm font-medium text-aqua">شوف الكل ←</Link>
          </div>
          {featured.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 6).map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
          ) : (
            <div className="card grid place-items-center py-14 text-center text-sm text-black/45">
              بنجهّز أحدث الشاليهات — تقدر تشوف المتاح دلوقتي من{" "}
              <Link href="/sokhna" className="font-medium text-brand underline">صفحة السخنة</Link>.
            </div>
          )}
        </section>

        <section className="mb-16">
          <div className="mb-6 text-center">
            <span className="mb-2 inline-block text-sm font-semibold tracking-wide text-gold-dark">مقارنة مباشرة</span>
            <h2 className="text-3xl font-bold sm:text-4xl">ليه تحجز من وايلد ديكسي؟</h2>
            <p className="mt-2 text-sm text-black/55">نفس الشاليه — بأوفر وأوضح وأسرع من المنصات العالمية.</p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-brand/10 bg-white shadow-[var(--shadow-soft)]">
            <div className="grid grid-cols-[1.6fr_1fr_1fr] gap-px bg-brand/[0.06] text-sm">
              <div className="bg-white px-5 py-4 text-xs font-medium text-black/35">المعيار</div>
              <div className="bg-brand px-4 py-4 text-center font-bold text-gold">وايلد ديكسي ✓</div>
              <div dir="ltr" className="bg-white px-4 py-4 text-center text-xs font-semibold text-black/40">Airbnb / Booking</div>
              {COMPARE.map((row) => (
                <Row key={row.label} {...row} />
              ))}
            </div>
          </div>
        </section>

        {/* 10. Final CTA — owner primary, guest secondary */}
        <section className="full-bleed mb-16 bg-gold py-12 text-center text-brand-dark">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-2xl font-bold sm:text-3xl">وحدتك قاعدة فاضية؟ خلّيها تكسب.</h2>
            <p className="mt-1 text-sm text-brand-dark/75">احسب دخلك المتوقّع مجانًا، أو كلّمنا على واتساب مباشرة.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="#estimator" className="btn-navy px-6 py-3">احسب دخلك مجانًا</Link>
              <a href="https://wa.me/201033388003" target="_blank" rel="noopener noreferrer" className="btn bg-white px-6 py-3 text-brand hover:bg-white/90">كلّمنا واتساب</a>
            </div>
          </div>
        </section>

        {/* FAQ — owner questions first, guest questions after */}
        <section className="mb-12">
          <h2 className="mb-6 text-center text-3xl font-bold sm:text-4xl">أسئلة شائعة</h2>
          <div className="mx-auto max-w-2xl space-y-2">
            {FAQ.map(([q, a], i) => (
              <div key={q} className="card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="flex w-full items-center justify-between px-5 py-4 text-right font-medium">
                  {q}
                  <span className="text-gold-dark">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && <p className="border-t border-brand/[0.07] px-5 py-4 text-sm leading-7 text-black/65">{a}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ label, us, them }: { label: string; us: string; them: string }) {
  return (
    <>
      <div className="bg-white p-4 font-medium text-black/70">{label}</div>
      <div className="flex items-center justify-center gap-2 bg-brand-light/40 p-4 text-center font-medium text-brand">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-brand" aria-hidden><path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {us}
      </div>
      <div className="flex items-center justify-center gap-2 bg-white p-4 text-center text-black/45">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-coral-dark" aria-hidden><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
        {them}
      </div>
    </>
  );
}
