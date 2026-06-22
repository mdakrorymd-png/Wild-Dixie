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

const STEPS = [
  { n: "١", t: "استشارة مجانية", d: "نتعرّف على وحدتك وأهدافك وتوقعاتك للدخل." },
  { n: "٢", t: "تجهيز وتسعير", d: "تصوير احترافي، قائمة محسّنة، وتسعير ديناميكي يلتقط الويك-إند والمواسم." },
  { n: "٣", t: "إدارة كاملة", d: "نتولّى الضيوف، النظافة، البوابة، الصيانة، والتحصيل — وانت بتستلم كشف وفلوس كل شهر." },
];

const FAQ = [
  ["العمولة كام؟", "عمولة ٢٠٪ من إجمالي الإيجار، والنظافة على الضيف (مش بتتخصم منك). من غير مقدّم وتجربة قابلة للإلغاء."],
  ["هسلّم المفتاح لمين؟", "لفريق موثّق، وكل دخول وخروج بيتوثّق بالصور، وانت بتشوف كل حاجة في لوحة المالك."],
  ["إزاي بتتعاملوا مع البوابة؟", "بندير تطبيق البوابة بإذنك ونصدر تصريح لكل ضيف برقمه القومي ولوحة عربيته."],
  ["هستلم فلوسي إزاي؟", "تحويل عبر إنستاباي أو فودافون كاش، مع كشف شهري واضح بالإجمالي والعمولة والصافي."],
  ["أقدر أرفض حجز؟", "أكيد — انت بتوافق على كل حجز في البداية، وتملّكك للوحدة كامل."],
];

export default function OwnersHome() {
  const [featured, setFeatured] = useState<PropertyListItem[]>([]);
  const [openFaq, setOpenFaq] = useState(-1);

  useEffect(() => {
    api.searchProperties({ area: "Ain Sokhna", limit: 6 }).then((p) => setFeatured(p.items)).catch(() => undefined);
  }, []);

  return (
    <div>
      {/* 1. Hero (full-bleed; the transparent navbar floats over it) */}
      <section className="full-bleed relative mb-12 h-[560px] overflow-hidden sm:h-[640px]">
        <Image src={HERO} alt="" fill priority className="object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 mx-auto flex max-w-4xl flex-col items-center justify-center px-5 pt-16 text-center text-white">
          <h1 className="max-w-3xl text-4xl font-bold leading-tight drop-shadow sm:text-5xl fade-up">
            شاليهك على البحر… بإدارة كاملة ودخل بدون مجهود.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 fade-up">
            وايلد ديكسي إسكيبس بتدير وحدتك في العين السخنة من الألف للياء — تسعير، ضيوف، نظافة، تصاريح البوابة، وتحصيل عبر إنستاباي. وانت بتستلم كشف شهري واضح، مع تملّك كامل وموافقة على كل حجز.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 fade-up">
            <Link href="#estimator" className="btn-primary px-6 py-3 text-base">احسب دخل وحدتك مجانًا</Link>
            <Link href="#how" className="btn-outline border-white/40 bg-white/10 px-6 py-3 text-base text-white hover:bg-white/20">اعرف إزاي بنشتغل</Link>
          </div>
          <p className="mt-3 text-xs text-white/70">من غير مقدّم • تقدر تلغي في أي وقت • مرخّص</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-1">
        {/* 2. Trust band — "featured on" platform strip (Qualco-style) */}
        <section className="mb-14 text-center">
          <p className="text-sm font-medium tracking-wide text-black/45">موثوق من ملّاك العين السخنة — وموزّعون على</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-black/55 opacity-70 grayscale">
            <span className="flex items-center gap-1.5 text-xl font-bold">
              <span className="text-[#003580]">Booking</span><span className="text-[#009fe3]">.com</span>
            </span>
            <span className="flex items-center gap-1.5 text-xl font-semibold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2c2.5 0 3.8 2.3 5 5 1.3 2.8 3 6.4 3 9a4 4 0 0 1-7 2.6A4 4 0 0 1 4 16c0-2.6 1.7-6.2 3-9 1.2-2.7 2.5-5 5-5Zm0 9a2.5 2.5 0 0 0-2.3 1.6c-.4 1 .1 2 .9 2.6.8.6 2 .6 2.8 0 .8-.6 1.3-1.6.9-2.6A2.5 2.5 0 0 0 12 11Z" /></svg>
              airbnb
            </span>
            <span className="text-xl font-bold italic">Vrbo</span>
            <span className="text-xl font-semibold">Expedia</span>
            <span className="text-xl font-medium">agoda</span>
          </div>
        </section>

        {/* 3. How it works */}
        <section id="how" className="mb-14 scroll-mt-20">
          <h2 className="mb-2 text-center text-3xl font-bold sm:text-4xl">إزاي بنشتغل؟</h2>
          <p className="mb-6 text-center text-sm text-black/55">٣ خطوات وانت مرتاح</p>
          <div className="grid gap-5 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card p-6 text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gold text-xl font-bold text-brand-dark">{s.n}</div>
                <h3 className="font-bold">{s.t}</h3>
                <p className="mt-1.5 text-sm text-black/60">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 9/4. Estimator */}
        <section id="estimator" className="mb-14 scroll-mt-20">
          <h2 className="mb-2 text-center text-3xl font-bold sm:text-4xl">اعرف دخل وحدتك المتوقّع</h2>
          <p className="mb-6 text-center text-sm text-black/55">املا البيانات وفريقنا هيتواصل معاك على واتساب — من غير أي التزام.</p>
          <EarningsEstimator />
        </section>

        {/* 5. Services — dark full-bleed carousel */}
        <ServicesCarousel />

        {/* Image + text feature blocks */}
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

        {/* 6. Stats band (frameless) */}
        <section className="full-bleed mb-14 bg-brand py-12 text-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 text-center sm:grid-cols-3">
            {[
              ["+٩–١٠ شهور", "تأجير في السنة — السخنة قريبة من القاهرة وطلبها قوي طول السنة، مش موسم واحد."],
              ["١٠٠٪", "شفافية في الكشف الشهري — إجمالي، عمولة، وصافي جنب بعض."],
              ["كل جنيه", "عبر حساب مُدار — تحصيل وتوثيق عبر إنستاباي، مفيش كاش بيلف."],
            ].map(([big, small]) => (
              <div key={big}>
                <p className="text-3xl font-bold text-gold">{big}</p>
                <p className="mt-1 text-sm text-white/70">{small}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Featured stays */}
        {featured.length > 0 && (
          <section className="mb-14">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-2xl font-bold sm:text-3xl">شاليهات مختارة في العين السخنة</h2>
              <Link href="/sokhna" className="text-sm font-medium text-aqua">شوف الكل ←</Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 3).map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
          </section>
        )}

        {/* Full-bleed image banner with overlaid text (parallax on scroll) */}
        <section
          className="full-bleed relative mb-14 flex min-h-[380px] items-center justify-center overflow-hidden bg-cover bg-fixed bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1700&q=80)" }}
        >
          <div className="absolute inset-0 bg-brand/70" />
          <div className="relative z-10 mx-auto max-w-2xl px-5 text-center text-white">
            <p className="text-sm font-semibold tracking-wide text-gold">وايلد ديكسي إسكيبس</p>
            <h2 className="mt-2 text-3xl font-bold leading-snug text-white sm:text-4xl">
              وحدتك على البحر تستاهل إدارة بمستوى فندقي
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              سيبلنا التشغيل بالكامل — تسعير، ضيوف، نظافة، وتحصيل عبر إنستاباي — واستلم دخلك كل شهر مع كشف واضح.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="#estimator" className="btn-primary px-6 py-3">احسب دخلك مجانًا</Link>
              <a href="https://wa.me/201033388003" target="_blank" rel="noopener noreferrer" className="btn bg-white px-6 py-3 text-brand hover:bg-white/90">كلّمنا واتساب</a>
            </div>
          </div>
        </section>

        {/* Packages */}
        <Pricing />

        {/* 8. Testimonials */}
        <section className="mb-14">
          <h2 className="mb-6 text-center text-3xl font-bold sm:text-4xl">المُلّاك بيقولوا إيه</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              ["أ", "م. أحمد — القاهرة", "وحدتي في أزها كانت قاعدة طول السنة. دلوقتي بتكسب وأنا مش بعمل حاجة، والكشف بيوصلني آخر كل شهر."],
              ["س", "سارة — مقيمة بالخارج", "كنت خايفة أسلّم المفتاح. التوثيق بالصور والكشف الشهري طمّنوني تمامًا."],
              ["ك", "م. كريم — مستثمر", "التسعير الديناميكي رفع دخلي بشكل واضح في الويك-إند والمواسم."],
            ].map(([initial, who, quote]) => (
              <div key={who} className="card p-6">
                <div className="mb-3 flex gap-0.5 text-gold">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17.3 5.7 20.5l1.6-6.8L2 9.1l7-.6L12 2Z" /></svg>
                  ))}
                </div>
                <p className="text-sm leading-7 text-black/75">«{quote}»</p>
                <div className="mt-4 flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light font-bold text-brand">{initial}</span>
                  <p className="text-sm font-bold text-brand">{who}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Owner CTA band (frameless) */}
        <section className="full-bleed mb-14 bg-gold py-12 text-center text-brand-dark">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-2xl font-bold sm:text-3xl">وحدتك قاعدة فاضية؟ خلّيها تكسب.</h2>
            <p className="mt-1 text-sm text-brand-dark/75">سيبلنا الباقي — استلم دخلك وانت مرتاح.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="#estimator" className="btn-navy px-6 py-3">احسب دخلك مجانًا</Link>
              <a href="https://wa.me/201033388003" target="_blank" rel="noopener noreferrer" className="btn px-6 py-3 bg-white text-brand hover:bg-white/90">كلّمنا واتساب</a>
            </div>
          </div>
        </section>

        {/* FAQ */}
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
