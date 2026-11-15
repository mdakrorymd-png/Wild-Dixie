import Image from "next/image";
import Link from "next/link";
import { WHATSAPP_URL, whatsappWith } from "@/lib/site";

// Real photo of the Wild Dixie–managed unit (sunset from the balcony).
const HERO = "/listings/beachfront/05.jpg";

const CONTACT = whatsappWith("Hello Wild Dixie, I own a holiday home and would like a free inspection and forecast.");

const STEPS = [
  { n: "1", t: "Send us your unit", d: "Details and a few photos on WhatsApp. We inspect it and send a written plan with a forecast for your apartment." },
  { n: "2", t: "We run it", d: "Listing, pricing, guests, cleaning, maintenance and licensing. Your listing goes live within 14 days." },
  { n: "3", t: "You get paid", d: "A monthly statement in EUR with every booking and cost, and your payout. You keep ownership and your calendar." },
];

const INCLUDED: [string, string][] = [
  ["Photos and listing", "Professional photos and an optimised listing in English, German, Italian and Polish."],
  ["Distribution", "Airbnb, Booking.com and wilddixie.com on one shared calendar."],
  ["Pricing", "Seasonal and weekend dynamic pricing, set against local demand and flight schedules."],
  ["Guests", "Messaging and booking confirmation, guest ID check and a refundable deposit."],
  ["Check-in", "Key handover, in-person check-in and check-out."],
  ["Cleaning", "Cleaning and linen change after every stay, documented with photos."],
  ["Access", "Compound access and beach passes arranged for every guest."],
  ["Maintenance", "Repairs on demand within an agreed cap; anything larger is quoted to you first."],
  ["Licensing", "Your unit prepared for Egypt's holiday-home licence (Decree 209/2025) and guests registered online."],
  ["Payouts", "Payment collection and a monthly statement in EUR."],
  ["Your stays", "Block your own dates whenever you want them."],
  ["One manager", "A dedicated manager on the ground who answers you in English."],
];

const SCENARIOS = [
  { label: "Cautious", rate: "€45", occ: "35%", nights: "128", income: "€5,760", fee: "−€1,152", net: "€4,608" },
  { label: "Typical", rate: "€55", occ: "45%", nights: "164", income: "€9,020", fee: "−€1,804", net: "€7,216" },
  { label: "Strong", rate: "€65", occ: "55%", nights: "201", income: "€13,065", fee: "−€2,613", net: "€10,452" },
];

const FAQ: [string, string][] = [
  ["What does it cost?", "20% of total rent. No setup fee and no monthly subscription: if the unit earns nothing, you pay nothing."],
  ["Who controls dates and prices?", "You do. We propose pricing, you have the final word, and you can block dates for yourself at any time."],
  ["How is my unit protected?", "Every guest is checked by ID, pays a refundable damage deposit, and the unit is photographed before and after each stay."],
  ["How do I get paid?", "Monthly, with a statement showing every booking, our fee and any costs. Payouts in EUR by bank transfer, or in EGP if you prefer."],
  ["Do I need a licence to rent?", "Egypt's Decree 209/2025 introduced a holiday-home licence with equipment standards and online guest registration. We check your unit against the list and handle the process as part of management."],
  ["Can I leave the agreement?", "Yes. 30 days' notice, no penalties."],
];

export default function EnglishHome() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <div className="text-left">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* HERO */}
      <section className="full-bleed relative flex min-h-[92dvh] flex-col items-center justify-center overflow-hidden">
        <Image src={HERO} alt="Sunset over the Red Sea from a Wild Dixie holiday home" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "center 40%" }} />
        <div className="hero-overlay-cinema absolute inset-0" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 pt-20 text-center text-white">
          <h1 className="fade-up max-w-3xl font-bold leading-[1.15] tracking-tight drop-shadow-lg" style={{ fontSize: "clamp(2.2rem, 6vw, 4.5rem)" }}>
            Your Red Sea holiday home,
            <span className="text-gold"> earning while you&apos;re away.</span>
          </h1>
          <p className="fade-up mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Full holiday-rental management for owners who live abroad: listing, guests, cleaning, maintenance, licensing and a clear monthly statement in euros.
          </p>
          <div className="fade-up mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={CONTACT} target="_blank" rel="noopener noreferrer" className="btn-primary px-8 py-3.5 text-base shadow-[0_12px_32px_-8px_rgba(201,162,75,0.55)]">
              Get a free inspection
            </a>
            <Link href="/en#pricing" className="btn border border-white/30 bg-white/10 px-7 py-3.5 text-base text-white backdrop-blur-sm hover:bg-white/20">
              See pricing
            </Link>
          </div>
          <p className="fade-up mt-10 text-sm text-white/70">Ain Sokhna · Port Ghalib, Marsa Alam</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* HOW */}
        <section id="how" className="scroll-mt-24 py-20">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">How it works</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Three steps, then your home earns</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center">
                <div className="mb-5 grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-brand text-3xl font-bold text-gold ring-1 ring-brand/20">{s.n}</div>
                <h3 className="text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-sm leading-7 text-black/55">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHY NOW */}
        <section className="py-10">
          <div className="card grid gap-6 p-8 sm:grid-cols-3">
            <div><p className="text-3xl font-bold text-brand">2.29M</p><p className="mt-1 text-sm text-black/55">passengers at Marsa Alam airport in 2024</p></div>
            <div><p className="text-3xl font-bold text-brand">+24%</p><p className="mt-1 text-sm text-black/55">passenger growth in 2025</p></div>
            <div><p className="text-3xl font-bold text-brand">13 / week</p><p className="mt-1 text-sm text-black/55">new scheduled Wizz Air flights from Poland and Budapest since Oct 2026: travellers who book their own stay</p></div>
          </div>
        </section>

        {/* INCLUDED */}
        <section id="included" className="scroll-mt-24 py-16">
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">What&apos;s included</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">One local partner. Nothing left for you to chase.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map(([t, d]) => (
              <div key={t} className="card p-6">
                <h3 className="font-bold text-brand">{t}</h3>
                <p className="mt-2 text-sm leading-6 text-black/60">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="scroll-mt-24 py-16">
          <div className="mx-auto max-w-2xl rounded-3xl bg-brand p-10 text-center text-white">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">Pricing</span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Full Management</h2>
            <p className="mt-4 text-6xl font-bold text-gold">20%</p>
            <p className="mt-2 text-white/70">of total rent. Everything above included.</p>
            <p className="mt-6 text-sm text-white/60">No setup fee. No monthly subscription. You pay only when the unit earns. Renovation, styling and fit-out are quoted per unit.</p>
            <a href={CONTACT} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8 px-8 py-3.5 text-base">Talk to us on WhatsApp</a>
          </div>
        </section>

        {/* EARNINGS */}
        <section id="earnings" className="scroll-mt-24 py-16">
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">What a unit could earn</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">A one-bedroom in Port Ghalib, three scenarios</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-black/55">Illustrations built from public market data, not a promise. After inspection we send a forecast for your specific apartment.</p>
          </div>
          <div className="card overflow-x-auto p-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand"><th className="p-3"></th>{SCENARIOS.map((s) => <th key={s.label} className="p-3">{s.label}</th>)}</tr>
              </thead>
              <tbody className="text-black/70">
                <tr className="border-t border-brand/10"><td className="p-3">Average nightly rate</td>{SCENARIOS.map((s) => <td key={s.label} className="p-3">{s.rate}</td>)}</tr>
                <tr className="border-t border-brand/10"><td className="p-3">Occupancy</td>{SCENARIOS.map((s) => <td key={s.label} className="p-3">{s.occ}</td>)}</tr>
                <tr className="border-t border-brand/10"><td className="p-3">Nights booked per year</td>{SCENARIOS.map((s) => <td key={s.label} className="p-3">{s.nights}</td>)}</tr>
                <tr className="border-t border-brand/10"><td className="p-3">Rental income per year</td>{SCENARIOS.map((s) => <td key={s.label} className="p-3">{s.income}</td>)}</tr>
                <tr className="border-t border-brand/10"><td className="p-3">Management fee (20%)</td>{SCENARIOS.map((s) => <td key={s.label} className="p-3">{s.fee}</td>)}</tr>
                <tr className="border-t border-brand/10 font-bold text-brand"><td className="p-3">Before utilities and service charges</td>{SCENARIOS.map((s) => <td key={s.label} className="p-3">{s.net}</td>)}</tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-black/45">Sources: AirDNA Marsa Alam (Sept 2026, about €63/night at 54% occupancy); Airbnb and Booking.com Port Ghalib listings (2026). Converted at €1 = $1.12.</p>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 py-16">
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">FAQ</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Questions owners ask</h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="card group p-5">
                <summary className="cursor-pointer list-none font-bold text-brand">{q}</summary>
                <p className="mt-3 text-sm leading-7 text-black/60">{a}</p>
              </details>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary px-8 py-3.5 text-base">WhatsApp +20 103 338 8003</a>
          </div>
        </section>
      </div>
    </div>
  );
}
