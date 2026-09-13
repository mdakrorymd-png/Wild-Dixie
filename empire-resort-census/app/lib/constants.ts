// Survey copy — copied VERBATIM from spec §6/§8. Do not rephrase, do not
// add interpretive language, do not reorder in a way that implies weight.
// This file is the single source of truth for every survey label in the
// app; UI components must import from here rather than inlining strings.

export const MAIN_POSITION_QUESTION = "ما هو موقفكم الحالي من الوضع في Empire Resort؟";

export const MAIN_POSITION_OPTIONS = [
  "أؤيد التحرك الجماعي للملاك",
  "أؤيد الحلول الودية والتفاوض",
  "أرى أن الحل يجب أن يكون من خلال الإجراءات القانونية",
  "أحتاج إلى معلومات وبيانات أكثر قبل اتخاذ موقف",
  "لدي اعتراضات على طريقة إدارة الملف الحالي",
  "أؤيد السداد / المشاركة في الحل الحالي",
  "لا أؤيد السداد قبل مراجعة المديونيات والمستندات",
  "لم أحدد موقفي بعد",
] as const;

export const MAIN_POSITION_FREE_TEXT_LABEL = "لدي رأي مختلف وأريد شرحه";

// Each topic is either a satisfaction rating (about a party/service) or a
// stance (support/oppose a proposed path forward) — the option set shown
// depends on which. Both scales are symmetric with an explicit
// neutral/no-opinion option, so neither leads toward a particular answer.
export const TOPIC_SECTIONS = [
  { key: "electricity", label: "الكهرباء", type: "satisfaction" },
  { key: "water", label: "المياه", type: "satisfaction" },
  { key: "maintenance", label: "الصيانة والمديونيات", type: "satisfaction" },
  { key: "management_current", label: "الإدارة الحالية", type: "satisfaction" },
  { key: "management_previous", label: "الإدارة السابقة", type: "satisfaction" },
  { key: "developer", label: "المطوّر", type: "satisfaction" },
  { key: "legal", label: "الحل القانوني", type: "stance" },
  { key: "collective", label: "الحل الجماعي", type: "stance" },
  { key: "future", label: "المستقبل", type: "stance" },
] as const;

export type TopicKey = (typeof TOPIC_SECTIONS)[number]["key"];

export const TOPIC_SATISFACTION_OPTIONS = [
  "راضٍ تمامًا",
  "راضٍ جزئيًا",
  "غير راضٍ",
  "محايد / لا رأي",
] as const;

export const TOPIC_STANCE_OPTIONS = ["أؤيده", "أعارضه", "غير متأكد", "لا رأي"] as const;

export const PARTICIPATION_QUESTION =
  "هل ترغب في المشاركة في أي أنشطة مستقبلية تخص ملاك Empire Resort؟";

export const PARTICIPATION_OPTIONS = [
  "نعم أريد المشاركة",
  "ربما لاحقًا",
  "لا أرغب حاليًا",
  "أريد فقط معرفة الأخبار",
  "لجان أو مجموعات عمل",
  "الجوانب القانونية",
  "الجوانب المالية والمراجعة",
  "التطوير والمشروعات",
  "التواصل مع باقي الملاك",
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  "سدد الـ2000 جنيه",
  "لم يسدد",
  "ينوي السداد",
  "لديه اعتراض على السداد",
  "يحتاج معلومات قبل السداد",
  "يرى أن الملف يجب أن يسير قانونيًا",
  "غير محدد",
] as const;

export const CONTACT_STATUS_OPTIONS = ["تم التواصل", "لم يتم التواصل"] as const;

export const CENSUS_STATUS_OPTIONS = ["مكتمل", "جزئي", "لم يبدأ"] as const;

export const CONTACT_OUTCOME_OPTIONS = [
  "تم التواصل",
  "لم يرد",
  "رقم غير صحيح",
  "سيعاود الاتصال",
  "رفض المشاركة",
] as const;

export const STAGE_KEYS = ["2007", "2010", "2013"] as const;

export const MAINTENANCE_CHARGE_YEARS = ["2025", "2026"] as const;
