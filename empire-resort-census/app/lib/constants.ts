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

export const TOPIC_SECTIONS = [
  { key: "electricity", label: "الكهرباء" },
  { key: "water", label: "المياه" },
  { key: "maintenance", label: "الصيانة والمديونيات" },
  { key: "management", label: "الإدارة" },
  { key: "developer", label: "المطوّر" },
  { key: "legal", label: "الحل القانوني" },
  { key: "collective", label: "الحل الجماعي" },
  { key: "future", label: "المستقبل" },
] as const;

export type TopicKey = (typeof TOPIC_SECTIONS)[number]["key"];

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
