import Image from "next/image";
import Link from "next/link";
import type { PropertyListItem } from "@/lib/types";
import { egp, propertyTypeAr } from "@/lib/format";
import { coverImage } from "@/lib/images";

export function PropertyCard({ p }: { p: PropertyListItem }) {
  const isManaged = p.listing_type === "managed";
  return (
    <Link
      href={`/properties/${p.id}`}
      className="group card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[var(--shadow-hover)]"
    >
      <div className="relative h-48 overflow-hidden bg-brand-light">
        <Image
          src={coverImage(p.id, p.property_type)}
          alt={p.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 badge bg-brand/95 text-white backdrop-blur">
          {propertyTypeAr(p.property_type)}
        </span>
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
            isManaged
              ? "bg-gold text-brand-dark"
              : "bg-white/85 text-brand backdrop-blur"
          }`}
        >
          {isManaged ? "مُدارة بالكامل" : "اعرض بنفسك"}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-gold px-3 py-1 text-sm font-bold text-brand-dark shadow-sm">
          {egp(p.base_price_per_night)} <span className="font-normal text-brand-dark/75">/ ليلة</span>
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-black/45">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
          </svg>
          {p.area}
        </div>
        <h3 className="mt-1.5 line-clamp-1 font-bold text-black/85 transition group-hover:text-brand">{p.title}</h3>
        <p className="mt-1 text-sm text-black/50">
          {p.max_guests} ضيوف · {p.bedrooms} غرف نوم
        </p>
      </div>
    </Link>
  );
}
