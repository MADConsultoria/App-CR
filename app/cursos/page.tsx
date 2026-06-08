import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

type CoursesPageProps = {
  searchParams?: Promise<{ aluno?: string }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { aluno: mirroredStudentId } = (await searchParams) || {};
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/cursos");
  }

  const [{ data: profile }, { data: courses }] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle(),
    supabase
      .from("courses")
      .select(
        "id, title, slug, description, cover_url, status, position, journey_phases(id, phase_number, title, description, position), modules(lessons(id, position))"
      )
      .eq("status", "published")
      .order("position", { ascending: true })
  ]);

  const isAdmin = profile?.role === "admin";
  const mirrorEnabled = Boolean(isAdmin && mirroredStudentId);
  const dataClient = mirrorEnabled ? createAdminClient() : supabase;
  const targetUserId = mirrorEnabled && mirroredStudentId ? mirroredStudentId : user.id;
  const { data: mirroredProfile } = mirrorEnabled
    ? await dataClient.from("profiles").select("full_name, role").eq("id", targetUserId).maybeSingle()
    : { data: null };

  const displayName = mirrorEnabled
    ? mirroredProfile?.full_name || "Aluno espelhado"
    : profile?.full_name || user.email || "Aluno";
  const firstName = displayName.split(" ")[0];
  const primaryCourse = courses?.[0];
  const { data: journeyProgress } = primaryCourse
    ? await dataClient
        .from("user_journey_progress")
        .select("current_phase_number")
        .eq("course_id", primaryCourse.id)
        .eq("user_id", targetUserId)
        .maybeSingle()
    : { data: null };
  const phases =
    primaryCourse?.journey_phases?.sort((a, b) => a.position - b.position) ||
    [
      { id: "1", phase_number: 1, title: "Clareza e Conhecimento", description: null, position: 1 },
      { id: "2", phase_number: 2, title: "Crédito e Viabilidade", description: null, position: 2 },
      { id: "3", phase_number: 3, title: "Terreno e Projeto", description: null, position: 3 },
      { id: "4", phase_number: 4, title: "Execução e Controle", description: null, position: 4 },
      { id: "5", phase_number: 5, title: "Venda e Lucratividade", description: null, position: 5 }
    ];
  const currentPhaseNumber = journeyProgress?.current_phase_number || 1;

  return (
    <div className="appFrame">
      <aside className="sideNav">
        <div className="sideBrand">
          <img alt="CR Mentoria" src="/assets/cr-mentoria-logo.png" />
        </div>

        <nav className="navList" aria-label="Principal">
          <a className="navItem active" href="/cursos">
            <span className="material-symbols-outlined">architecture</span>
            <span>Mentoria</span>
          </a>
          {isAdmin ? (
            <a className="navItem" href="/admin/alunos">
              <span className="material-symbols-outlined">group</span>
              <span>Alunos</span>
            </a>
          ) : null}
          <div className="navItem locked" aria-disabled="true">
            <span className="material-symbols-outlined">lock</span>
            <span>Projetos</span>
          </div>
        </nav>

        <div className="sideUser">
          <div className="avatar">{firstName.slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{displayName}</strong>
            <span>{mirrorEnabled ? "Visualização espelhada" : isAdmin ? "Administrador" : "Aluno"}</span>
          </div>
        </div>

        <form action={signOut}>
          <button className="navItem logout" type="submit">
            <span className="material-symbols-outlined">logout</span>
            <span>Sair</span>
          </button>
        </form>
      </aside>

      <main className="courseMain">
        <header className="courseTopbar">
          <div>
            <p className="eyebrow">Mentoria</p>
            <h1>Construtores de Riqueza</h1>
          </div>
          {mirrorEnabled ? (
            <a className="mirrorButton" href="/admin/alunos">
              <span className="material-symbols-outlined">visibility</span>
              Visualizando {displayName}
            </a>
          ) : null}
        </header>

        <section className="courseHero">
          <div>
            <span className="statusPill">Sua Jornada</span>
          </div>
          <div className="phaseGrid">
            {phases.map((phase) => (
              <article
                className={
                  phase.phase_number === currentPhaseNumber
                    ? "phaseCard active"
                    : phase.phase_number < currentPhaseNumber
                      ? "phaseCard completed"
                      : "phaseCard locked"
                }
                key={phase.id}
              >
                <span className="phaseNumber">Fase {phase.phase_number}</span>
                <strong>{phase.title}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="coursesSection">
          <div className="sectionHeader">
            <h2>Trilhas de Aprendizado</h2>
          </div>

          {courses && courses.length > 0 ? (
            <div className="courseGrid">
              {courses.map((course, index) => {
                const lessons =
                  course.modules?.flatMap((module) => module.lessons || []).sort((a, b) => a.position - b.position) ||
                  [];
                const firstLessonId = lessons[0]?.id || "inicio";

                return (
                  <article className="courseCard" key={course.id}>
                    <div className="courseNumber">{String(index + 1).padStart(2, "0")}</div>
                    <div>
                      <p className="courseStatus">A Jornada</p>
                      <h3>{course.title}</h3>
                      <p>
                        {course.description ||
                          "Domine cada fase para estruturar sua operação imobiliária com método, análise, execução orientada e visão de crescimento."}
                      </p>
                      <span className="lessonCount">{lessons.length} aulas cadastradas</span>
                    </div>
                    <a className="courseButton" href={`/cursos/${course.slug}/aulas/${firstLessonId}`}>
                      Acessar aula
                      <span className="material-symbols-outlined">play_circle</span>
                    </a>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="emptyState">
              <span className="material-symbols-outlined">lock</span>
              <h3>Nenhum curso liberado ainda</h3>
              <p>Quando um curso for publicado e liberado para seu usuário, ele aparecerá aqui.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
