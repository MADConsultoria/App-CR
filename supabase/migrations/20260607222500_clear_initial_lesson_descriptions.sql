update public.lessons
set description = null
where title in (
  'Encontro #0 - Onboarding',
  'Encontro 1 - Abertura e visao do jogo imobiliario'
)
and module_id in (
  select m.id
  from public.modules m
  join public.courses c on c.id = m.course_id
  where c.slug = 'jornada-construtor-elite'
);
