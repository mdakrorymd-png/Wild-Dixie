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

// Guest booking flow (the homepage now speaks to the demand side first).
const BOOK_STEPS = [
  { n: "١", t: "اختار شاليهك", d: "اتفرّج على الشاليهات المتاحة في السخنة، وفلتر بالسعر والمنطقة والنوع." },
  { n: "٢", t: "احجز وادفع عربون", d: "حدّد تواريخك وادفع العربون عبر إنستاباي أو المحفظة — بالجنيه وآمن." },
  { n: "٣", t: "استمتع بإجازتك", d: "تواصل مباشر مع المضيف أو إدارة وايلد ديكسي، وتصريح البوابة جاهز قبل وصولك." },
];

// Why book direct vs. the global platforms.
const COMPARE: { label: string; us: string; them: string }[] = [
  { label: "رسوم خدمة إضافية على الضيف", us: "بدون رسوم زيادة", them: "رسوم خدمة بتتضاف على السعر" },
  { label: "تواصل مع المضيف / الإدارة", us: "مباشر وفوري", them: "عبر المنصة فقط" },
  { label: "طريقة الدفع", us: "إنستاباي / محفظة / بالجنيه", them: "كارت / دولار غالبًا" },
  { label: "معرفة بالسخنة ودعم بالعربي", us: "فريق محلي يعرف كل كمبوند", them: "دعم عام بالإنجليزي" },
];

const FAQ: [string, string][] = [
  ["إزاي أحجز شاليه؟", "اختار الشاليه من صفحة «احجز في السخنة»، حدّد تواريخك، وادفع العربون عبر إنستاباي أو المحفظة الإلكترونية — ويتأكد حجزك فورًا."],
  ["ليه أحجز من وايلد ديكسي مش من Airbnb؟", "سعر مباشر من غير رسوم الخدمة الزيادة اللي المنصات العالمية بتضيفها، تواصل مباشر مع المضيف، ودفع محلي بالجنيه. كله أوفر وأوضح."],
  ["الدفع بيتم إزاي؟", "العربون عبر إنستاباي / فودافون كاش / أورنج كاش — بالجنيه وآمن وموثّق. والباقي حسب الاتفاق مع المضيف أو الإدارة."],
  ["سياسة الإلغاء إيه؟", "الإلغاء قبل ٧ أيام من الوصول بيرجّعلك المدفوع. الإلغاء خلال الـ٧ أيام بيخصم حسب سياسة الوحدة (موسم الصيف قصير)."],
  ["عندي شاليه — أعرضه إزاي؟", "سجّل كمضيف، استورد وحدتك من Airbnb في ٢٠ ثانية أو ضيفها يدويًا، وعمولة ١٠٪ على الحجز بس. ولو عايز نشغّلها بالكامل بدالك، شوف باكدجات الإدارة الكاملة تحت."],
];

export default function Home() {
  const { user } = useAuth();
  const isHost = user?.roles.includes("host");
  const listHref = !user ? "/register" : isHost ? "/host" : "/profile";

  const [featured, setFeatured] = useState<PropertyListItem[]>([]);
  const [openFaq, setOpenFaq] = useState(-1);

  useEffect(() => {
    api.searchProperties({ area: "Ain Sokhna", limit: 6 }).then((p) => setFeatured(p.items)).catch(() => undefined);
  }, []);

  return (
    <div>
      {/* 1. Hero — guest-first: book a chalet directly */}
      <section className="full-bleed relative mb-12 h-[600px] overflow-hidden sm:h-[670px]">
        <Image src={HERO} alt="شاليه على بحر العين السخنة وقت الغروب" fill priority className="object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 mx-auto flex max-w-4xl flex-col items-center justify-center px-5 pt-16 text-center text-white">
          <span className="mb-4 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur fade-up">
            حجز شاليهات العين السخنة — مباشر وبالجنيه
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight drop-shadow sm:text-5xl fade-up">
            احجز شاليهك في السخنة مباشرة — بأوفر سعر وبدون رسوم زيادة.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 fade-up">
            شاليهات وفيلات مختارة في العين السخنة. احجز مباشرة من المالك أو من إدارة وايلد ديكسي — من غير رسوم الحجز الزيادة بتاعة Airbnb و Booking، وتواصل مباشر، ودفع بالجنيه عبر إنستاباي.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 fade-up">
            <Link href="/sokhna" className="btn-primary px-7 py-3 text-base">شوف الشاليهات المتاحة</Link>
            <a href="https://wa.me/201033388003" target="_blank" rel="noopener noreferrer" className="btn-outline border-white/40 bg-white/10 px-6 py-3 text-base text-white hover:bg-white/20">احجز عبر واتساب</a>
          </div>
          <Link href="#host" className="mt-4 text-sm text-white/80 underline-offset-4 hover:text-white hover:underline fade-up">
            عندك شاليه وعايز تأجّره؟ اعرضه معانا ←
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-1">
        {/* 2. Featured chalets — the actual inventory, guest-facing */}
        <section className="mb-16">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">شاليهات متاحة للحجز في السخنة</h2>
              <p className="mt-1 text-sm text-black/55">حجز مباشر — اختار، احجز، واستمتع.</p>
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

        {/* 3. Why book with Wild Dixie — direct comparison */}
        <section className="mb-16">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">ليه تحجز من وايلد ديكسي؟</h2>
            <p className="mt-2 text-sm text-black/55">نفس الشاليه… بأوفر وأوضح من المنصات العالمية.</p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-brand/10 bg-white shadow-[var(--shadow-soft)]">
            <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-px bg-brand/[0.06] text-sm">
              <div className="bg-white p-4" />
              <div className="bg-brand p-4 text-center font-bold text-gold">وايلد ديكسي</div>
              <div dir="ltr" className="bg-white p-4 text-center font-bold text-black/45">Airbnb / Booking</div>
              {COMPARE.map((row) => (
                <Row key={row.label} {...row} />
              ))}
            </div>
          </div>
        </section>

        {/* 4. How booking works (guest) */}
        <section className="mb-16">
          <h2 className="mb-2 text-center text-3xl font-bold sm:text-4xl">احجز في ٣ خطوات</h2>
          <p className="mb-6 text-center text-sm text-black/55">من الاختيار للوصول — بسيطة وسريعة.</p>
          <div className="grid gap-5 sm:grid-cols-3">
            {BOOK_STEPS.map((s) => (
              <div key={s.n} className="card p-6 text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gold text-xl font-bold text-brand-dark">{s.n}</div>
                <h3 className="font-bold">{s.t}</h3>
                <p className="mt-1.5 text-sm text-black/60">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Guest trust stats */}
        <section className="full-bleed mb-16 bg-brand py-12 text-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 text-center sm:grid-cols-3">
            {[
              ["بدون رسوم", "مفيش رسوم خدمة زيادة زي المنصات العالمية — السعر اللي تشوفه هو اللي تدفعه."],
              ["تواصل مباشر", "كلّم المضيف أو إدارة وايلد ديكسي على طول — من غير وسيط."],
              ["دفع بالجنيه", "إنستاباي وفودافون كاش وأورنج — محلي وآمن وموثّق."],
            ].map(([big, small]) => (
              <div key={big}>
                <p className="text-3xl font-bold text-gold">{big}</p>
                <p className="mt-1 text-sm text-white/70">{small}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Got a chalet? Become a host (short) */}
        <section id="host" className="mb-16 scroll-mt-24">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-gold/30 bg-gradient-to-br from-gold-light/50 to-white p-7 text-center sm:p-9">
            <h2 className="text-2xl font-bold sm:text-3xl">عندك شاليه؟ خلّيه يكسب.</h2>
            <p className="max-w-xl text-sm text-black/60">
              اعرض وحدتك في دقايق (استورد من Airbnb أو ضيفها يدويًا)، والمستأجر يحجز ويدفع عندك — وعمولة ١٠٪ على الحجز بس.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={listHref} className="btn-primary px-6 py-3">ابدأ كمضيف مجانًا</Link>
              <Link href="#management" className="btn-outline px-6 py-3">عايز نشغّلها بدالك؟</Link>
            </div>
          </div>
        </section>

        {/* 7. Full property management (for hands-off owners) */}
        <section id="management" className="scroll-mt-24">
          <div className="mb-1 text-center">
            <span className="text-sm font-semibold tracking-wide text-gold-dark">للمالك اللي عايز يريّح باله تمامًا</span>
            <h2 className="mt-1 text-3xl font-bold sm:text-4xl">إدارة العقارات الكاملة</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-black/55">سيبلنا التشغيل كله — تسعير، ضيوف، نظافة، بوابة، وتحصيل — واستلم دخلك بكشف شهري واضح.</p>
          </div>
        </section>
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

        {/* Management packages */}
        <Pricing />

        {/* Owner earnings estimator (part of the management pitch) */}
        <section id="estimator" className="mb-16 scroll-mt-24">
          <h2 className="mb-2 text-center text-3xl font-bold sm:text-4xl">اعرف دخل وحدتك المتوقّع</h2>
          <p className="mb-6 text-center text-sm text-black/55">املا البيانات وفريقنا هيتواصل معاك على واتساب — من غير أي التزام.</p>
          <EarningsEstimator />
        </section>

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="mb-6 text-center text-3xl font-bold sm:text-4xl">رأي عملائنا</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              ["م", "منى — القاهرة", "حجزت شاليه في أزها مباشرة عبر وايلد ديكسي — أوفر من Airbnb بفرق واضح، وكلّمت المضيف على طول."],
              ["أ", "م. أحمد — مالك", "عرضت وحدتي في دقايق باللينك بتاع Airbnb، وأول حجز جه نفس الأسبوع والفلوس وصلت إنستاباي."],
              ["س", "سارة — مقيمة بالخارج", "اخترت الإدارة الكاملة. التوثيق بالصور والكشف الشهري طمّنوني تمامًا وأنا بعيدة."],
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

        {/* Guest CTA band */}
        <section className="full-bleed mb-16 bg-gold py-12 text-center text-brand-dark">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-2xl font-bold sm:text-3xl">إجازتك في السخنة على بُعد حجز.</h2>
            <p className="mt-1 text-sm text-brand-dark/75">اختار شاليهك، احجز بالجنيه، واستمتع — من غير رسوم زيادة.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/sokhna" className="btn-navy px-6 py-3">شوف الشاليهات</Link>
              <a href="https://wa.me/201033388003" target="_blank" rel="noopener noreferrer" className="btn bg-white px-6 py-3 text-brand hover:bg-white/90">كلّمنا واتساب</a>
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
