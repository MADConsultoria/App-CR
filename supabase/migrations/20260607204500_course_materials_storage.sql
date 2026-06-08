insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-materials',
  'course-materials',
  false,
  52428800,
  array[
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "course_materials_admin_all"
on storage.objects for all
using (
  bucket_id = 'course-materials'
  and public.is_admin()
)
with check (
  bucket_id = 'course-materials'
  and public.is_admin()
);

create policy "course_materials_student_read_enrolled"
on storage.objects for select
using (
  bucket_id = 'course-materials'
  and public.has_course_access(((storage.foldername(name))[1])::uuid)
);
