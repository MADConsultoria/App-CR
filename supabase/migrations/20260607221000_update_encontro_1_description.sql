update public.lessons
set description = $description$
Este curso oferece um mergulho profundo na transição necessária para que profissionais da construção civil deixem de ser meros executores de obras e tornem-se operadores imobiliários estratégicos. O foco central é a metodologia de "construção para venda", desenhada para maximizar a liquidez e a escalabilidade através da gestão inteligente de capital.

Neste material, você aprenderá a estruturar modelos de negócios que utilizam a alavancagem bancária como o principal motor de crescimento, reduzindo a dependência de recursos próprios e aumentando a rentabilidade da operação.

O que você aprenderá:
- Estruturação de Negócios: Por que a formalização empresarial robusta é indispensável para o acesso a linhas de crédito de alta capacidade e como superar as limitações de modelos empresariais básicos.
- O Ciclo do Lucro: A ciência por trás do estudo de viabilidade. Aprenda a definir a rentabilidade de um projeto antes mesmo da aquisição do terreno, garantindo que o lucro seja planejado, não apenas uma consequência.
- Gestão Financeira e Orçamentária: A distinção crítica entre estimativas de viabilidade e orçamentos executivos detalhados. Como manter o controle rigoroso dos custos durante toda a execução da obra.
- Alavancagem e Capital Inteligente: Estratégias para utilizar recursos bancários e de investidores de forma eficiente, tratando o empreendimento como um negócio concreto que exige documentação, cronograma impecável e governança.
- Panorama de Mercado: Uma análise atualizada sobre o comportamento do setor, as mudanças nas preferências de moradia e como identificar oportunidades de alto valor em um mercado que demanda, cada vez mais, profissionalismo e técnica.

Este conteúdo é essencial para quem busca construir patrimônio e escala no mercado imobiliário, trocando o "trabalho por contrato" pela previsibilidade e pela construção de um negócio sólido e replicável.
$description$
where title = 'Encontro 1 - Abertura e visao do jogo imobiliario'
  and module_id in (
    select m.id
    from public.modules m
    join public.courses c on c.id = m.course_id
    where c.slug = 'jornada-construtor-elite'
  );
