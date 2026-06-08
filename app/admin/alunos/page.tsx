import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/cursos/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createPlatformUser } from "./actions";
import { DeleteUserForm } from "./delete-user-form";

type AdminStudentsPageProps = {
  searchParams: Promise<{ created?: string; deleted?: string }>;
};

export default async function AdminStudentsPage({ searchParams }: AdminStudentsPageProps) {
  const { created, deleted } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/alunos");
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/cursos");
  }

  const supabaseAdmin = createAdminClient();
  const [{ data: profiles }, { data: submissions }, { data: courses }, authUsers] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: false }),
    supabaseAdmin.from("activity_submissions").select("user_id, status"),
    supabaseAdmin.from("courses").select("id").eq("status", "published").order("position", { ascending: true }).limit(1),
    supabaseAdmin.auth.admin.listUsers()
  ]);

  const emailById = new Map(authUsers.data.users.map((item) => [item.id, item.email || "Sem e-mail"]));
  const totalPublishedActivities = 29;
  const submissionStats = new Map<string, { drafts: number; submitted: number }>();

  for (const submission of submissions || []) {
    const current = submissionStats.get(submission.user_id) || { drafts: 0, submitted: 0 };
    if (submission.status === "submitted" || submission.status === "reviewed") {
      current.submitted += 1;
    } else if (submission.status === "draft") {
      current.drafts += 1;
    }
    submissionStats.set(submission.user_id, current);
  }

  const courseId = courses?.[0]?.id;
  const adminName = profile?.full_name || user.email || "Administrador";

  return (
    <div className="appFrame">
      <aside className="sideNav">
        <div className="sideBrand">
          <img alt="CR Mentoria" src="/assets/cr-mentoria-logo.png" />
        </div>

        <nav className="navList" aria-label="Administração">
          <Link className="navItem" href="/cursos">
            <span className="material-symbols-outlined">architecture</span>
            <span>Mentoria</span>
          </Link>
          <Link className="navItem active" href="/admin/alunos">
            <span className="material-symbols-outlined">group</span>
            <span>Usuários</span>
          </Link>
          <div className="navItem locked" aria-disabled="true">
            <span className="material-symbols-outlined">lock</span>
            <span>Projetos</span>
          </div>
        </nav>

        <div className="sideUser">
          <div className="avatar">{adminName.slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{adminName}</strong>
            <span>Administrador</span>
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
            <p className="eyebrow">Administração</p>
            <h1>Usuários</h1>
          </div>
        </header>

        <section className="adminPanel">
          <div>
            <h2>Novo usuário</h2>
            <p>Envie o convite pelo Supabase Auth e defina se o perfil será aluno ou administrador.</p>
          </div>

          {created ? <div className="savedNotice">{translateCreateMessage(created)}</div> : null}
          {deleted ? <div className="savedNotice">{translateDeleteMessage(deleted)}</div> : null}

          <form action={createPlatformUser} className="adminForm">
            <label className="field">
              <span>Nome completo</span>
              <input name="full_name" placeholder="Nome do usuário" required type="text" />
            </label>
            <label className="field">
              <span>E-mail</span>
              <input name="email" placeholder="usuario@email.com" required type="email" />
            </label>
            <label className="field">
              <span>Perfil</span>
              <select defaultValue="student" name="role" required>
                <option value="student">Aluno</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="primaryButton" type="submit">
              Enviar convite
              <span className="material-symbols-outlined">outgoing_mail</span>
            </button>
          </form>
        </section>

        <section className="coursesSection">
          <div className="sectionHeader">
            <h2>Lista de usuários</h2>
          </div>

          <div className="studentTable">
            {(profiles || []).map((student) => {
              const stats = submissionStats.get(student.id) || { drafts: 0, submitted: 0 };
              const progress = Math.round((stats.submitted / totalPublishedActivities) * 100);
              const studentName = student.full_name || "Usuário sem nome";

              return (
                <article className="studentRow" key={student.id}>
                  <div className="studentIdentity">
                    <div className="avatar">{studentName.slice(0, 1).toUpperCase()}</div>
                    <div>
                      <strong>{studentName}</strong>
                      <span>{emailById.get(student.id)}</span>
                    </div>
                  </div>
                  <div className="studentMetric">
                    <span>Conclusão</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="studentMetric">
                    <span>Perfil</span>
                    <strong>{student.role === "admin" ? "Admin" : "Aluno"}</strong>
                  </div>
                  <div className="studentActions">
                    <Link href={`/admin/alunos/${student.id}`}>Ver dados</Link>
                    {courseId ? <Link href={`/cursos?aluno=${student.id}`}>Visualizar como aluno</Link> : null}
                    <DeleteUserForm disabled={student.id === user.id} userId={student.id} userName={studentName} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function translateCreateMessage(value: string) {
  if (value === "invited") {
    return "Convite enviado por e-mail com sucesso.";
  }
  if (value === "updated") {
    return "Usuário já existia. Perfil e acesso foram atualizados.";
  }
  if (value === "invalid") {
    return "Preencha nome, e-mail e perfil do usuário.";
  }
  if (value === "no-course") {
    return "Nenhum curso publicado foi encontrado para matrícula automática.";
  }
  if (value === "invite-error") {
    return "Não foi possível enviar o convite pelo Supabase. Verifique os redirects de Auth e os logs do Dockploy.";
  }
  if (value === "list-error") {
    return "Não foi possível consultar os usuários no Supabase Auth. Verifique a service role.";
  }
  if (value === "profile-error") {
    return "O usuário foi criado, mas não foi possível salvar o perfil. Verifique as permissões do banco.";
  }
  if (value === "enrollment-error") {
    return "O usuário foi criado, mas não foi possível matricular na turma.";
  }
  if (value === "progress-error") {
    return "O usuário foi criado, mas não foi possível iniciar a jornada na Fase 1.";
  }
  return "Não foi possível enviar o convite. Verifique os dados e tente novamente.";
}

function translateDeleteMessage(value: string) {
  if (value === "success") {
    return "Usuário excluído com sucesso.";
  }
  if (value === "self") {
    return "Você não pode excluir o próprio usuário administrador.";
  }
  if (value === "invalid") {
    return "Usuário inválido para exclusão.";
  }
  return "Não foi possível excluir o usuário. Verifique no Supabase e tente novamente.";
}
