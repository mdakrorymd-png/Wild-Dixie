"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isEnglishPath } from "@/lib/lang";
import { Emblem } from "@/components/Logo";

export function Footer() {
  const en = isEnglishPath(usePathname());
  if (en) return <FooterEn />;
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
            <li><Link href="/#pricing" className="hover:text-gold">الأسعار</Link></li>
            <li><Link href="/partners" className="hover:text-gold">شراكة الكمبوندات</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-bold text-white">للضيوف</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/sokhna" className="hover:text-gold">احجز في السخنة</Link></li>
            <li><Link href="/sokhna/beachfront-first-row" className="hover:text-gold">Beachfront First Row</Link></li>
            <li><span className="text-white/45">الدفع: إنستاباي / فودافون كاش</span></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-bold text-white">تواصل</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://wa.me/201033388003" target="_blank" rel="noopener noreferrer" className="hover:text-gold">واتساب · +20 103 338 8003</a></li>
            <li><span className="text-white/45">العين السخنة، مصر</span></li>
            <li><span className="text-white/45">مناطق قادمة: الساحل · الجونة</span></li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5 border-t border-white/10 px-4 py-4 text-center text-xs text-white/40 sm:flex-row sm:justify-between">
        <span>© Wild Dixie Escapes 2026</span>
        <span className="flex gap-4">
          <Link href="/terms" className="hover:text-gold">الشروط</Link>
          <Link href="/privacy" className="hover:text-gold">الخصوصية</Link>
        </span>
      </div>
    </footer>
  );
}

function FooterEn() {
  return (
    <footer dir="ltr" className="full-bleed mt-12 bg-brand text-white/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Emblem size={36} />
            <span className="leading-none">
              <span className="block text-base font-bold text-white">Wild Dixie</span>
              <span className="block text-[10px] tracking-[0.28em] text-gold">ESCAPES</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-white/60">Holiday-rental management on Egypt&apos;s Red Sea coast, for owners who live abroad.</p>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">For owners</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/en#how" className="hover:text-gold">How it works</Link></li>
            <li><Link href="/en#included" className="hover:text-gold">What&apos;s included</Link></li>
            <li><Link href="/en#pricing" className="hover:text-gold">Pricing</Link></li>
            <li><Link href="/en#earnings" className="hover:text-gold">What a unit could earn</Link></li>
            <li><Link href="/en#faq" className="hover:text-gold">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://wa.me/201033388003" target="_blank" rel="noopener noreferrer" className="hover:text-gold">WhatsApp · +20 103 338 8003</a></li>
            <li><span className="text-white/45">Ain Sokhna and Port Ghalib, Egypt</span></li>
            <li><Link href="/" className="hover:text-gold">النسخة العربية</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/40">© Wild Dixie Escapes 2026</div>
    </footer>
  );
}
