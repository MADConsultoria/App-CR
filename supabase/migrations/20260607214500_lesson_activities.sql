create type public.activity_status as enum ('draft', 'published', 'archived');
create type public.activity_submission_status as enum ('draft', 'submitted', 'reviewed');
create type public.activity_question_type as enum (
  'text',
  'long_text',
  'number',
  'money',
  'boolean',
  'select',
  'location'
);

create table public.lesson_activities (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  description text,
  status public.activity_status not null default 'draft',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_questions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.lesson_activities(id) on delete cascade,
  section_title text,
  label text not null,
  help_text text,
  question_key text not null,
  question_type public.activity_question_type not null,
  options jsonb,
  is_required boolean not null default false,
  position integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (activity_id, question_key)
);

create table public.activity_submissions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.lesson_activities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.activity_submission_status not null default 'draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (activity_id, user_id)
);

create table public.activity_answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.activity_submissions(id) on delete cascade,
  question_id uuid not null references public.activity_questions(id) on delete cascade,
  value_text text,
  value_number numeric,
  value_boolean boolean,
  value_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (submission_id, question_id)
);

create index lesson_activities_lesson_position_idx on public.lesson_activities(lesson_id, position);
create index activity_questions_activity_position_idx on public.activity_questions(activity_id, position);
create index activity_submissions_user_idx on public.activity_submissions(user_id);
create index activity_answers_submission_idx on public.activity_answers(submission_id);

alter table public.lesson_activities enable row level security;
alter table public.activity_questions enable row level security;
alter table public.activity_submissions enable row level security;
alter table public.activity_answers enable row level security;

create policy "lesson_activities_select_with_course_access"
on public.lesson_activities for select
using (
  status = 'published'
  and exists (
    select 1
    from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where l.id = lesson_activities.lesson_id
      and c.status = 'published'
      and public.has_course_access(c.id)
  )
);

create policy "lesson_activities_admin_all"
on public.lesson_activities for all
using (public.is_admin())
with check (public.is_admin());

create policy "activity_questions_select_with_activity_access"
on public.activity_questions for select
using (
  exists (
    select 1
    from public.lesson_activities la
    join public.lessons l on l.id = la.lesson_id
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where la.id = activity_questions.activity_id
      and la.status = 'published'
      and c.status = 'published'
      and public.has_course_access(c.id)
  )
);

create policy "activity_questions_admin_all"
on public.activity_questions for all
using (public.is_admin())
with check (public.is_admin());

create policy "activity_submissions_select_own_or_admin"
on public.activity_submissions for select
using (user_id = auth.uid() or public.is_admin());

create policy "activity_submissions_insert_own_with_activity_access"
on public.activity_submissions for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.lesson_activities la
    join public.lessons l on l.id = la.lesson_id
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where la.id = activity_submissions.activity_id
      and la.status = 'published'
      and c.status = 'published'
      and public.has_course_access(c.id)
  )
);

create policy "activity_submissions_update_own_draft_or_admin"
on public.activity_submissions for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "activity_answers_select_own_or_admin"
on public.activity_answers for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.activity_submissions s
    where s.id = activity_answers.submission_id
      and s.user_id = auth.uid()
  )
);

create policy "activity_answers_insert_own"
on public.activity_answers for insert
with check (
  exists (
    select 1
    from public.activity_submissions s
    where s.id = activity_answers.submission_id
      and s.user_id = auth.uid()
  )
);

create policy "activity_answers_update_own"
on public.activity_answers for update
using (
  exists (
    select 1
    from public.activity_submissions s
    where s.id = activity_answers.submission_id
      and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.activity_submissions s
    where s.id = activity_answers.submission_id
      and s.user_id = auth.uid()
  )
);

create policy "activity_answers_admin_all"
on public.activity_answers for all
using (public.is_admin())
with check (public.is_admin());
