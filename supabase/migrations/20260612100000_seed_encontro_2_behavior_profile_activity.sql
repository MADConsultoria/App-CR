with target_lesson as (
  select l.id
  from public.lessons l
  join public.modules m on m.id = l.module_id
  join public.courses c on c.id = m.course_id
  where c.slug = 'jornada-construtor-elite'
    and l.position = 3
  limit 1
),
archived_default_activity as (
  update public.lesson_activities la
  set status = 'archived',
      updated_at = now()
  from target_lesson
  where la.lesson_id = target_lesson.id
    and la.title = 'Confirmação da Aula'
  returning la.id
),
target_activity as (
  insert into public.lesson_activities (
    lesson_id,
    title,
    description,
    status,
    position
  )
  select
    id,
    'Com qual perfil você mais se identifica?',
    'Leia as quatro frases e selecione apenas aquela que mais representa a forma como você pensa, age e se relaciona.',
    'published',
    1
  from target_lesson
  where not exists (
    select 1
    from public.lesson_activities la
    where la.lesson_id = target_lesson.id
      and la.title = 'Com qual perfil você mais se identifica?'
  )
  returning id
),
resolved_activity as (
  select id
  from target_activity
  union all
  select la.id
  from public.lesson_activities la
  join target_lesson tl on tl.id = la.lesson_id
  where la.title = 'Com qual perfil você mais se identifica?'
  limit 1
)
insert into public.activity_questions (
  activity_id,
  section_title,
  label,
  help_text,
  question_key,
  question_type,
  is_required,
  position,
  metadata
)
select
  id,
  'Identificação de perfil',
  'Escolha a frase com a qual você mais se identifica',
  'O nome do perfil não será exibido durante a escolha.',
  'perfil_comportamental',
  'select'::public.activity_question_type,
  true,
  1,
  jsonb_build_object(
    'display',
    'cards',
    'options',
    jsonb_build_array(
      jsonb_build_object(
        'value',
        'DOMINÂNTE',
        'label',
        E'Não quero perder muito tempo, por isso vou direto ao assunto.\nSou movido por resultados e desafios me motivam a ir além.\nSe eu parecer impaciente ou direto demais, não leve para o lado pessoal: é apenas minha pressa em fazer as coisas acontecerem.\nDetesto rotina e lentidão, e às vezes meu foco na tarefa me faz esquecer de como me expresso.\nPara trabalhar comigo, seja objetivo e foque na solução.'
      ),
      jsonb_build_object(
        'value',
        'INFLUÊNTE',
        'label',
        E'Adoro estar com pessoas e, para mim, uma boa conversa é o melhor jeito de começar o dia.\nÀs vezes falo demais e posso me perder nos detalhes ou no tempo, mas é porque fico entusiasmado com as ideias e com a interação.\nSe eu parecer exagerado ou se eu interromper você, não é por mal: é apenas minha energia e vontade de participar.\nDetesto isolamento e silêncio prolongado.\nPara me motivar, reconheça meu esforço e me deixe criar e interagir.\nVamos trabalhar juntos e tornar tudo mais divertido?'
      ),
      jsonb_build_object(
        'value',
        'ESTÁTICO',
        'label',
        E'Gosto de harmonia e de saber que todos estão bem.\nPrefiro ambientes calmos e previsíveis, por isso mudanças bruscas me deixam inseguro e preciso de um tempo para processá-las.\nPosso parecer lento para quem tem pressa, mas é porque valorizo a segurança e a consistência no que faço.\nTenho dificuldade em dizer ''não'' e em lidar com conflitos diretos, então, se eu estiver em silêncio, pode ser que eu esteja apenas tentando evitar uma briga.\nSe precisar de mim, saiba que sou leal e um ótimo ouvinte.\nSó não me pressione sem necessidade.'
      ),
      jsonb_build_object(
        'value',
        'CONFORME',
        'label',
        E'Valorizo a precisão, os dados e a qualidade. Para mim, se algo vai ser feito, que seja feito do jeito certo e seguindo as regras.\nPosso parecer frio ou distante, mas é que estou focado nos fatos e na lógica, não nas emoções.\nTenho pavor de cometer erros, por isso reviso tudo várias vezes e faço muitas perguntas: não é falta de confiança em você, é busca pela perfeição.\nDetesto desorganização e falta de critérios.\nPara trabalhar comigo, me dê prazos claros e informações detalhadas.\nSe eu for crítico, entenda que é meu compromisso com a excelência.'
      )
    )
  )
from resolved_activity
on conflict (activity_id, question_key) do update
set section_title = excluded.section_title,
    label = excluded.label,
    help_text = excluded.help_text,
    question_type = excluded.question_type,
    is_required = excluded.is_required,
    position = excluded.position,
    metadata = excluded.metadata;
