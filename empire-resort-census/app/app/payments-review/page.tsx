import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canManage, getCurrentUser } from "@/lib/auth";

interface PaymentReviewRow {
  id: string;
  charge_year: string;
  amount_declared: number | null;
  receipt_path: string;
  note: string | null;
  created_at: string;
  owners: {
    id: string;
    units: { unit_number: string; building: string | null } | null;
    owner_names: { full_name: string } | null;
    owner_phones: { phone: string } | null;
  } | null;
}

export default async function PaymentsReviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canManage(user.role)) redirect("/dashboard");

  const supabase = await createClient();
  const { data: rowsRaw } = await supabase
    .from("maintenance_payments")
    .select(
      "*, owners(id, units(unit_number, building), owner_names(full_name), owner_phones(phone))"
    )
    .order("created_at", { ascending: false });

  const rows = (rowsRaw ?? []) as unknown as PaymentReviewRow[];

  const withUrls = await Promise.all(
    rows.map(async (r) => {
      const { data } = await supabase.storage
        .from("payment-receipts")
        .createSignedUrl(r.receipt_path, 3600);
      return { ...r, signedUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand">مراجعة إيصالات فروق الصيانة</h1>
        <p className="text-sm text-muted">
          كل الإيصالات المرفوعة من الملاك، الأحدث أولًا — بيانات المالك كاملة مع صورة الإيصال.
        </p>
      </div>

      {withUrls.length === 0 && <p className="text-sm text-muted">لا توجد إيصالات مرفوعة بعد.</p>}

      <div className="space-y-3">
        {withUrls.map((r) => (
          <div key={r.id} className="card flex flex-wrap items-center gap-4">
            {r.signedUrl && (
              <a href={r.signedUrl} target="_blank" rel="noreferrer" className="shrink-0">
                <img
                  src={r.signedUrl}
                  alt="صورة الإيصال"
                  className="h-24 w-24 rounded object-cover"
                />
              </a>
            )}
            <div className="flex-1 text-sm">
              <p className="font-semibold text-gray-800">
                {r.owners?.owner_names?.full_name ?? "بدون اسم"}
                {r.owners?.units?.unit_number
                  ? ` — وحدة ${r.owners.units.unit_number}${r.owners.units.building ? ` (${r.owners.units.building})` : ""}`
                  : ""}
              </p>
              <p className="text-gray-600">التليفون: {r.owners?.owner_phones?.phone ?? "—"}</p>
              <p className="text-gray-600">
                السنة: {r.charge_year} — المبلغ: {r.amount_declared != null ? `${r.amount_declared} جنيه` : "بدون مبلغ"}
              </p>
              <p className="text-xs text-muted">{new Date(r.created_at).toLocaleString("ar-EG")}</p>
              {r.note && <p className="text-gray-600">ملاحظة: {r.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
