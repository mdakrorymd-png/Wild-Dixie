import Link from "next/link";
import { getCurrentUser, canManage } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function Navbar() {
  const user = await getCurrentUser();
  if (!user) return null;

  const links: { href: string; label: string }[] = [
    { href: "/dashboard", label: "لوحة البيانات" },
    { href: "/stages", label: "مقارنة المراحل" },
  ];
  if (user.ownerId) links.push({ href: "/me", label: "بياناتي" });
  if (canManage(user.role)) {
    links.push({ href: "/owners", label: "قائمة الملاك" });
    links.push({ href: "/admin", label: "الإعدادات" });
  }
  if (user.role === "volunteer" || canManage(user.role)) {
    links.push({ href: "/volunteers", label: "اعرف جارك" });
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <span className="text-lg font-bold text-brand">Empire Resort — إحصاء الملاك</span>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-gray-700 hover:text-brand">
              {l.label}
            </Link>
          ))}
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
