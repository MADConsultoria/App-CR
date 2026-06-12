import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActivityForm } from "./activity-form";

type ActivityPageParams = {
  courseSlug: string;
  lessonId: string;
  activityId: string;
};

export default async function ActivityPage({
  params,
  searchParams
}: {
  params: Promise<ActivityPageParams>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { courseSlug, lessonId, activityId } = await params;
  const { saved } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/cursos/${courseSlug}/aulas/${lessonId}/atividades/${activityId}`);
  }

  const { data: activity } = await supabase
    .from("lesson_activities")
    .select(
      "id, title, description, status, lesson_id, activity_questions(id, section_title, label, help_text, question_key, question_type, is_required, position, metadata)"
    )
    .eq("id", activityId)
    .single();

  if (!activity) {
    notFound();
  }

  const { data: submission } = await supabase
    .from("activity_submissions")
    .select("id, status, activity_answers(question_id, value_text, value_number, value_boolean, value_json)")
    .eq("activity_id", activityId)
    .eq("user_id", user.id)
    .maybeSingle();

  const answersByQuestion = new Map(
    (submission?.activity_answers || []).map((answer) => [answer.question_id, answer])
  );

  const questions = [...(activity.activity_questions || [])]
    .sort((a, b) => a.position - b.position)
    .map((question) => ({
      ...question,
      metadata: (question.metadata || {}) as Record<string, unknown>,
      answer: answersByQuestion.get(question.id)
        ? {
            value_text: answersByQuestion.get(question.id)?.value_text || null,
            value_number: answersByQuestion.get(question.id)?.value_number
              ? Number(answersByQuestion.get(question.id)?.value_number)
              : null,
            value_boolean: answersByQuestion.get(question.id)?.value_boolean ?? null,
            value_json: (answersByQuestion.get(question.id)?.value_json || null) as Record<string, string> | null
          }
        : undefined
    }));

  const isCompleted = submission?.status === "submitted" || submission?.status === "reviewed";
  const statusLabel = isCompleted ? "Concluída" : submission?.status === "draft" ? "Rascunho salvo" : "Não iniciada";

  return (
    <div className="activityExperience">
      <header className="activityTopbar">
        <Link className="activityBrand" href="/cursos">
          <img alt="CR Mentoria" src="/assets/cr-mentoria-logo.png" />
        </Link>
        <Link className="activityTopbarBack" href={`/cursos/${courseSlug}/aulas/${lessonId}`}>
          <span className="material-symbols-outlined">arrow_back</span>
          Voltar para aula
        </Link>
      </header>

      <main className="activityPage">
        <header className="activityHeader">
          <p className="eyebrow">Atividades e exercícios</p>
          <h1>{activity.title}</h1>
          <p className="activitySubtitle">
            Responda com atenção e transforme o conteúdo da aula em decisões práticas para sua jornada.
          </p>
          {saved === "locked" ? (
            <div className="savedNotice">
              <span className="material-symbols-outlined">lock</span>
              Esta atividade já foi enviada e não pode mais ser alterada.
            </div>
          ) : saved ? (
            <div className="savedNotice">
              <span className="material-symbols-outlined">check_circle</span>
              Atividade salva com sucesso.
            </div>
          ) : null}
        </header>

        <section className="activityProgress" aria-label={`Status da atividade: ${statusLabel}`}>
          <div>
            <strong>Progresso da atividade</strong>
            <span>{statusLabel}</span>
          </div>
          <div className="activityProgressTrack">
            <span className={isCompleted ? "complete" : submission?.status === "draft" ? "draft" : ""} />
          </div>
          <div className="activityProgressSteps" aria-hidden="true">
            <i className="active" />
            <i className={submission?.status ? "active" : ""} />
            <i className={isCompleted ? "active" : ""} />
          </div>
        </section>

        <div className="activityLayout">
          <div className="activityMainColumn">
            {activity.description ? <section className="activityManifesto">{activity.description}</section> : null}

            <ActivityForm
              activityId={activityId}
              courseSlug={courseSlug}
              lessonId={lessonId}
              questions={questions}
              submissionStatus={submission?.status}
            />
          </div>

          <aside className="activityAside">
            <section className="activityGuideCard">
              <span className="material-symbols-outlined activityGuideIcon">assignment</span>
              <p className="eyebrow">Como preencher</p>
              <h2>{isCompleted ? "Atividade concluída" : "Transforme reflexão em ação"}</h2>
              <ul>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  Responda com informações reais do seu momento atual.
                </li>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  Salve como rascunho para continuar depois.
                </li>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  Revise antes de enviar: o envio bloqueia novas edições.
                </li>
              </ul>
              <div className="activityGuideStatus">
                <span>Status atual</span>
                <strong>{statusLabel}</strong>
              </div>
            </section>

            <section className="activityTipCard">
              <span className="material-symbols-outlined">lightbulb</span>
              <div>
                <strong>Dica dos mentores</strong>
                <p>Prefira respostas específicas, com números, prazos e próximos passos sempre que possível.</p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
