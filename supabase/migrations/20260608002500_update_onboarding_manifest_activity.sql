update public.lesson_activities
set title = 'Manifesto de Riqueza',
    description = null
where title = 'Termo de Compromisso do Construtor de Riqueza'
  and lesson_id in (
    select l.id
    from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where c.slug = 'jornada-construtor-elite'
      and l.title = 'Encontro #0 - Onboarding'
  );

update public.activity_questions
set metadata = '{"placeholder":"DD/MM/2026"}'::jsonb
where question_key = 'data_assinatura'
  and activity_id in (
    select la.id
    from public.lesson_activities la
    join public.lessons l on l.id = la.lesson_id
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where c.slug = 'jornada-construtor-elite'
      and l.title = 'Encontro #0 - Onboarding'
  );
