import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, whatsappWith } from "@/lib/site";

const TITLE = "دليل العين السخنة والزعفرانة: الكمبوندات، الأسعار، وأفضل وقت للمصيف | Wild Dixie";
const DESC =
  "دليل عملي للمصيف في العين السخنة والزعفرانة — أشهر الكمبوندات، متوسط أسعار الإيجار، أفضل وقت للحجز، ونصائح للوصول والبوابة.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/sokhna/guide` },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${SITE_URL}/sokhna/guide`,
    images: [{ url: `${SITE_URL}/listings/beachfront/24.jpg`, width: 1200, height: 630, alt: "بحر العين السخنة" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [`${SITE_URL}/listings/beachfront/24.jpg`],
  },
};

/* Local knowledge — market research + owner input (2026-07). */
const COMPOUNDS: { name: string; note: string }[] = [
  { name: "ذا جروف (The Groove)", note: "من المنتجعات المميزة، تصميم عصري وخدمات راقية." },
  { name: "كاي السخنة (Kai)", note: "كمبوند حديث، وجواه منطقة فينيز (Venes) المميزة." },
  { name: "إيل مونت جلالة (IL Monte Galala)", note: "مشروع ضخم على جبل الجلالة بإطلالات بانورامية وكريستال لاجون." },
  { name: "ستيلا دي ماري", note: "من أكبر وأرقى المنتجعات (~318 فدان)، جزر مطلة على البحر مباشرة وبحيرات." },
  { name: "أزها", note: "من أرقى القرى، شاطئ 700م ولاجون ومساحات خضرا كبيرة." },
  { name: "تلال", note: "مشروع مشهور، عائلي ومطلوب." },
  { name: "بورتو السخنة", note: "عائلي ومناسب للأطفال، أكوا بارك وخدمات ترفيهية." },
  { name: "إمباير ريزورت", note: "وحدتنا فيه — أول صف على البحر مباشرة، هادي وقريب من الزعفرانة." },
];

const SECTIONS: { h: string; body: string }[] = [
  {
    h: "منطقة الزعفرانة",
    body: "امتداد أهدأ وأقل زحمة جنوب السخنة، بشواطئ صافية وأسعار أنسب — مناسبة للي عايز هدوء بعيد عن الزحمة.",
  },
  {
    h: "متوسط أسعار الإيجار",
    body: "الأسعار بتختلف حسب الكمبوند وعدد الغرف والقرب من البحر والموسم. الكمبوندات المتوسطة من حوالي 1,000–2,000 ج.م / الليلة، والوحدات بحمام سباحة خاص من حوالي 3,000 ج.م، وأول صف على البحر والمنتجعات الفاخرة 5,000 ج.م وأكتر. الأسعار بتزيد في الصيف ونهايات الأسبوع والعطلات.",
  },
  {
    h: "أفضل وقت للمصيف",
    body: "الطقس معتدل على مدار السنة تقريبًا. أحلى شهور من أبريل لأكتوبر، والذروة في الصيف (يونيو–أغسطس) ونهايات الأسبوع. لو عايز هدوء وأسعار أوفر، جرّب الربيع أو أول الخريف.",
  },
  {
    h: "الوصول وتصاريح البوابة",
    body: "معظم الكمبوندات بتطلب تصريح بوابة برقم قومي ولوحة عربية. مع Wild Dixie بنجهّز التصريح لك قبل وصولك — بتدخل من غير أي تعقيد.",
  },
];

export default function SokhnaGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <span className="text-xs font-semibold tracking-widest text-gold-dark uppercase">دليل المصيف</span>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">دليل العين السخنة والزعفرانة</h1>
      <p className="mt-3 leading-8 text-black/60">
        كل اللي محتاج تعرفه قبل ما تحجز شاليهك — الكمبوندات، الأسعار، وأفضل وقت للمصيف.
      </p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-brand">أشهر الكمبوندات في العين السخنة</h2>
          <div className="mt-3 space-y-3">
            {COMPOUNDS.map((c) => (
              <div key={c.name} className="rounded-2xl border border-brand/10 bg-white p-4">
                <h3 className="font-bold text-black/85">{c.name}</h3>
                <p className="mt-1 text-sm leading-7 text-black/60">{c.note}</p>
              </div>
            ))}
          </div>
        </section>

        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="text-xl font-bold text-brand">{s.h}</h2>
            <p className="mt-2 leading-8 text-black/65">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-3xl bg-brand px-8 py-10 text-center text-white">
        <h2 className="text-2xl font-bold">جاهز تحجز؟</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/65">شوف وحداتنا المتاحة أو احسب دخل وحدتك لو عندك شاليه.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/sokhna" className="btn-primary px-7 py-3">شوف الوحدات</Link>
          <Link href="/#estimator" className="btn border border-white/25 bg-white/10 px-7 py-3 text-white hover:bg-white/20">
            احسب دخلك
          </Link>
          <a href={whatsappWith("عايز أستفسر عن المصيف في العين السخنة")} target="_blank" rel="noopener noreferrer" className="btn border border-white/25 bg-white/10 px-7 py-3 text-white hover:bg-white/20">
            واتساب
          </a>
        </div>
      </div>
    </div>
  );
}
