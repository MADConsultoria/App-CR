create table public.journey_phases (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  phase_number integer not null,
  title text not null,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (course_id, phase_number)
);

create table public.user_journey_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  current_phase_number integer not null default 1,
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index journey_phases_course_position_idx on public.journey_phases(course_id, position);
create index user_journey_progress_user_course_idx on public.user_journey_progress(user_id, course_id);

alter table public.journey_phases enable row level security;
alter table public.user_journey_progress enable row level security;

create policy "journey_phases_select_with_course_access"
on public.journey_phases for select
using (
  exists (
    select 1
    from public.courses c
    where c.id = journey_phases.course_id
      and c.status = 'published'
      and public.has_course_access(c.id)
  )
);

create policy "journey_phases_admin_all"
on public.journey_phases for all
using (public.is_admin())
with check (public.is_admin());

create policy "user_journey_progress_select_own_or_admin"
on public.user_journey_progress for select
using (user_id = auth.uid() or public.is_admin());

create policy "user_journey_progress_insert_own_with_course_access"
on public.user_journey_progress for insert
with check (
  user_id = auth.uid()
  and public.has_course_access(course_id)
);

create policy "user_journey_progress_update_admin_only"
on public.user_journey_progress for update
using (public.is_admin())
with check (public.is_admin());

with target_course as (
  select id
  from public.courses
  where slug = 'jornada-construtor-elite'
  limit 1
),
phase_rows(phase_number, title, description, position) as (
  values
    (1, 'Clareza e Conhecimento', 'Ponto de partida, diagnóstico e visão estratégica da jornada.', 1),
    (2, 'Crédito e Viabilidade', 'Estruturação de crédito, capital inteligente e análise de viabilidade.', 2),
    (3, 'Terreno e Projeto', 'Escolha do terreno, leitura técnica e estruturação do projeto.', 3),
    (4, 'Execução e Controle', 'Planejamento, orçamento, cronograma e gestão da obra.', 4),
    (5, 'Venda e Lucratividade', 'Estratégia comercial, fechamento e consolidação de lucro.', 5)
)
insert into public.journey_phases (course_id, phase_number, title, description, position)
select target_course.id, phase_rows.phase_number, phase_rows.title, phase_rows.description, phase_rows.position
from target_course
cross join phase_rows
on conflict (course_id, phase_number) do update
set title = excluded.title,
    description = excluded.description,
    position = excluded.position;

insert into public.user_journey_progress (user_id, course_id, current_phase_number)
select e.user_id, e.course_id, 1
from public.enrollments e
join public.courses c on c.id = e.course_id
where c.slug = 'jornada-construtor-elite'
on conflict (user_id, course_id) do nothing;
