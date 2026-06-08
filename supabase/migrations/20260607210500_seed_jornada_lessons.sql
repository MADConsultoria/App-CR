with target_course as (
  insert into public.courses (title, slug, description, status, position)
  values (
    'A Jornada do Construtor de Elite',
    'jornada-construtor-elite',
    'Domine cada fase da incorporacao, do diagnostico comportamental a escala de investidores.',
    'published',
    1
  )
  on conflict (slug) do update
  set title = excluded.title,
      description = excluded.description,
      status = excluded.status,
      position = excluded.position
  returning id
),
target_module as (
  insert into public.modules (course_id, title, description, position)
  select id, 'Trilha principal', 'Sequencia completa dos 28 encontros da jornada.', 1
  from target_course
  returning id
),
lesson_rows(title, position) as (
  values
    ('Encontro 1 - Abertura e visao do jogo imobiliario', 1),
    ('Encontro 2 - Perfil comportamental aplicado a Construcao de Riqueza', 2),
    ('Encontro 3 - Diagnostico operacional e posicionamento do mentorado', 3),
    ('Encontro 4 - Fundamentos do credito inteligente', 4),
    ('Encontro 5 - Clareza de objetivos, sonhos e metas', 5),
    ('Encontro 6 - Como o banco enxerga a operacao', 6),
    ('Encontro 7 - Estrutura da viabilidade economica', 7),
    ('Encontro 8 - Introducao a viabilidade imobiliaria', 8),
    ('Encontro 9 - Escolha estrategica do terreno', 9),
    ('Encontro 10 - Analise tecnica do terreno', 10),
    ('Encontro 11 - Mentalidade de oportunidade e visao de negocio', 11),
    ('Encontro 12 - Tomada de decisao da operacao', 12),
    ('Encontro 13 - Organizacao da operacao imobiliaria', 13),
    ('Encontro 14 - Planejamento da obra e cronograma', 14),
    ('Encontro 15 - Processos, eficiencia e organizacao', 15),
    ('Encontro 16 - Alinhamento estrategico da operacao', 16),
    ('Encontro 17 - Controle financeiro da obra', 17),
    ('Encontro 18 - Gestao de fornecedores e execucao', 18),
    ('Encontro 19 - Mentalidade de crescimento na execucao', 19),
    ('Encontro 20 - Identificacao de oportunidades paralelas', 20),
    ('Encontro 21 - Regularizacao e finalizacao da obra', 21),
    ('Encontro 22 - Estrategia de venda e posicionamento', 22),
    ('Encontro 23 - Negociacao e fechamento', 23),
    ('Encontro 24 - Consolidacao emocional e decisao de crescimento', 24),
    ('Encontro 25 - Estruturacao de escala', 25),
    ('Encontro 26 - Parcerias estrategicas e investidores', 26),
    ('Encontro 27 - Planejamento do proximo ciclo', 27),
    ('Encontro 28 - Visao de longo prazo e continuidade', 28)
)
insert into public.lessons (module_id, title, position, description)
select target_module.id, lesson_rows.title, lesson_rows.position, 'Conteudo em preparacao.'
from target_module
cross join lesson_rows;
