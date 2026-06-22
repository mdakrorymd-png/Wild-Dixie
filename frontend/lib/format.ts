export function egp(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US").format(Math.round(n)) + " ج.م";
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

const TYPE_AR: Record<string, string> = {
  chalet: "شاليه",
  villa: "فيلا",
  apartment: "شقة",
  studio: "استوديو",
  cabin: "كابينة",
  room: "غرفة",
};

export const propertyTypeAr = (t: string): string => TYPE_AR[t] ?? t;

const STATUS_AR: Record<string, string> = {
  draft: "مسودة",
  pending_review: "قيد المراجعة",
  published: "منشور",
  rejected: "مرفوض",
  suspended: "موقوف",
  pending_payment: "بانتظار الدفع",
  pending_approval: "بانتظار موافقة الإدارة",
  confirmed: "مؤكد",
  cancelled: "ملغي",
  expired: "منتهي",
  completed: "مكتمل",
};

export const statusAr = (s: string): string => STATUS_AR[s] ?? s;

const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export function monthAr(ym: string): string {
  const [y, m] = ym.split("-");
  const idx = Number(m) - 1;
  return `${MONTHS_AR[idx] ?? m} ${y}`;
}
