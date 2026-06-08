update public.courses
set description = 'Domine cada fase da incorporação, do diagnóstico comportamental à escala de investidores.'
where slug = 'jornada-construtor-elite';

update public.modules
set description = 'Sequência completa dos 29 encontros da jornada.'
where title = 'Trilha principal'
  and course_id in (
    select id from public.courses where slug = 'jornada-construtor-elite'
  );

with lesson_titles(position, title) as (
  values
    (1, 'Encontro #0 - Onboarding'),
    (2, 'Encontro 1 - Abertura e visão do jogo imobiliário'),
    (3, 'Encontro 2 - Perfil comportamental aplicado à Construção de Riqueza'),
    (4, 'Encontro 3 - Diagnóstico operacional e posicionamento do mentorado'),
    (5, 'Encontro 4 - Fundamentos do crédito inteligente'),
    (6, 'Encontro 5 - Clareza de objetivos, sonhos e metas'),
    (7, 'Encontro 6 - Como o banco enxerga a operação'),
    (8, 'Encontro 7 - Estrutura da viabilidade econômica'),
    (9, 'Encontro 8 - Introdução à viabilidade imobiliária'),
    (10, 'Encontro 9 - Escolha estratégica do terreno'),
    (11, 'Encontro 10 - Análise técnica do terreno'),
    (12, 'Encontro 11 - Mentalidade de oportunidade e visão de negócio'),
    (13, 'Encontro 12 - Tomada de decisão da operação'),
    (14, 'Encontro 13 - Organização da operação imobiliária'),
    (15, 'Encontro 14 - Planejamento da obra e cronograma'),
    (16, 'Encontro 15 - Processos, eficiência e organização'),
    (17, 'Encontro 16 - Alinhamento estratégico da operação'),
    (18, 'Encontro 17 - Controle financeiro da obra'),
    (19, 'Encontro 18 - Gestão de fornecedores e execução'),
    (20, 'Encontro 19 - Mentalidade de crescimento na execução'),
    (21, 'Encontro 20 - Identificação de oportunidades paralelas'),
    (22, 'Encontro 21 - Regularização e finalização da obra'),
    (23, 'Encontro 22 - Estratégia de venda e posicionamento'),
    (24, 'Encontro 23 - Negociação e fechamento'),
    (25, 'Encontro 24 - Consolidação emocional e decisão de crescimento'),
    (26, 'Encontro 25 - Estruturação de escala'),
    (27, 'Encontro 26 - Parcerias estratégicas e investidores'),
    (28, 'Encontro 27 - Planejamento do próximo ciclo'),
    (29, 'Encontro 28 - Visão de longo prazo e continuidade')
)
update public.lessons l
set title = lesson_titles.title
from lesson_titles
join public.modules m on true
join public.courses c on c.id = m.course_id
where l.module_id = m.id
  and c.slug = 'jornada-construtor-elite'
  and l.position = lesson_titles.position;

update public.lesson_activities
set title = 'Diagnóstico e Mapa do Operador Imobiliário',
    description = 'Responda este diagnóstico para mapear seu ponto de partida, recursos disponíveis e objetivo de crescimento.'
where title = 'Diagnostico e Mapa do Operador Imobiliario';

update public.activity_questions
set section_title = 'Diagnóstico'
where section_title = 'Diagnostico';

update public.activity_questions
set section_title = 'Mapa do Operador Imobiliário'
where section_title = 'Mapa do Operador Imobiliario';

update public.activity_questions
set label = case question_key
  when 'objetivo_financeiro_12_meses' then 'Qual meu objetivo financeiro para os próximos 12 meses?'
  when 'operacoes_por_ano' then 'Quantas operações desejo fazer por ano?'
  when 'tem_capital_proprio' then 'Tenho capital próprio?'
  when 'tem_capacidade_credito' then 'Tenho capacidade de crédito?'
  when 'patrimonio_atual' then 'Patrimônio atual'
  when 'capital_disponivel' then 'Capital disponível'
  when 'capacidade_credito_mapa' then 'Capacidade de crédito'
  when 'valor_capacidade_credito' then 'Valor da capacidade de crédito'
  when 'experiencia_obra' then 'Experiência em obra'
  when 'regiao_atuacao' then 'Região de atuação'
  when 'regiao_texto' then 'Região'
  when 'meta_patrimonio_5_anos' then 'Meta de patrimônio em 5 anos'
  else label
end
where question_key in (
  'objetivo_financeiro_12_meses',
  'operacoes_por_ano',
  'tem_capital_proprio',
  'tem_capacidade_credito',
  'patrimonio_atual',
  'capital_disponivel',
  'capacidade_credito_mapa',
  'valor_capacidade_credito',
  'experiencia_obra',
  'regiao_atuacao',
  'regiao_texto',
  'meta_patrimonio_5_anos'
);
