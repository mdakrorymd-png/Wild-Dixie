"use client";

import Link from "next/link";
import { useRef } from "react";

type IconName = "pricing" | "marketing" | "listing" | "gate" | "cleaning" | "maintenance" | "report" | "chat";

const SERVICES: { icon: IconName; t: string; d: string }[] = [
  { icon: "pricing", t: "تسعير ديناميكي", d: "بنرفع السعر في الذروة والويك-إند ونحافظ على الحجوزات في الهدوء — لأقصى دخل لوحدتك." },
  { icon: "marketing", t: "توزيع على المنصات", d: "بننشر وحدتك على Airbnb و Booking وموقعنا المباشر عشان نزوّد الحجوزات." },
  { icon: "listing", t: "تصوير وتحسين القائمة", d: "صور احترافية ووصف محسّن يرفعوا ترتيب وحدتك ويحوّلوا المشاهدات لحجوزات." },
  { icon: "gate", t: "تصاريح البوابة وأكواد الشاطئ", d: "بندير تطبيق البوابة بإذنك ونصدر تصريح لكل ضيف برقمه القومي ولوحة عربيته." },
  { icon: "cleaning", t: "نظافة وتغيير مفروشات", d: "تنظيف وتجهيز موثّق بالصور قبل وبعد كل ضيف — وحدتك دايمًا زي الفل." },
  { icon: "maintenance", t: "صيانة عند الطلب", d: "شبكة فنيين جاهزة بسقف مصاريف متفق عليه — من غير صداع مكالمات." },
  { icon: "report", t: "كشف شهري شفّاف", d: "إجمالي، عمولة، وصافي جنب بعض — تشوف كل جنيه لحظة بلحظة." },
  { icon: "chat", t: "تواصل واتساب ٢٤/٧", d: "ردود سريعة على ضيوفك على مدار الساعة — تجربة بتبني تقييمات عالية." },
];

export function ServicesCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <section id="services" className="full-bleed mb-14 scroll-mt-24 bg-brand py-14 text-white">
      <div className="mx-auto mb-8 flex max-w-6xl flex-col items-center gap-3 px-4 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">اهتمام بأدق التفاصيل</h2>
        <p className="max-w-xl text-sm text-white/65">من التسعير لتصاريح البوابة للكشف الشهري — بنغطّي كل حاجة في وحدتك.</p>
      </div>

      {/* Frameless scroller — cards run edge to edge */}
      <div ref={ref} className="no-scrollbar flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:px-6">
        {SERVICES.map((s) => (
          <article key={s.t} className="w-[290px] shrink-0 snap-start rounded-2xl border border-white/12 bg-white/[0.04] p-6 transition hover:border-gold/50 hover:bg-white/[0.07]">
            <span className="grid h-12 w-12 place-items-center rounded-xl border border-gold/40 text-gold">
              <Icon name={s.icon} />
            </span>
            <h3 className="mt-4 text-lg font-medium">{s.t}</h3>
            <p className="mt-2 text-sm leading-7 text-white/65">{s.d}</p>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center gap-5 px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => scroll(1)} aria-label="السابق" className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition hover:border-gold hover:bg-white/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button onClick={() => scroll(-1)} aria-label="التالي" className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition hover:border-gold hover:bg-white/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
        <Link href="/#estimator" className="btn-primary px-6 py-3">ابدأ مع وايلد ديكسي</Link>
      </div>
    </section>
  );
}

function Icon({ name }: { name: IconName }) {
  const common = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "pricing":
      return <svg {...common}><path d="M4 19V5M4 19h16M8 16V9M12 16V6M16 16v-4M8 6 5 9M12 4 9 7M16 9l-3-3" /></svg>;
    case "marketing":
      return <svg {...common}><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1ZM16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14" /></svg>;
    case "listing":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="m4 17 5-5 4 4 3-3 4 4" /></svg>;
    case "gate":
      return <svg {...common}><path d="M12 3 4 6v5c0 4 3.5 7 8 9 4.5-2 8-5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
    case "cleaning":
      return <svg {...common}><path d="M12 3v6M9 9h6l1 5a4 4 0 0 1-8 0l1-5ZM10 18v3M14 18v3" /></svg>;
    case "maintenance":
      return <svg {...common}><path d="M14 7a4 4 0 0 1-5.4 4.6L5 15l-2-2 3.4-3.6A4 4 0 0 1 11 4l-2.3 2.3L10 9l2.7 1.3L15 8l-1-1Z" /></svg>;
    case "report":
      return <svg {...common}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>;
    case "chat":
      return <svg {...common}><path d="M4 5h16v11H8l-4 3V5Z" /><path d="M8 9h8M8 12h5" /></svg>;
  }
}
