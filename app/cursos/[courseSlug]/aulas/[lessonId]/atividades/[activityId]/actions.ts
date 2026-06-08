"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Question = {
  id: string;
  question_type: "text" | "long_text" | "number" | "money" | "boolean" | "select" | "location";
};

export async function saveActivitySubmission(
  courseSlug: string,
  lessonId: string,
  activityId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/cursos/${courseSlug}/aulas/${lessonId}/atividades/${activityId}`);
  }

  const submitMode = String(formData.get("_mode") || "draft");
  const status = submitMode === "submitted" ? "submitted" : "draft";

  const { data: questions, error: questionsError } = await supabase
    .from("activity_questions")
    .select("id, question_type")
    .eq("activity_id", activityId);

  if (questionsError) {
    throw new Error("Não foi possível carregar as perguntas da atividade.");
  }

  const { data: existingSubmission } = await supabase
    .from("activity_submissions")
    .select("id, status")
    .eq("activity_id", activityId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingSubmission?.status === "submitted" || existingSubmission?.status === "reviewed") {
    redirect(`/cursos/${courseSlug}/aulas/${lessonId}/atividades/${activityId}?saved=locked`);
  }

  const submittedAt = status === "submitted" ? new Date().toISOString() : null;
  const submissionPayload = {
    activity_id: activityId,
    user_id: user.id,
    status,
    submitted_at: submittedAt,
    updated_at: new Date().toISOString()
  };

  const { data: submission, error: submissionError } = existingSubmission
    ? await supabase
        .from("activity_submissions")
        .update(submissionPayload)
        .eq("id", existingSubmission.id)
        .select("id")
        .single()
    : await supabase.from("activity_submissions").insert(submissionPayload).select("id").single();

  if (submissionError || !submission) {
    throw new Error("Não foi possível salvar a atividade.");
  }

  const answers = (questions as Question[]).map((question) => {
    const rawValue = formData.get(question.id);
    const textValue = typeof rawValue === "string" ? rawValue.trim() : "";

    if (question.question_type === "location") {
      const valueJson = {
        local: String(formData.get(`${question.id}__local`) || "").trim(),
        regiao: String(formData.get(`${question.id}__regiao`) || "").trim(),
        estado: String(formData.get(`${question.id}__estado`) || "").trim(),
        pais: String(formData.get(`${question.id}__pais`) || "").trim()
      };

      return {
        submission_id: submission.id,
        question_id: question.id,
        value_json: valueJson,
        value_text: null,
        value_number: null,
        value_boolean: null,
        updated_at: new Date().toISOString()
      };
    }

    if (question.question_type === "boolean") {
      return {
        submission_id: submission.id,
        question_id: question.id,
        value_boolean: textValue === "true",
        value_text: null,
        value_number: null,
        value_json: null,
        updated_at: new Date().toISOString()
      };
    }

    if (question.question_type === "number" || question.question_type === "money") {
      const normalized = textValue.replace(/\./g, "").replace(",", ".");
      const parsed = normalized ? Number(normalized) : null;

      return {
        submission_id: submission.id,
        question_id: question.id,
        value_number: Number.isFinite(parsed) ? parsed : null,
        value_text: null,
        value_boolean: null,
        value_json: null,
        updated_at: new Date().toISOString()
      };
    }

    return {
      submission_id: submission.id,
      question_id: question.id,
      value_text: textValue || null,
      value_number: null,
      value_boolean: null,
      value_json: null,
      updated_at: new Date().toISOString()
    };
  });

  const { error: answersError } = await supabase.from("activity_answers").upsert(answers, {
    onConflict: "submission_id,question_id"
  });

  if (answersError) {
    throw new Error("Não foi possível salvar as respostas.");
  }

  revalidatePath(`/cursos/${courseSlug}/aulas/${lessonId}/atividades/${activityId}`);
  redirect(`/cursos/${courseSlug}/aulas/${lessonId}/atividades/${activityId}?saved=${status}`);
}
