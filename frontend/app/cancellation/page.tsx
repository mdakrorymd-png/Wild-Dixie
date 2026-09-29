import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata = { title: "سياسة الإلغاء — Wild Dixie Escapes" };

export default function CancellationPage() {
  return (
    <LegalPage title="سياسة الإلغاء والاسترداد" updated="أغسطس ٢٠٢٦">
      <LegalSection title="القاعدة الأساسية">
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong>الإلغاء قبل ٧ أيام أو أكتر من تاريخ الوصول:</strong> استرداد كامل للمبلغ المدفوع (العربون
            وأي دفعات إضافية).
          </li>
          <li>
            <strong>الإلغاء خلال الـ٧ أيام السابقة للوصول:</strong> المبلغ المدفوع غير قابل للاسترداد. السبب
            إن موسم الحجز في العين السخنة قصير نسبيًا، والوحدة بتفوّت فرصة حجز بديل في نفس الفترة.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="طريقة الاسترداد">
        <p>
          أي مبلغ مسترد بيرجع بنفس طريقة الدفع اللي استخدمتها (إنستاباي أو المحفظة الإلكترونية)، وبيتم خلال
          أيام عمل قليلة من تأكيد الإلغاء.
        </p>
      </LegalSection>

      <LegalSection title="حالات استثنائية">
        <p>
          في حالة إلغاء من جانبنا (مشكلة في الوحدة، ظرف قاهر) بتستلم استرداد كامل بغض النظر عن التوقيت. أي طلب
          استثناء تاني بيتراجع حالة بحالة — كلّمنا على واتساب.
        </p>
      </LegalSection>

      <LegalSection title="تواصل معنا">
        <p>لأي استفسار عن حجزك: واتساب <a href="https://wa.me/201033388003" className="text-aqua underline">201033388003+</a>.</p>
      </LegalSection>
    </LegalPage>
  );
}
