# Build to Sell - Biblioteca de Conteudo

Base para uma plataforma de cursos com login Supabase, trilhas em video e materiais para download.

## Telas recebidas

- `Login/code.html`: tela de login.
- `Redefinir_senha/code.html`: recuperacao de senha.
- `Home/code.html`: biblioteca/trilha de cursos.
- `aula/code.html`: player de aula com downloads e progresso.

Essas telas devem ser convertidas para componentes do app na proxima etapa, preservando o design system de `DESIGN.md`.

## Primeiros passos recomendados

1. Criar o projeto Supabase.
2. Rodar a migracao em `supabase/migrations/20260607203000_initial_lms.sql`.
3. Criar o bucket privado `course-materials` no Supabase Storage.
4. Preencher `.env` a partir de `.env.example`.
5. Converter as quatro telas HTML para rotas reais do app.
6. Publicar pelo Dockploy usando o `Dockerfile`.

## Modelo de produto

Estrutura principal:

```txt
courses
  modules
    lessons
      materials
```

Controle de acesso:

```txt
auth.users
  profiles
  enrollments
  lesson_progress
```

## Rotas sugeridas

- `/login`
- `/redefinir-senha`
- `/cursos`
- `/cursos/[courseId]/aulas/[lessonId]`
- `/admin/cursos`
- `/admin/usuarios`

## Deploy

O `Dockerfile` assume uma aplicacao Next.js. Quando a conversao das telas for feita, o Dockploy pode apontar para este repositorio e usar as variaveis de ambiente listadas em `.env.example`.
