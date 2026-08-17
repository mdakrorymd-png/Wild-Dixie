import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  reviewNotice,
  children,
}: {
  title: string;
  updated: string;
  reviewNotice?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl pb-16">
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-1 text-sm text-black/45">آخر تحديث: {updated}</p>

      {reviewNotice && (
        <div className="mt-5 rounded-2xl border border-gold/40 bg-gold-light/40 px-4 py-3 text-sm text-brand-dark">
          هذه الصفحة مسودة أولية توضح ممارساتنا الفعلية بشفافية، وهي قيد المراجعة القانونية النهائية.
          لو عندك أي سؤال عن بياناتك أو حجزك، كلّمنا مباشرة على{" "}
          <a href="https://wa.me/201033388003" target="_blank" rel="noopener noreferrer" className="font-semibold underline">واتساب</a>.
        </div>
      )}

      <div className="legal-prose mt-8 space-y-6 text-sm leading-7 text-black/75">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-bold text-brand">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
