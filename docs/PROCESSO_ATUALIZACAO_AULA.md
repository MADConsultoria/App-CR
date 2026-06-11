# Processo para atualizar e liberar uma aula

Use este fluxo sempre que uma nova aula estiver pronta para publicacao.

## Informacoes de entrada

- Numero da aula na plataforma:
- Titulo da aula:
- Link da gravacao no Google Drive:
- Titulo do exercicio:
- Objetivo do exercicio:
- Enunciado e perguntas:
- Campos obrigatorios:
- A aula deve ser liberada imediatamente:

## Prompt operacional

```text
Atualize a aula [NUMERO] da plataforma.

Dados:
- Titulo: [TITULO]
- Video: [LINK_GOOGLE_DRIVE]
- Liberar agora: [SIM/NAO]

Exercicio:
- Titulo: [TITULO_EXERCICIO]
- Objetivo: [OBJETIVO]
- Instrucoes: [INSTRUCOES]
- Perguntas e tipos de resposta:
  1. [PERGUNTA] - [TEXTO/TEXTO_LONGO/NUMERO/DINHEIRO/SIM_NAO/LOCAL]
- Perguntas obrigatorias: [LISTA]

Antes de publicar:
1. Confirme qual registro e posicao correspondem a aula.
2. Valide o arquivo do Drive e converta o link para /preview.
3. Crie uma migration idempotente para o video e o exercicio.
4. Atualize a regra de desbloqueio somente ate a aula solicitada.
5. Rode as verificacoes do projeto e revise o diff.
6. Aplique a migration no Supabase.
7. Faca commit e push para a branch atual.
8. Informe os arquivos alterados, verificacoes e commit publicado.
```

## Criterios de conclusao

- Video abre no player da aula.
- Aula aparece desbloqueada na navegacao.
- Aulas posteriores continuam bloqueadas.
- Exercicio publicado aparece na aula correta.
- Build e validacoes passam.
- Migration aplicada e codigo enviado ao repositorio.
