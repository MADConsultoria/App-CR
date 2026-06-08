with target_lesson as (
  select l.id
  from public.lessons l
  join public.modules m on m.id = l.module_id
  join public.courses c on c.id = m.course_id
  where c.slug = 'jornada-construtor-elite'
    and l.title = 'Encontro #0 - Onboarding'
  limit 1
),
target_activity as (
  insert into public.lesson_activities (lesson_id, title, description, status, position)
  select
    id,
    'Termo de Compromisso do Construtor de Riqueza',
    $manifesto$
Eu, declaro que, neste momento, estou dando um passo importante na construção do meu futuro.

Ao ingressar na Mentoria Construtores de Riqueza, compreendo que não estou apenas adquirindo conhecimento sobre construção civil, crédito imobiliário ou investimentos. Estou assumindo o compromisso de me tornar uma pessoa capaz de transformar oportunidades em patrimônio, conhecimento em ação e projetos em resultados concretos.

Reconheço que muitos sonham em construir riqueza, mas poucos estão dispostos a assumir a responsabilidade necessária para torná-la realidade. Hoje, escolho fazer parte desse grupo.

Entendo que os mentores me fornecerão direção, experiência, metodologia e acesso a oportunidades que talvez eu não alcançasse sozinho. Porém, também compreendo que nenhum mentor pode caminhar por mim, tomar decisões por mim ou executar aquilo que somente eu posso executar.

A Mentoria Construtores de Riqueza será o mapa.

Mas eu sou o responsável por percorrer o caminho.

A estratégia será apresentada.

Mas a execução dependerá das minhas atitudes.

As oportunidades existirão.

Mas caberá a mim aproveitá-las.

Diante disso, assumo os seguintes compromissos:

COMPROMISSO COM A PRESENÇA

Comprometo-me a estar presente física e mentalmente nos encontros, atividades e desafios propostos pela mentoria.

Entendo que cada encontro representa a oportunidade de evitar erros que custam tempo, dinheiro e energia.

Não participarei como espectador.

Participarei como alguém que está construindo seu futuro.

COMPROMISSO COM A EXECUÇÃO

Reconheço que riqueza não é construída através do conhecimento acumulado, mas através do conhecimento aplicado.

Comprometo-me a agir.

A analisar oportunidades.

A realizar pesquisas.

A conversar com profissionais.

A organizar minha documentação.

A buscar crédito.

A fazer perguntas.

A tomar decisões.

A avançar.

Mesmo quando sentir medo, insegurança ou incerteza.

COMPROMISSO COM A RESPONSABILIDADE

Assumo total responsabilidade pelos resultados do meu projeto.

Não transferirei para o mercado, para a economia, para os bancos ou para terceiros a responsabilidade pelas minhas escolhas.

Buscarei orientação quando necessário, mas serei protagonista da minha própria jornada.

COMPROMISSO COM A ÉTICA E COM A COMUNIDADE

Reconheço que estou entrando em uma comunidade formada por pessoas que compartilham objetivos semelhantes.

Comprometo-me a agir com honestidade, respeito e profissionalismo.

Compartilharei experiências, aprendizados e conquistas, contribuindo para fortalecer o ecossistema dos Construtores de Riqueza.

COMPROMISSO COM A CONCLUSÃO

Comprometo-me a não abandonar meus objetivos diante das primeiras dificuldades.

Entendo que toda construção enfrenta desafios, atrasos, imprevistos e obstáculos.

Mas também compreendo que aqueles que constroem patrimônio não são os que nunca enfrentam dificuldades.

São aqueles que continuam avançando apesar delas.

DECLARAÇÃO FINAL

Hoje eu assumo um compromisso que vai além desta mentoria.

Assumo um compromisso comigo mesmo.

Comprometo-me a desenvolver a disciplina para agir quando outros desistirem.

A coragem para tomar decisões quando outros hesitarem.

E a perseverança para concluir aquilo que comecei.

Que esta assinatura represente o início de uma nova fase da minha trajetória.

Uma fase em que deixo de apenas admirar histórias de sucesso para começar a construir a minha própria.
$manifesto$,
    'published',
    1
  from target_lesson
  returning id
),
question_rows(section_title, label, question_key, question_type, is_required, position, metadata) as (
  values
    ('Identificação', 'Nome completo', 'nome_completo', 'text'::public.activity_question_type, true, 1, '{}'::jsonb),
    ('Identificação', 'Data', 'data_assinatura', 'text'::public.activity_question_type, true, 2, '{"placeholder":"DD/MM/2026"}'::jsonb),
    ('Identificação', 'Local', 'local_assinatura', 'text'::public.activity_question_type, true, 3, '{}'::jsonb),
    ('Assinatura', 'Declaro que li e assumo o Termo de Compromisso do Construtor de Riqueza.', 'assinatura_termo', 'boolean'::public.activity_question_type, true, 4, '{"display":"checkbox"}'::jsonb)
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
