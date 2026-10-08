import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { canManage, getCurrentUser } from "@/lib/auth";
import { CENSUS_STATUS_OPTIONS, CONTACT_STATUS_OPTIONS } from "@/lib/constants";

const PAGE_SIZE = 20;

interface OwnerListRow {
  id: string;
  contact_status: string | null;
  census_status: string | null;
  verification_status: string;
  units: { unit_number: string; stage_id: string } | null;
  owner_names: { full_name: string } | null;
}

export default async function OwnersListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canManage(user.role)) redirect("/dashboard");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const unitSearch = params.unit?.trim() ?? "";
  const nameSearch = params.name?.trim() ?? "";
  const contactStatus = params.contact_status ?? "";
  const censusStatus = params.census_status ?? "";

  const supabase = await createClient();
  let query = supabase
    .from("owners")
    .select(
      "id, contact_status, census_status, verification_status, units(unit_number, stage_id), owner_names(full_name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (contactStatus) query = query.eq("contact_status", contactStatus);
  if (censusStatus) query = query.eq("census_status", censusStatus);
  if (unitSearch) query = query.ilike("units.unit_number", `%${unitSearch}%`);
  if (nameSearch) query = query.ilike("owner_names.full_name", `%${nameSearch}%`);

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1);
  const rows = (data ?? []) as unknown as OwnerListRow[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const sp = new URLSearchParams({
      ...(unitSearch ? { unit: unitSearch } : {}),
      ...(nameSearch ? { name: nameSearch } : {}),
      ...(contactStatus ? { contact_status: contactStatus } : {}),
      ...(censusStatus ? { census_status: censusStatus } : {}),
      page: String(p),
    });
    return `/owners?${sp.toString()}`;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand">قائمة الملاك ({total})</h1>

      <form className="card grid grid-cols-2 gap-3 sm:grid-cols-4" method="get">
        <input className="input" name="unit" placeholder="رقم الوحدة" defaultValue={unitSearch} />
        <input className="input" name="name" placeholder="الاسم" defaultValue={nameSearch} />
        <select className="input" name="contact_status" defaultValue={contactStatus}>
          <option value="">كل حالات التواصل</option>
          {CONTACT_STATUS_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <select className="input" name="census_status" defaultValue={censusStatus}>
          <option value="">كل حالات البيانات</option>
          {CENSUS_STATUS_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <button className="btn-primary col-span-2 sm:col-span-1">بحث</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-2 text-right">الوحدة</th>
              <th className="p-2 text-right">الاسم</th>
              <th className="p-2 text-right">حالة التحقق</th>
              <th className="p-2 text-right">التواصل</th>
              <th className="p-2 text-right">البيانات</th>
              <th className="p-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-gray-100">
                <td className="p-2">{o.units?.unit_number ?? "—"}</td>
                <td className="p-2">{o.owner_names?.full_name ?? "—"}</td>
                <td className="p-2">{o.verification_status}</td>
                <td className="p-2">{o.contact_status}</td>
                <td className="p-2">{o.census_status}</td>
                <td className="p-2">
                  <Link href={`/owners/${o.id}`} className="text-brand hover:underline">
                    فتح
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">
                  لا توجد نتائج
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <Link
          href={pageHref(Math.max(1, page - 1))}
          className={page <= 1 ? "pointer-events-none text-gray-300" : "text-brand"}
        >
          السابق
        </Link>
        <span>
          صفحة {page} من {totalPages}
        </span>
        <Link
          href={pageHref(Math.min(totalPages, page + 1))}
          className={page >= totalPages ? "pointer-events-none text-gray-300" : "text-brand"}
        >
          التالي
        </Link>
      </div>
    </div>
  );
}
