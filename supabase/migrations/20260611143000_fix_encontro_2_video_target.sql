update public.lessons l
set video_provider = 'google_drive',
    video_ref = '1OtAgnm513Ece_xdvyRkzZitdZL3uWBOQ',
    video_url = 'https://drive.google.com/file/d/1OtAgnm513Ece_xdvyRkzZitdZL3uWBOQ/preview'
from public.modules m
join public.courses c on c.id = m.course_id
where l.module_id = m.id
  and c.slug = 'jornada-construtor-elite'
  and l.position = 3;
