"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { PropertyListItem } from "@/lib/types";
import { PropertyCard } from "@/components/PropertyCard";
import { EarningsEstimator } from "@/components/EarningsEstimator";
import { ServicesCarousel } from "@/components/ServicesCarousel";
import { Pricing } from "@/components/Pricing";
import { FeatureBlock } from "@/components/FeatureBlock";
import { WARM_HERO } from "@/lib/images";

const HERO = WARM_HERO;

const IMPORT_STEPS = [
  { n: "١", t: "الصق رابط Airbnb", d: "عندك إعلان على Airbnb؟ انسخ اللينك وبس." },
  { n: "٢", t: "بنسحب كل حاجة", d: "الصور، الوصف، المرافق، وعدد الضيوف — تلقائيًا في ثواني." },
  { n: "٣", t: "راجع وانشر", d: "تأكيد سريع، ووحدتك تبقى جاهزة للحجز على وايلد ديكسي." },
];

const FLOW = [
  { n: "١", t: "أضف وحدتك", d: "استورد من Airbnb في ٢٠ ثانية، أو ضيفها يدويًا في دقايق." },
  { n: "٢", t: "المستأجر يحجز ويدفع", d: "الحجز والعربون بيتمّوا عبر وايلد ديكسي — آمن وموثّق، مش كاش بيلف." },
  { n: "٣", t: "استلم دخلك", d: "تحويل عبر إنستاباي وكشف واضح. وللي مختار الإدارة الكاملة، إحنا بنعمل كل ده بدالك." },
];

const FAQ: [string, string][] = [
  ["إيه الفرق بين «اعرض بنفسك» و«الإدارة الكاملة»؟", "اعرض بنفسك: مجانًا — وحدتك تتعرض وتتحجز عندنا، وانت بتستقبل وتدير بنفسك، وبناخد عمولة ١٠٪ على الحجز بس. الإدارة الكاملة: إحنا بنتولّى كل حاجة (ضيوف، نظافة، بوابة، تحصيل) مقابل باكدج شهري."],
  ["العرض بيكلّف كام؟", "العرض مجاني تمامًا — مفيش اشتراك ولا مقدّم. بناخد عمولة ١٠٪ على الحجوزات اللي بتتمّ عبرنا بس."],
  ["إزاي بستورد من Airbnb؟", "الصق رابط إعلانك، وإحنا بنسحب الصور والوصف والمرافق وعدد الضيوف تلقائيًا — تراجعهم وتنشر في دقايق من غير تعب."],
  ["المستأجر بيدفع إزاي؟", "الحجز والعربون عبر وايلد ديكسي (إنستاباي / فودافون كاش) — آمن وموثّق، وانت بتشوف كل حاجة في لوحتك."],
  ["الإدارة الكاملة فيها إيه؟", "تسعير، تواصل الضيوف، نظافة موثّقة بالصور، تصاريح البوابة، صيانة، وتحصيل — وانت بتستلم كشف شهري. تبدأ من ١٥٪."],
];

export default function Home() {
  const { user } = useAuth();
  const isHost = user?.roles.includes("host");
  // Smooth funnel: new visitor → register, existing non-host → profile (become host), host → import.
  const listHref = !user ? "/register" : isHost ? "/host" : "/profile";

  const [featured, setFeatured] = useState<PropertyListItem[]>([]);
  const [openFaq, setOpenFaq] = useState(-1);

  useEffect(() => {
    api.searchProperties({ area: "Ain Sokhna", limit: 6 }).then((p) => setFeatured(p.items)).catch(() => undefined);
  }, []);

  return (
    <div>
      {/* 1. Hero — two balanced paths */}
      <section className="full-bleed relative mb-12 h-[600px] overflow-hidden sm:h-[670px]">
        <Image src={HERO} alt="شاليه على بحر العين السخنة وقت الغروب" fill priority className="object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 mx-auto flex max-w-4xl flex-col items-center justify-center px-5 pt-16 text-center text-white">
          <span className="mb-4 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur fade-up">
            البديل المصري لإيجار المصايف — العين السخنة
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight drop-shadow sm:text-5xl fade-up">
            وحدتك على بحر السخنة — اعرضها في ٢٠ ثانية، أو سيبها علينا بالكامل.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 fade-up">
            استورد وحدتك من Airbnb في ٢٠ ثانية، والمستأجر يحجز ويدفع العربون عندنا بأمان. اعرض بنفسك مجانًا، أو اختار الإدارة الكاملة وريّح بالك تمامًا.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 fade-up">
            <Link href={listHref} className="btn-primary px-6 py-3 text-base">اعرض وحدتك مجانًا</Link>
            <Link href="#manage" className="btn-outline border-white/40 bg-white/10 px-6 py-3 text-base text-white hover:bg-white/20">خليها علينا — إدارة كاملة</Link>
          </div>
          <Link href="/sokhna" className="mt-4 text-sm text-white/80 underline-offset-4 hover:text-white hover:underline fade-up">
            بتدوّر على شاليه تحجزه؟ اتفرّج على السخنة ←
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-1">
        {/* 2. Distribution / trust band */}
        <section className="mb-16 text-center">
          <p className="text-sm font-medium tracking-wide text-black/45">وحدتك تتعرض وتتأجّر — وللإدارة الكاملة بنوزّعها كمان على</p>
          <div dir="ltr" className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-black/55 opacity-70 grayscale">
            <span className="flex items-center gap-1.5 text-xl font-bold">
              <span className="text-[#003580]">Booking</span><span className="text-[#009fe3]">.com</span>
            </span>
            <span className="flex items-center gap-1.5 text-xl font-semibold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2c2.5 0 3.8 2.3 5 5 1.3 2.8 3 6.4 3 9a4 4 0 0 1-7 2.6A4 4 0 0 1 4 16c0-2.6 1.7-6.2 3-9 1.2-2.7 2.5-5 5-5Zm0 9a2.5 2.5 0 0 0-2.3 1.6c-.4 1 .1 2 .9 2.6.8.6 2 .6 2.8 0 .8-.6 1.3-1.6.9-2.6A2.5 2.5 0 0 0 12 11Z" /></svg>
              airbnb
            </span>
          </div>
        </section>

        {/* 3. The 20-second import hook — the signature feature */}
        <section id="list" className="mb-16 scroll-mt-24">
          <div className="rounded-3xl border border-brand/10 bg-gradient-to-br from-brand-light/50 to-gold-light/40 p-6 sm:p-10">
            <div className="text-center">
              <span className="text-sm font-semibold tracking-wide text-gold-dark">من غير تعب ولا إرهاق</span>
              <h2 className="mt-1 text-3xl font-bold sm:text-4xl">من Airbnb لوايلد ديكسي في ٢٠ ثانية</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-black/60">عندك إعلان على Airbnb؟ الصق اللينك وإحنا بنبني وحدتك عندك — بالصور والوصف والمرافق — أوتوماتيك.</p>
            </div>

            {/* Tangible "paste your link" affordance */}
            <Link href={listHref} className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-brand/15 bg-white p-2 shadow-[var(--shadow-soft)] transition hover:border-gold">
              <span className="flex-1 truncate px-3 text-sm text-black/40" dir="ltr">https://www.airbnb.com/rooms/…</span>
              <span className="btn-primary whitespace-nowrap text-sm">استورد وحدتك</span>
            </Link>

            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {IMPORT_STEPS.map((s) => (
                <div key={s.n} className="rounded-2xl bg-white/70 p-5 text-center">
                  <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-gold text-lg font-bold text-brand-dark">{s.n}</div>
                  <h3 className="font-bold">{s.t}</h3>
                  <p className="mt-1.5 text-sm text-black/60">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Two paths — list yourself vs. full management */}
        <section className="mb-16">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">انت عايز إيه لوحدتك؟</h2>
            <p className="mt-2 text-sm text-black/55">مسارين — اختار اللي يريّحك، وتقدر تبدّل أي وقت.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Self-list */}
            <div className="flex flex-col rounded-3xl border-2 border-gold bg-white p-7 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-brand">اعرض بنفسك</h3>
                <span className="rounded-full bg-gold-light px-3 py-1 text-xs font-bold text-gold-dark">مجانًا</span>
              </div>
              <p className="mt-2 text-sm text-black/60">وحدتك تتعرض وتتحجز عندنا، وانت بتستقبل وتدير بنفسك. عمولة ١٠٪ على الحجز بس — من غير اشتراك.</p>
              <ul className="mt-4 space-y-2.5 border-t border-brand/[0.07] pt-4 text-sm">
                {["استورد من Airbnb في ٢٠ ثانية", "وحدتك تتعرض على آلاف الباحثين", "المستأجر يحجز ويدفع عربون عبر وايلد ديكسي", "انت تستقبل وتنسّق مع الضيف", "عمولة ١٠٪ على الحجز بس — من غير اشتراك"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check />
                    <span className="text-black/70">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={listHref} className="btn-primary mt-6 w-full text-center">ابدأ مجانًا</Link>
            </div>

            {/* Full management */}
            <div className="flex flex-col rounded-3xl border border-brand/10 bg-brand p-7 text-white shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">خليها علينا</h3>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-gold">من ١٥٪</span>
              </div>
              <p className="mt-2 text-sm text-white/75">سيبلنا التشغيل بالكامل واستلم دخلك وانت مرتاح — إدارة بمستوى فندقي لوحدتك.</p>
              <ul className="mt-4 space-y-2.5 border-t border-white/10 pt-4 text-sm">
                {["تسعير ديناميكي وتسويق متعدد المنصّات", "تواصل الضيوف وتأكيد الحجوزات", "نظافة وتجهيز موثّقين بالصور", "تصاريح البوابة وأمان الكمبوند", "تحصيل وكشف شهري شفّاف"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check gold />
                    <span className="text-white/85">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="#pricing" className="btn mt-6 w-full bg-gold text-center text-brand-dark hover:brightness-95">شوف الباكدجات</Link>
            </div>
          </div>
        </section>

        {/* 5. How the marketplace flow works */}
        <section id="how" className="mb-16 scroll-mt-24">
          <h2 className="mb-2 text-center text-3xl font-bold sm:text-4xl">إزاي بتشتغل؟</h2>
          <p className="mb-6 text-center text-sm text-black/55">٣ خطوات من وحدتك فاضية لدخل في جيبك</p>
          <div className="grid gap-5 sm:grid-cols-3">
            {FLOW.map((s) => (
              <div key={s.n} className="card p-6 text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gold text-xl font-bold text-brand-dark">{s.n}</div>
                <h3 className="font-bold">{s.t}</h3>
                <p className="mt-1.5 text-sm text-black/60">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Earnings estimator */}
        <section id="estimator" className="mb-16 scroll-mt-24">
          <h2 className="mb-2 text-center text-3xl font-bold sm:text-4xl">اعرف دخل وحدتك المتوقّع</h2>
          <p className="mb-6 text-center text-sm text-black/55">املا البيانات وفريقنا هيتواصل معاك على واتساب — من غير أي التزام.</p>
          <EarningsEstimator />
        </section>

        {/* 7. Featured stays — the marketplace, live */}
        {featured.length > 0 && (
          <section className="mb-16">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-2xl font-bold sm:text-3xl">شاليهات معروضة دلوقتي في السخنة</h2>
              <Link href="/sokhna" className="text-sm font-medium text-aqua">شوف الكل ←</Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 3).map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
          </section>
        )}

        {/* 8. Full-management — services carousel */}
        <section id="manage" className="scroll-mt-24">
          <div className="mb-1 text-center">
            <span className="text-sm font-semibold tracking-wide text-gold-dark">للي عايز يريّح باله</span>
            <h2 className="mt-1 text-3xl font-bold sm:text-4xl">الإدارة الكاملة — سيبها علينا</h2>
          </div>
        </section>
        <ServicesCarousel />

        {/* Image + text feature blocks (the management value) */}
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

        {/* Stats band */}
        <section className="full-bleed mb-16 bg-brand py-12 text-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 text-center sm:grid-cols-3">
            {[
              ["٢٠ ثانية", "وكفاية عشان تعرض وحدتك — استورد من Airbnb بلينك واحد."],
              ["+٩–١٠ شهور", "تأجير في السنة — السخنة قريبة من القاهرة وطلبها قوي طول السنة."],
              ["١٠٠٪", "شفافية — حجز وتحصيل وكشف عبر إنستاباي، مفيش كاش بيلف."],
            ].map(([big, small]) => (
              <div key={big}>
                <p className="text-3xl font-bold text-gold">{big}</p>
                <p className="mt-1 text-sm text-white/70">{small}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Parallax banner */}
        <section
          className="full-bleed relative mb-16 flex min-h-[380px] items-center justify-center overflow-hidden bg-cover bg-fixed bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1700&q=80)" }}
        >
          <div className="absolute inset-0 bg-brand/70" />
          <div className="relative z-10 mx-auto max-w-2xl px-5 text-center text-white">
            <p className="text-sm font-semibold tracking-wide text-gold">وايلد ديكسي إسكيبس</p>
            <h2 className="mt-2 text-3xl font-bold leading-snug text-white sm:text-4xl">
              اعرض وحدتك دلوقتي… أو سيبها علينا بالكامل
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              ابدأ مجانًا في ٢٠ ثانية، والمستأجر يحجز ويدفع عندك بأمان. ولو عايز راحة كاملة، إحنا بنتولّى التشغيل من الألف للياء.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href={listHref} className="btn-primary px-6 py-3">اعرض وحدتك مجانًا</Link>
              <a href="https://wa.me/201033388003" target="_blank" rel="noopener noreferrer" className="btn bg-white px-6 py-3 text-brand hover:bg-white/90">كلّمنا واتساب</a>
            </div>
          </div>
        </section>

        {/* Packages — full management only */}
        <Pricing />

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="mb-6 text-center text-3xl font-bold sm:text-4xl">المُلّاك بيقولوا إيه</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              ["أ", "م. أحمد — القاهرة", "عرضت وحدتي في أزها في دقايق باللينك بتاع Airbnb. أول حجز جه نفس الأسبوع، والفلوس وصلتني عبر إنستاباي."],
              ["س", "سارة — مقيمة بالخارج", "اخترت الإدارة الكاملة. التوثيق بالصور والكشف الشهري طمّنوني تمامًا وأنا بعيدة."],
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

        {/* Dual CTA band */}
        <section className="full-bleed mb-16 bg-gold py-12 text-center text-brand-dark">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-2xl font-bold sm:text-3xl">وحدتك قاعدة فاضية؟ خلّيها تكسب.</h2>
            <p className="mt-1 text-sm text-brand-dark/75">اعرضها بنفسك مجانًا، أو سيبها علينا بالكامل — انت تختار.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href={listHref} className="btn-navy px-6 py-3">اعرض وحدتك مجانًا</Link>
              <Link href="#pricing" className="btn bg-white px-6 py-3 text-brand hover:bg-white/90">باكدجات الإدارة</Link>
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

function Check({ gold }: { gold?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`mt-0.5 shrink-0 ${gold ? "text-gold" : "text-gold-dark"}`} aria-hidden>
      <path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
