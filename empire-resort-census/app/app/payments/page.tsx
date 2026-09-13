import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { MAINTENANCE_CHARGE_YEARS } from "@/lib/constants";
import type { MaintenancePaymentRow } from "@/lib/types";
import PaymentsForm, { type PaymentWithUrl } from "./PaymentsForm";

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.ownerId) redirect("/onboarding");

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("maintenance_payments")
    .select("*")
    .eq("owner_id", user.ownerId)
    .order("created_at", { ascending: false });

  const payments = (rows ?? []) as MaintenancePaymentRow[];
  const withUrls: PaymentWithUrl[] = await Promise.all(
    payments.map(async (p) => {
      const { data } = await supabase.storage
        .from("payment-receipts")
        .createSignedUrl(p.receipt_path, 3600);
      return { ...p, signedUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-xl font-bold text-brand">مدفوعات فروق الصيانة</h1>
      <p className="mb-6 text-sm text-muted">
        سجّل هنا كل دفعة بفروق الصيانة (٢٠٢٥ و٢٠٢٦) مع صورة الإيصال أو سند التحويل. السجل دا
        بيتراكم — لو غلطت في دفعة، ارفع تصحيح كسجل جديد بدل التعديل على القديم.
      </p>
      <div className="space-y-8">
        {MAINTENANCE_CHARGE_YEARS.map((year) => (
          <PaymentsForm
            key={year}
            year={year}
            existing={withUrls.filter((p) => p.charge_year === year)}
          />
        ))}
      </div>
    </div>
  );
}
