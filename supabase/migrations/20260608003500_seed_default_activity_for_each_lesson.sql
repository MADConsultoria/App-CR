with course_lessons as (
  select l.id as lesson_id, l.position, l.title
  from public.lessons l
  join public.modules m on m.id = l.module_id
  join public.courses c on c.id = m.course_id
  where c.slug = 'jornada-construtor-elite'
),
missing_activity_lessons as (
  select cl.*
  from course_lessons cl
  where not exists (
    select 1
    from public.lesson_activities la
    where la.lesson_id = cl.lesson_id
      and la.status = 'published'
  )
),
inserted_activities as (
  insert into public.lesson_activities (lesson_id, title, description, status, position)
  select
    lesson_id,
    'Confirmação da Aula',
    'Confirme a conclusão desta aula para registrar seu progresso na mentoria.',
    'published',
    1
  from missing_activity_lessons
  returning id
)
insert into public.activity_questions (
  activity_id,
  section_title,
  label,
  question_key,
  question_type,
  is_required,
  position,
  metadata
)
select
  id,
  'Conclusão',
  'Declaro que assisti a aula e concluí esta etapa.',
  'confirmacao_conclusao',
  'boolean'::public.activity_question_type,
  true,
  1,
  '{"display":"checkbox"}'::jsonb
from inserted_activities;
