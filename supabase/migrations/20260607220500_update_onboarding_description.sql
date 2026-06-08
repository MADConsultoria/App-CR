update public.lessons
set description = $description$
Este vídeo marca o início da nossa jornada de 6 meses focada na construção de patrimônio, inteligência financeira e visão prática de negócios no setor imobiliário. O objetivo deste encontro inaugural é alinhar as expectativas e estabelecer as bases metodológicas do programa, que se distancia de abordagens puramente acadêmicas para priorizar o "aprender fazendo" e a aplicação real em projetos.

O que você aprenderá nesta introdução:

- Visão Geral do Programa: Compreensão da estrutura de acompanhamento, que combina gestão de obras, planejamento estratégico, inteligência comportamental e escala de negócios.
- Pilares de Sustentação: Entendimento dos quatro pilares que regem a mentoria:
-- Direção Estratégica e Crédito: Como navegar o jogo imobiliário, captar recursos e estruturar o crédito de forma inteligente.
-- Gestão Operacional: Planejamento técnico de obras, análise de viabilidade, cronogramas e gestão de fornecedores.
-- Estruturação Legal e Tributária: Fundamentos sobre conformidade, proteção de ativos e otimização fiscal através de estruturas societárias (como SPE e SCP).
-- Inteligência Comportamental: O papel do perfil comportamental e da inteligência emocional na tomada de decisão e na superação de travas para o crescimento.
- Metodologia de Atendimento: Explicação sobre como a mentoria oferece suporte individualizado para avaliar projetos específicos, garantindo que o direcionamento técnico e estratégico seja ajustado à realidade de cada participante.
- Ecossistema de Negócios: A importância do networking e da integração dentro da comunidade para fomentar parcerias comerciais e viabilizar empreendimentos com maior margem de lucro.

Este é o ponto de partida para quem busca não apenas executar obras, mas dominar o processo de incorporação e gestão patrimonial, utilizando a prática como principal ferramenta de aceleração profissional.
$description$
where title = 'Encontro #0 - Onboarding'
  and module_id in (
    select m.id
    from public.modules m
    join public.courses c on c.id = m.course_id
    where c.slug = 'jornada-construtor-elite'
  );
