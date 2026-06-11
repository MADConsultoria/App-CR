update public.lessons
set video_provider = 'google_drive',
    video_ref = '1OtAgnm513Ece_xdvyRkzZitdZL3uWBOQ',
    video_url = 'https://drive.google.com/file/d/1OtAgnm513Ece_xdvyRkzZitdZL3uWBOQ/preview'
where title = 'Encontro 2 - Perfil comportamental aplicado a Construcao de Riqueza'
  and module_id in (
    select m.id
    from public.modules m
    join public.courses c on c.id = m.course_id
    where c.slug = 'jornada-construtor-elite'
  );
