# Arquitetura Inicial

## Objetivo

Construir uma biblioteca de conteudo com login, trilhas em video e arquivos para download. O aluno acessa apenas os cursos liberados para ele. O admin gerencia cursos, modulos, aulas, materiais e matriculas.

## Stack

- Next.js para app e rotas protegidas.
- Supabase Auth para login e recuperacao de senha.
- Supabase Postgres para catalogo, permissoes e progresso.
- Supabase Storage para PDFs, planilhas e documentos.
- Plataforma externa para streaming de video.
- Dockploy com Dockerfile para deploy.

## Fluxo das telas

1. `Login`: autentica o usuario no Supabase.
2. `Redefinir_senha`: envia email de recuperacao pelo Supabase Auth.
3. `Home`: lista cursos e trilhas liberadas em `enrollments`.
4. `aula`: exibe video, progresso da trilha e materiais de `lesson_materials`.

## Regras de acesso

- Usuario autenticado ve apenas o proprio perfil.
- Aluno ve apenas cursos publicados e liberados em `enrollments`.
- Aluno ve aulas e materiais apenas dos cursos liberados.
- Admin ve e gerencia todo o catalogo.
- Arquivos privados devem ser entregues por URL assinada.

## Conversao das telas

As telas HTML atuais usam Tailwind CDN. Na conversao para Next.js:

- Mover tokens do `DESIGN.md` para `tailwind.config.ts`.
- Criar componentes compartilhados: `Sidebar`, `MobileNav`, `CourseCard`, `LessonPlayer`, `MaterialList`.
- Substituir links `href="#"` por rotas reais.
- Substituir scripts inline por estado React.
- Conectar formularios ao Supabase Auth.

## Videos

Evite armazenar videos no plano gratuito do Supabase. O recomendado e salvar no banco:

- `video_provider`: `vimeo`, `bunny`, `cloudflare` ou `youtube`.
- `video_ref`: id do video na plataforma.
- `video_url`: URL/embed quando fizer sentido.

Assim o Supabase fica responsavel por acesso e catalogo, e a plataforma de video cuida de banda, player e streaming.
