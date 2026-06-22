import Image from "next/image";
import Link from "next/link";

export type Feature = {
  image: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  reverse?: boolean;
};

export function FeatureBlock({ image, eyebrow, title, body, bullets, reverse }: Feature) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2">
      <div className={`relative h-64 overflow-hidden rounded-3xl shadow-[var(--shadow-soft)] sm:h-80 ${reverse ? "lg:order-2" : ""}`}>
        <Image src={image} alt={title} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
        <span className="absolute inset-0 bg-gradient-to-t from-brand/20 to-transparent" />
      </div>
      <div className={reverse ? "lg:order-1" : ""}>
        <p className="text-sm font-semibold tracking-wide text-gold-dark">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h2>
        <p className="mt-3 leading-8 text-black/65">{body}</p>
        <ul className="mt-5 space-y-2.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-light text-gold-dark">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span className="text-sm text-black/75">{b}</span>
            </li>
          ))}
        </ul>
        <Link href="/#estimator" className="btn-navy mt-6 px-5">احسب دخلك مجانًا</Link>
      </div>
    </div>
  );
}
