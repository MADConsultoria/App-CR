with target_lesson as (
  select l.id
  from public.lessons l
  join public.modules m on m.id = l.module_id
  join public.courses c on c.id = m.course_id
  where c.slug = 'jornada-construtor-elite'
    and l.title = 'Encontro 1 - Abertura e visao do jogo imobiliario'
  limit 1
),
target_activity as (
  insert into public.lesson_activities (lesson_id, title, description, status, position)
  select
    id,
    'Diagnostico e Mapa do Operador Imobiliario',
    'Responda este diagnostico para mapear seu ponto de partida, recursos disponiveis e objetivo de crescimento.',
    'published',
    1
  from target_lesson
  returning id
),
question_rows(section_title, label, question_key, question_type, is_required, position, metadata) as (
  values
    ('Diagnostico', 'Onde estou hoje?', 'onde_estou_hoje', 'long_text'::public.activity_question_type, true, 1, '{}'::jsonb),
    ('Diagnostico', 'Qual meu objetivo financeiro para os proximos 12 meses?', 'objetivo_financeiro_12_meses', 'long_text'::public.activity_question_type, true, 2, '{}'::jsonb),
    ('Diagnostico', 'Quantas operacoes desejo fazer por ano?', 'operacoes_por_ano', 'number'::public.activity_question_type, true, 3, '{}'::jsonb),
    ('Diagnostico', 'Tenho capital proprio?', 'tem_capital_proprio', 'boolean'::public.activity_question_type, true, 4, '{}'::jsonb),
    ('Diagnostico', 'Tenho acesso a investidores?', 'tem_acesso_investidores', 'boolean'::public.activity_question_type, true, 5, '{}'::jsonb),
    ('Diagnostico', 'Tenho capacidade de credito?', 'tem_capacidade_credito', 'boolean'::public.activity_question_type, true, 6, '{}'::jsonb),
    ('Diagnostico', 'Qual minha maior dificuldade hoje?', 'maior_dificuldade_hoje', 'long_text'::public.activity_question_type, true, 7, '{}'::jsonb),
    ('Mapa do Operador Imobiliario', 'Renda atual', 'renda_atual', 'money'::public.activity_question_type, true, 8, '{}'::jsonb),
    ('Mapa do Operador Imobiliario', 'Patrimonio atual', 'patrimonio_atual', 'money'::public.activity_question_type, true, 9, '{}'::jsonb),
    ('Mapa do Operador Imobiliario', 'Capital disponivel', 'capital_disponivel', 'money'::public.activity_question_type, true, 10, '{}'::jsonb),
    ('Mapa do Operador Imobiliario', 'Capacidade de credito', 'capacidade_credito_mapa', 'boolean'::public.activity_question_type, true, 11, '{}'::jsonb),
    ('Mapa do Operador Imobiliario', 'Valor da capacidade de credito', 'valor_capacidade_credito', 'money'::public.activity_question_type, false, 12, '{"depends_on":"capacidade_credito_mapa","show_when":true,"required_when_visible":false}'::jsonb),
    ('Mapa do Operador Imobiliario', 'Rede de investidores', 'rede_investidores', 'boolean'::public.activity_question_type, true, 13, '{}'::jsonb),
    ('Mapa do Operador Imobiliario', 'Experiencia em obra', 'experiencia_obra', 'boolean'::public.activity_question_type, true, 14, '{}'::jsonb),
    ('Mapa do Operador Imobiliario', 'Regiao de atuacao', 'regiao_atuacao', 'location'::public.activity_question_type, true, 15, '{"fields":["local","regiao","estado","pais"]}'::jsonb),
    ('Mapa do Operador Imobiliario', 'Regiao', 'regiao_texto', 'text'::public.activity_question_type, false, 16, '{}'::jsonb),
    ('Mapa do Operador Imobiliario', 'Meta de patrimonio em 5 anos', 'meta_patrimonio_5_anos', 'long_text'::public.activity_question_type, true, 17, '{}'::jsonb)
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
  target_activity.id,
  question_rows.section_title,
  question_rows.label,
  question_rows.question_key,
  question_rows.question_type,
  question_rows.is_required,
  question_rows.position,
  question_rows.metadata
from target_activity
cross join question_rows;
