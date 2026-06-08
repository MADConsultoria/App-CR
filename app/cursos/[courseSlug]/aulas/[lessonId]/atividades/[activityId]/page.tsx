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

  return (
    <main className="activityPage">
      <header className="activityHeader">
        <Link href={`/cursos/${courseSlug}/aulas/${lessonId}`}>
          <span className="material-symbols-outlined">arrow_back</span>
          Voltar para aula
        </Link>
        <p className="eyebrow">Atividades e Exercícios</p>
        <h1>{activity.title}</h1>
        {saved === "locked" ? (
          <div className="savedNotice">Esta atividade já foi enviada e não pode mais ser alterada.</div>
        ) : saved ? (
          <div className="savedNotice">Atividade salva com sucesso.</div>
        ) : null}
      </header>

      {activity.description ? <section className="activityManifesto">{activity.description}</section> : null}

      <ActivityForm
        activityId={activityId}
        courseSlug={courseSlug}
        lessonId={lessonId}
        questions={questions}
        submissionStatus={submission?.status}
      />
    </main>
  );
}
