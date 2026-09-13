-- Empire Resort — Owners Census System
-- 0009_fix_payment_status_constraint.sql
--
-- Bug fix: saving the survey's payment status failed with
-- `violates check constraint "payment_status_status_check"` even though
-- the app sends one of the exact allowed values. The live database's
-- constraint text almost certainly diverged from the schema file during
-- the original manual paste of the Arabic text into the SQL editor
-- (invisible Unicode differences are easy to introduce that way even
-- when the text looks identical on screen). Drop and recreate the
-- constraint from the verified-correct text to eliminate any drift.

alter table payment_status drop constraint if exists payment_status_status_check;

alter table payment_status add constraint payment_status_status_check
  check (status in (
    'سدد الـ2000 جنيه','لم يسدد','ينوي السداد','لديه اعتراض على السداد',
    'يحتاج معلومات قبل السداد','يرى أن الملف يجب أن يسير قانونيًا','غير محدد'
  ));
