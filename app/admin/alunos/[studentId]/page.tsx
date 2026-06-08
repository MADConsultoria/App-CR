import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type StudentDetailsPageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function StudentDetailsPage({ params }: StudentDetailsPageProps) {
  const { studentId } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/admin/alunos/${studentId}`);
  }

  const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (adminProfile?.role !== "admin") {
    redirect("/cursos");
  }

  const supabaseAdmin = createAdminClient();
  const [{ data: student }, { data: submissions }, authUser] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, full_name, created_at").eq("id", studentId).maybeSingle(),
    supabaseAdmin
      .from("activity_submissions")
      .select(
        "id, status, submitted_at, updated_at, lesson_activities(title, lessons(title)), activity_answers(value_text, value_number, value_boolean, value_json, activity_questions(label, question_type, position))"
      )
      .eq("user_id", studentId)
      .order("updated_at", { ascending: false }),
    supabaseAdmin.auth.admin.getUserById(studentId)
  ]);

  if (!student) {
    redirect("/admin/alunos");
  }

  return (
    <main className="activityPage adminDetails">
      <header className="activityHeader">
        <Link href="/admin/alunos">
          <span className="material-symbols-outlined">arrow_back</span>
          Voltar para alunos
        </Link>
        <p className="eyebrow">Dados do aluno</p>
        <h1>{student.full_name || authUser.data.user?.email || "Aluno"}</h1>
        <Link className="mirrorButton" href={`/cursos?aluno=${student.id}`}>
          Visualizar home espelhada
          <span className="material-symbols-outlined">visibility</span>
        </Link>
      </header>

      <section className="adminPanel">
        <div className="studentProfileGrid">
          <div>
            <span>Nome</span>
            <strong>{student.full_name || "Não informado"}</strong>
          </div>
          <div>
            <span>E-mail</span>
            <strong>{authUser.data.user?.email || "Sem e-mail"}</strong>
          </div>
          <div>
            <span>Criado em</span>
            <strong>{new Date(student.created_at).toLocaleDateString("pt-BR")}</strong>
          </div>
        </div>
      </section>

      <section className="coursesSection">
        <div className="sectionHeader">
          <h2>Atividades respondidas</h2>
        </div>

        <div className="submissionList">
          {(submissions || []).map((submission) => {
            const activity = Array.isArray(submission.lesson_activities)
              ? submission.lesson_activities[0]
              : submission.lesson_activities;
            const lesson = Array.isArray(activity?.lessons) ? activity?.lessons[0] : activity?.lessons;
            const answers = [...(submission.activity_answers || [])].sort((a, b) => {
              const questionA = Array.isArray(a.activity_questions) ? a.activity_questions[0] : a.activity_questions;
              const questionB = Array.isArray(b.activity_questions) ? b.activity_questions[0] : b.activity_questions;
              return (questionA?.position || 0) - (questionB?.position || 0);
            });

            return (
              <article className="submissionCard" key={submission.id}>
                <header>
                  <div>
                    <span>{lesson?.title || "Aula"}</span>
                    <strong>{activity?.title || "Atividade"}</strong>
                  </div>
                  <small>{translateStatus(submission.status)}</small>
                </header>

                <div className="answerList">
                  {answers.map((answer, index) => {
                    const question = Array.isArray(answer.activity_questions)
                      ? answer.activity_questions[0]
                      : answer.activity_questions;

                    return (
                      <div className="answerItem" key={`${submission.id}-${index}`}>
                        <span>{question?.label || "Pergunta"}</span>
                        <strong>{formatAnswer(answer)}</strong>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}

          {!submissions?.length ? (
            <div className="emptyState">
              <span className="material-symbols-outlined">assignment_late</span>
              <h3>Nenhuma atividade respondida</h3>
              <p>As respostas aparecerão aqui quando o aluno salvar ou enviar atividades.</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function formatAnswer(answer: {
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  value_json: Record<string, string> | null;
}) {
  if (answer.value_text) {
    return answer.value_text;
  }
  if (answer.value_number !== null) {
    return String(answer.value_number);
  }
  if (answer.value_boolean !== null) {
    return answer.value_boolean ? "Sim" : "Não";
  }
  if (answer.value_json) {
    return Object.values(answer.value_json).filter(Boolean).join(", ") || "Sem resposta";
  }
  return "Sem resposta";
}

function translateStatus(status: string) {
  if (status === "submitted") {
    return "Enviada";
  }
  if (status === "reviewed") {
    return "Revisada";
  }
  return "Rascunho";
}
