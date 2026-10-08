import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, whatsappWith } from "@/lib/site";

const TITLE = "شراكة الكمبوندات والمنتجعات — تحكّم في إيجارات وحداتك | Wild Dixie";
const DESC =
  "نظام يخلّي إيجارات كمبوندك تعدّي من منصة واحدة: عميل موثّق بالرقم القومي، تصاريح بوابة منضبطة، وعمولة تحصّلها إدارة الكمبوند على كل إيجار.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/partners` },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${SITE_URL}/partners`,
    images: [{ url: `${SITE_URL}/listings/beachfront/04.jpg`, width: 1200, height: 630, alt: "منتجع ساحلي" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [`${SITE_URL}/listings/beachfront/04.jpg`],
  },
};

const PROBLEMS = [
  { p: "الملّاك بيأجّروا لأي حد معدّي", s: "عملاء مجهولين، مشاكل داخل الكمبوند، وسمعة المنتجع في خطر." },
  { p: "مفيش رقابة على مين بيدخل", s: "تصاريح بوابة عشوائية من غير توثيق حقيقي للضيف." },
  { p: "الإيجارات بتحصل تحت الترابيزة", s: "الكمبوند مش شايف ولا بياخد نصيبه من نشاط إيجاري بيحصل جوّه أصوله." },
];

const SOLUTION = [
  {
    t: "مشغّل واحد مسؤول عن كل وحدة",
    d: "إحنا بندير وحدات الملّاك بالكامل — نضافة، صيانة، استقبال الضيوف، والتشغيل اليومي. واجهة واحدة محترفة أمام كل عميل.",
    icon: "shield",
  },
  {
    t: "عميل موثّق قبل ما يدخل",
    d: "كل مستأجر بيتسجّل برقمه القومي ولوحة عربيته — عميل معروف ومسؤول، مش أي حد معدّي. سمعة الكمبوند محمية.",
    icon: "gate",
  },
  {
    t: "إيجار منظّم من منصة واحدة",
    d: "بدل الإيجارات المتفرّقة تحت الترابيزة، النشاط كله بيمرّ من منصة واحدة — شفاف، موثّق، وقابل للتتبّع بالكامل.",
    icon: "flow",
  },
  {
    t: "توزيع أوسع = إشغال أعلى",
    d: "بنعرض الوحدات على منصتنا وعلى Airbnb وغيرها — إشغال أعلى للملّاك، ونشاط إيجاري أكبر داخل كمبوندك.",
    icon: "coins",
  },
];

const HOW = [
  { n: "١", t: "اتفاق تشغيل حصري", d: "نتفق على تشغيل إيجارات وحدات الكمبوند من خلالنا، وعلى نسبة الكمبوند من عمولتنا." },
  { n: "٢", t: "تفعيل الوحدات", d: "بنضيف وحدات الملّاك بصور وبيانات احترافية على منصتنا وعلى Airbnb." },
  { n: "٣", t: "تشغيل منضبط + تقارير", d: "بندير كل حاجة قدام العميل، والتصاريح بتتصدر، والكمبوند بياخد نسبته بكشف واضح." },
];

export default function PartnersPage() {
  const waHref = whatsappWith("عايز أتكلم عن شراكة لإدارة إيجارات كمبوند مع Wild Dixie");

  return (
    <div>
      {/* Hero */}
      <section className="full-bleed relative flex min-h-[70dvh] items-center justify-center overflow-hidden bg-brand">
        <div className="relative z-10 mx-auto max-w-3xl px-5 py-24 text-center text-white">
          <span className="mb-4 inline-block rounded-full border border-gold/40 px-4 py-1 text-xs font-semibold tracking-widest text-gold uppercase">
            للكمبوندات والمنتجعات
          </span>
          <h1 className="font-bold leading-[1.15] tracking-tight" style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}>
            مشغّل رسمي واحد لإيجارات كمبوندك
            <span className="text-gold"> — منظّم، موثّق، وبنسبة ليك.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            الملّاك بيأجّروا لأي حد معدّي. إحنا بندير وحدات الكمبوند بالكامل — نضافة، صيانة، ضيوف موثّقين
            بالرقم القومي، وتصاريح بوابة منضبطة — والكمبوند بياخد نسبة من عمولتنا مقابل التشغيل الحصري.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-primary px-8 py-3.5 text-base">
              اعمل شراكة
            </a>
            <a href="#how" className="btn border border-white/25 bg-white/10 px-7 py-3.5 text-base text-white hover:bg-white/20">
              إزاي بيشتغل
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* Problem */}
        <section className="py-16">
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold tracking-widest text-gold-dark uppercase">المشكلة</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">إيجارات من غير رقابة = مشاكل</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {PROBLEMS.map((x) => (
              <div key={x.p} className="card p-6">
                <p className="font-bold text-brand">{x.p}</p>
                <p className="mt-2 text-sm leading-7 text-black/55">{x.s}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Solution */}
        <section className="py-16">
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold tracking-widest text-gold-dark uppercase">الحل</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">منصة واحدة تتحكّم في كل الدورة</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {SOLUTION.map((x) => (
              <div key={x.t} className="card flex gap-4 p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-gold">
                  <Icon name={x.icon} />
                </span>
                <div>
                  <h3 className="font-bold text-black/85">{x.t}</h3>
                  <p className="mt-1 text-sm leading-7 text-black/55">{x.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-24 py-16">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold tracking-widest text-gold-dark uppercase">الخطوات</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">شراكة في ٣ خطوات</h2>
          </div>
          <div className="relative grid gap-8 sm:grid-cols-3">
            <div className="absolute top-9 right-[16.7%] left-[16.7%] hidden h-px bg-gradient-to-l from-gold/40 via-gold/20 to-gold/40 sm:block" />
            {HOW.map((s, i) => (
              <div key={s.n} className={`flex flex-col items-center text-center`}>
                <div className="relative mb-5 grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-brand text-3xl font-bold text-gold ring-1 ring-brand/20">
                  {s.n}
                </div>
                <h3 className="text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-sm leading-7 text-black/55">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Proof — we run a unit at Empire ourselves */}
        <section className="py-12">
          <div className="rounded-3xl bg-brand-light/40 p-8 text-center">
            <p className="mx-auto max-w-2xl text-lg font-medium leading-8 text-brand">
              إحنا مش نظرية — بندير وحدتنا في إمباير ريزورت بنفس النظام: عميل موثّق، تصريح جاهز،
              وحجز مباشر بدون رسوم مخفية.
            </p>
            <Link href="/sokhna/beachfront-first-row" className="btn-navy mt-5 inline-flex px-6">
              شوف وحدة شغّالة بالنظام
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="rounded-3xl bg-brand px-8 py-14 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">إدارة منتجع أو كمبوند؟</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/65">
              خلّي إيجارات كمبوندك تحت مشغّل رسمي واحد — عملاء موثّقين، تشغيل محترف، ونسبة ليك على كل إيجار. كلّمنا نرتّب اجتماع.
            </p>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 inline-flex px-8 py-3.5 text-base">
              كلّمنا على واتساب
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const c = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "shield":
      return <svg {...c}><path d="M12 3 4 6v5c0 4 3.5 7 8 9 4.5-2 8-5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
    case "gate":
      return <svg {...c}><path d="M3 21V5l9-2 9 2v16M3 21h18M8 21V9m4 12V9m4 12V9" /></svg>;
    case "flow":
      return <svg {...c}><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.5 6H16a2 2 0 0 1 2 2v7.5M6 8.5V16a2 2 0 0 0 2 2h7.5" /></svg>;
    case "coins":
      return <svg {...c}><ellipse cx="9" cy="7" rx="6" ry="3" /><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3M3 12v5c0 1.7 2.7 3 6 3 1.2 0 2.3-.2 3.2-.5" /><circle cx="18" cy="15" r="3" /></svg>;
    default:
      return <svg {...c}><circle cx="12" cy="12" r="9" /></svg>;
  }
}
