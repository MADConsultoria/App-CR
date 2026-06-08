update public.lessons
set video_provider = 'google_drive',
    video_ref = '1J_5JzKcYt84im7gTX-sTmFtqkYZJzZeD',
    video_url = 'https://drive.google.com/file/d/1J_5JzKcYt84im7gTX-sTmFtqkYZJzZeD/preview'
where title = 'Encontro #0 - Onboarding'
  and module_id in (
    select m.id
    from public.modules m
    join public.courses c on c.id = m.course_id
    where c.slug = 'jornada-construtor-elite'
  );

update public.lessons
set video_provider = 'google_drive',
    video_ref = '19W7kGsfFVjXozIPP5X2i-u0-8BWzBdSn',
    video_url = 'https://drive.google.com/file/d/19W7kGsfFVjXozIPP5X2i-u0-8BWzBdSn/preview'
where title = 'Encontro 1 - Abertura e visao do jogo imobiliario'
  and module_id in (
    select m.id
    from public.modules m
    join public.courses c on c.id = m.course_id
    where c.slug = 'jornada-construtor-elite'
  );
