import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "الشروط والأحكام | Wild Dixie Escapes",
  description: "شروط الحجز والإلغاء والدفع في وايلد ديكسي إسكيبس.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold">الشروط والأحكام</h1>
      <p className="mt-2 text-sm text-black/45">آخر تحديث: يوليو ٢٠٢٦</p>

      <div className="mt-8 space-y-8 leading-8 text-black/70">
        <section>
          <h2 className="mb-2 text-xl font-bold text-brand">١. الحجز والعربون</h2>
          <p>
            يتأكد الحجز بعد دفع عربون (نسبة من إجمالي قيمة الإقامة تُحدَّد لكل وحدة) عبر إنستاباي أو
            المحافظ الإلكترونية (فودافون كاش / أورنج كاش) بالجنيه المصري. باقي المبلغ يُدفع عند الوصول
            أو حسب الاتفاق المكتوب على واتساب.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-brand">٢. الإلغاء والاسترداد</h2>
          <p>
            الإلغاء قبل ٧ أيام أو أكثر من تاريخ الوصول: يُسترد المبلغ المدفوع بالكامل.
            الإلغاء خلال أقل من ٧ أيام من الوصول: يُخصم من العربون حسب سياسة الوحدة المحددة وقت الحجز.
            في حالة إلغاء الحجز من طرفنا لأي سبب، يُسترد كامل المبلغ المدفوع فورًا.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-brand">٣. تصاريح الدخول</h2>
          <p>
            دخول الكمبوندات في العين السخنة يتطلب تصريح بوابة باسم الضيف. لإصدار التصريح نطلب
            الاسم الكامل والرقم القومي ولوحة السيارة قبل الوصول. عدم توفير هذه البيانات في الوقت
            المطلوب قد يؤخر الدخول ولا يُعد سببًا لاسترداد المبلغ.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-brand">٤. مسؤولية الضيف</h2>
          <p>
            الضيف مسؤول عن الوحدة ومحتوياتها طوال فترة الإقامة. قد يُطلب تأمين أضرار قابل للاسترداد
            يُعاد بالكامل بعد المغادرة والمعاينة. المرافق (كهرباء ومياه) تُدفع من الضيف بشكل منفصل حسب
            سياسة الوحدة المعلنة وقت الحجز.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-brand">٥. التواصل</h2>
          <p>
            كل الاتفاقات الملزمة تتم كتابةً عبر واتساب على الرقم +20 103 338 8003 — الرسائل المكتوبة
            هي المرجع في حالة أي خلاف.
          </p>
        </section>
      </div>
    </div>
  );
}
