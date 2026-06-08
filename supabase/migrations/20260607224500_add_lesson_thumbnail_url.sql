alter table public.lessons
add column if not exists thumbnail_url text;

update public.lessons l
set thumbnail_url = '/assets/thumb.jpg'
from public.modules m
join public.courses c on c.id = m.course_id
where l.module_id = m.id
  and c.slug = 'jornada-construtor-elite';
