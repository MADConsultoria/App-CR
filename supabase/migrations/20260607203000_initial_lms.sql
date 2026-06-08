create extension if not exists "pgcrypto";

create type public.user_role as enum ('student', 'admin');
create type public.course_status as enum ('draft', 'published', 'archived');
create type public.material_type as enum ('pdf', 'spreadsheet', 'document', 'link', 'other');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_url text,
  status public.course_status not null default 'draft',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  video_provider text,
  video_ref text,
  video_url text,
  duration_seconds integer,
  position integer not null default 0,
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lesson_materials (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  material_type public.material_type not null default 'other',
  storage_bucket text,
  storage_path text,
  external_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (user_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  last_position_seconds integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index courses_status_position_idx on public.courses(status, position);
create index modules_course_position_idx on public.modules(course_id, position);
create index lessons_module_position_idx on public.lessons(module_id, position);
create index materials_lesson_position_idx on public.lesson_materials(lesson_id, position);
create index enrollments_user_idx on public.enrollments(user_id);
create index progress_user_idx on public.lesson_progress(user_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.has_course_access(course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.enrollments e
      where e.user_id = auth.uid()
        and e.course_id = has_course_access.course_id
        and (e.expires_at is null or e.expires_at > now())
    );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_materials enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_admin_all"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

create policy "courses_select_published_with_access"
on public.courses for select
using (status = 'published' and public.has_course_access(id));

create policy "courses_admin_all"
on public.courses for all
using (public.is_admin())
with check (public.is_admin());

create policy "modules_select_with_course_access"
on public.modules for select
using (
  exists (
    select 1 from public.courses c
    where c.id = modules.course_id
      and c.status = 'published'
      and public.has_course_access(c.id)
  )
);

create policy "modules_admin_all"
on public.modules for all
using (public.is_admin())
with check (public.is_admin());

create policy "lessons_select_with_course_access"
on public.lessons for select
using (
  is_preview
  or exists (
    select 1
    from public.modules m
    join public.courses c on c.id = m.course_id
    where m.id = lessons.module_id
      and c.status = 'published'
      and public.has_course_access(c.id)
  )
);

create policy "lessons_admin_all"
on public.lessons for all
using (public.is_admin())
with check (public.is_admin());

create policy "materials_select_with_course_access"
on public.lesson_materials for select
using (
  exists (
    select 1
    from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where l.id = lesson_materials.lesson_id
      and c.status = 'published'
      and public.has_course_access(c.id)
  )
);

create policy "materials_admin_all"
on public.lesson_materials for all
using (public.is_admin())
with check (public.is_admin());

create policy "enrollments_select_own_or_admin"
on public.enrollments for select
using (user_id = auth.uid() or public.is_admin());

create policy "enrollments_admin_all"
on public.enrollments for all
using (public.is_admin())
with check (public.is_admin());

create policy "progress_select_own_or_admin"
on public.lesson_progress for select
using (user_id = auth.uid() or public.is_admin());

create policy "progress_insert_own"
on public.lesson_progress for insert
with check (user_id = auth.uid());

create policy "progress_update_own"
on public.lesson_progress for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
