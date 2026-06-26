import Link from "next/link";

type Plan = {
  name: string;
  rate: string;
  tagline: string;
  features: string[];
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "لايت",
    rate: "١٥٪",
    tagline: "نص خدمة — انت بتدير النضافة والمفاتيح، واحنا بنجيب الحجوزات.",
    features: [
      "تصوير احترافي وقائمة محسّنة",
      "تسعير ديناميكي بالموسم والويك-إند",
      "توزيع على Airbnb و Booking وموقعنا",
      "تحصيل عبر إنستاباي + كشف شهري",
      "تواصل الضيوف وتأكيد الحجوزات",
    ],
  },
  {
    name: "الإدارة الكاملة",
    rate: "٢٠٪",
    tagline: "سيبلنا كل حاجة — استلم دخلك وانت مرتاح.",
    featured: true,
    features: [
      "كل مميزات «لايت»",
      "نظافة وتغيير مفروشات موثّقة بالصور",
      "تصاريح البوابة وأكواد الشاطئ",
      "فحص الضيوف بالرقم القومي + تأمين",
      "صيانة عند الطلب بسقف مصاريف",
      "استلام/تسليم المفاتيح + مدير مخصص",
    ],
  },
  {
    name: "بريميوم",
    rate: "٢٨٪",
    tagline: "لأصحاب الوحدات المميزة اللي عايزين أعلى دخل وتجربة فاخرة.",
    features: [
      "كل مميزات «الإدارة الكاملة»",
      "تجهيز وديكور وتنسيق الوحدة",
      "تصوير سينمائي وفيديو",
      "أولوية في التسويق والإعلانات",
      "تقارير أداء متقدمة لحظية",
      "استقبال VIP للضيوف",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mb-14 scroll-mt-24">
      <div className="mb-2 text-center">
        <span className="text-sm font-semibold tracking-wide text-gold-dark">للإدارة الكاملة بس</span>
        <h2 className="mt-1 text-3xl font-bold sm:text-4xl">باكدجات الإدارة الكاملة</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-black/55">
          للي عايز يسيب التشغيل علينا بالكامل — من غير مقدّم وتجربة قابلة للإلغاء. مش عايز إدارة؟{" "}
          <Link href="/#list" className="font-semibold text-gold-dark underline-offset-2 hover:underline">اعرض وحدتك مجانًا</Link>{" "}
          وادفع عمولة ١٠٪ على الحجز بس.
        </p>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col rounded-3xl p-6 ${
              p.featured
                ? "border-2 border-gold bg-white shadow-[var(--shadow-hover)]"
                : "card"
            }`}
          >
            {p.featured && (
              <span className="absolute -top-3 right-6 rounded-full bg-gold px-3 py-1 text-xs font-bold text-brand-dark shadow">
                الأكثر طلبًا
              </span>
            )}
            <h3 className="text-xl font-bold text-brand">{p.name}</h3>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-4xl font-bold text-gold-dark">{p.rate}</span>
              <span className="mb-1 text-sm text-black/45">من إجمالي الإيجار</span>
            </div>
            <p className="mt-2 min-h-[40px] text-sm text-black/60">{p.tagline}</p>
            <ul className="mt-4 space-y-2.5 border-t border-brand/[0.07] pt-4 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-gold-dark" aria-hidden>
                    <path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-black/70">{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/#estimator" className={`mt-6 w-full text-center ${p.featured ? "btn-primary" : "btn-navy"}`}>
              ابدأ مع «{p.name}»
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
