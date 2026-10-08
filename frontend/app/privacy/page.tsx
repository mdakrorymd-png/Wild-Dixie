import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | Wild Dixie Escapes",
  description: "كيف نتعامل مع بياناتك الشخصية — الرقم القومي، تصاريح البوابة، وبيانات التواصل.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold">سياسة الخصوصية</h1>
      <p className="mt-2 text-sm text-black/45">آخر تحديث: يوليو ٢٠٢٦</p>

      <div className="mt-8 space-y-8 leading-8 text-black/70">
        <section>
          <h2 className="mb-2 text-xl font-bold text-brand">١. البيانات اللي بنجمعها</h2>
          <p>
            عند الحجز بنطلب: الاسم الكامل، رقم الموبايل / الواتساب، الرقم القومي، ولوحة السيارة.
            الرقم القومي واللوحة مطلوبان حصريًا لإصدار تصريح دخول الكمبوند — دي متطلبات أمن
            الكمبوندات في العين السخنة، مش اختيارنا.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-brand">٢. إزاي بنستخدمها</h2>
          <p>
            بيانات التصريح تُرسل لإدارة الكمبوند المعني فقط لإصدار تصريح الدخول، ولا تُشارك مع أي طرف
            تالت آخر لأي غرض تسويقي أو غيره. رقم الواتساب يُستخدم للتواصل بخصوص حجزك فقط.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-brand">٣. التخزين والحذف</h2>
          <p>
            بيانات التصريح (الرقم القومي واللوحة) تُحذف من سجلاتنا خلال ٣٠ يوم من انتهاء الإقامة.
            بيانات التواصل الأساسية (الاسم والرقم) نحتفظ بها لخدمة حجوزاتك المستقبلية، وتقدر تطلب
            حذفها بالكامل في أي وقت برسالة واتساب.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-brand">٤. حقوقك</h2>
          <p>
            من حقك تطلب في أي وقت: نسخة من بياناتك المخزنة عندنا، تصحيحها، أو حذفها نهائيًا.
            ابعتلنا على واتساب +20 103 338 8003 وهننفذ طلبك خلال ٧ أيام عمل.
          </p>
        </section>
      </div>
    </div>
  );
}
