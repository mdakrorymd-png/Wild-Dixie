import Link from "next/link";
import { Emblem } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="full-bleed mt-12 bg-brand text-white/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Emblem size={36} />
            <span className="leading-none">
              <span className="block text-base font-bold text-white">Wild Dixie</span>
              <span className="block text-[10px] tracking-[0.28em] text-gold">ESCAPES</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-white/60">اعرض وحدتك الساحلية في العين السخنة في ٢٠ ثانية، أو سيبها علينا بالكامل — وانت بتستلم دخلك.</p>
        </div>

        <div>
          <h4 className="mb-3 font-bold text-white">للمُلّاك</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#estimator" className="hover:text-gold">احسب دخلك</Link></li>
            <li><Link href="/#how" className="hover:text-gold">إزاي بنشتغل</Link></li>
            <li><Link href="/#services" className="hover:text-gold">الخدمات</Link></li>
            <li><Link href="/host/new" className="hover:text-gold">سجّل وحدتك</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-bold text-white">للضيوف</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/sokhna" className="hover:text-gold">احجز في السخنة</Link></li>
            <li><span className="text-white/45">الدفع: إنستاباي / فودافون كاش</span></li>
            <li><span className="text-white/45">المرافق على الضيف</span></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-bold text-white">تواصل</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://wa.me/201033388003" target="_blank" rel="noopener noreferrer" className="hover:text-gold">واتساب</a></li>
            <li><span className="text-white/45">العين السخنة، مصر</span></li>
            <li><span className="text-white/45">مناطق قادمة: الساحل · الجونة</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/40">
        © Wild Dixie Escapes 2026 · الشروط · الخصوصية
      </div>
    </footer>
  );
}
