with target_lesson as (
  select l.id
  from public.lessons l
  join public.modules m on m.id = l.module_id
  join public.courses c on c.id = m.course_id
  where c.slug = 'jornada-construtor-elite'
    and l.position = 3
  limit 1
)
insert into public.lesson_materials (
  lesson_id,
  title,
  material_type,
  storage_bucket,
  storage_path,
  position
)
select
  id,
  'Encontro 2 - Perfil comportamental',
  'pdf'::public.material_type,
  'course-materials',
  'f1910118-f9be-48a4-8200-b6f64031b719/lessons/00919272-173a-4a02-b421-cfbb687a804e/encontro-2-perfil-comportamental.pdf',
  1
from target_lesson
where not exists (
  select 1
  from public.lesson_materials lm
  where lm.lesson_id = target_lesson.id
    and lm.storage_path = 'f1910118-f9be-48a4-8200-b6f64031b719/lessons/00919272-173a-4a02-b421-cfbb687a804e/encontro-2-perfil-comportamental.pdf'
);
