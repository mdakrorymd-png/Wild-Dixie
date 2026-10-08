-- Empire Resort — Owners Census System
-- 0010_topic_choice_options.sql
--
-- Converts the 8 free-text topic sections into 9 structured choices (so
-- responses can actually be tallied instead of only read one-by-one), per
-- explicit owner request. "الإدارة" is split into "الإدارة الحالية" and
-- "الإدارة السابقة". Each topic is either a satisfaction rating (about a
-- party/service) or a stance (support/oppose a proposed path forward);
-- both scales are symmetric with an explicit neutral/no-opinion option so
-- neither leads toward a particular answer, matching spec §2's
-- non-negotiable constraint on non-leading questions. A free-text
-- `detail` column is kept alongside the fixed choice for whatever else
-- an owner wants to add.

-- Clear out any pre-existing free-text test rows first — they predate
-- this fixed-choice scheme and can't satisfy the new constraints below
-- (this is safe: nothing has launched to real owners yet).
delete from topic_responses
where topic_key not in (
  'electricity','water','maintenance','management_current','management_previous',
  'developer','legal','collective','future'
);

delete from topic_responses
where not (
  (topic_key in ('electricity','water','maintenance','management_current','management_previous','developer')
    and stance in ('راضٍ تمامًا','راضٍ جزئيًا','غير راضٍ','محايد / لا رأي'))
  or
  (topic_key in ('legal','collective','future')
    and stance in ('أؤيده','أعارضه','غير متأكد','لا رأي'))
);

alter table topic_responses drop constraint if exists topic_responses_topic_key_check;
alter table topic_responses add constraint topic_responses_topic_key_check
  check (topic_key in (
    'electricity','water','maintenance','management_current','management_previous',
    'developer','legal','collective','future'
  ));

alter table topic_responses add column if not exists detail text;

alter table topic_responses drop constraint if exists topic_responses_stance_check;
alter table topic_responses add constraint topic_responses_stance_check
  check (
    (topic_key in ('electricity','water','maintenance','management_current','management_previous','developer')
      and stance in ('راضٍ تمامًا','راضٍ جزئيًا','غير راضٍ','محايد / لا رأي'))
    or
    (topic_key in ('legal','collective','future')
      and stance in ('أؤيده','أعارضه','غير متأكد','لا رأي'))
  );
