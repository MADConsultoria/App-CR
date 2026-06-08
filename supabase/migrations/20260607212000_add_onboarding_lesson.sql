with target_module as (
  select m.id
  from public.modules m
  join public.courses c on c.id = m.course_id
  where c.slug = 'jornada-construtor-elite'
    and m.title = 'Trilha principal'
  limit 1
),
shift_lessons as (
  update public.lessons l
  set position = position + 1
  from target_module
  where l.module_id = target_module.id
  returning l.id
)
insert into public.lessons (module_id, title, position, description)
select id, 'Encontro #0 - Onboarding', 1, 'Boas-vindas, orientacoes iniciais e preparacao para a trilha.'
from target_module;
