import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VideoPlayer } from "./video-player";

type LessonRouteParams = {
  courseSlug: string;
  lessonId: string;
};

type LessonActivitySummary = {
  id: string;
  status: string;
};

export default async function LessonPage({ params }: { params: Promise<LessonRouteParams> }) {
  const { courseSlug, lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/cursos/${courseSlug}/aulas/${lessonId}`);
  }

  const { data: course } = await supabase
    .from("courses")
    .select(
      "id, title, slug, description, modules(id, title, position, lessons(id, title, description, video_url, thumbnail_url, duration_seconds, position, lesson_materials(id, title, material_type, external_url, storage_path, position), lesson_activities(id, title, description, status, position)))"
    )
    .eq("slug", courseSlug)
    .single();

  if (!course) {
    notFound();
  }

  const orderedModules = [...(course.modules || [])].sort((a, b) => a.position - b.position);
  const lessons = orderedModules.flatMap((module) =>
    [...(module.lessons || [])]
      .sort((a, b) => a.position - b.position)
      .map((lesson) => ({ ...lesson, moduleTitle: module.title }))
  );
  const currentLesson = lessons.find((lesson) => lesson.id === lessonId) || lessons[0];

  if (!currentLesson) {
    notFound();
  }

  if (lessonId === "inicio") {
    redirect(`/cursos/${course.slug}/aulas/${currentLesson.id}`);
  }

  const currentIndex = lessons.findIndex((lesson) => lesson.id === currentLesson.id);
  const unlockedLessons = lessons.filter((lesson) => lesson.position < 3);

  if (currentLesson.position >= 3) {
    redirect(`/cursos/${course.slug}/aulas/${unlockedLessons[0]?.id || "inicio"}`);
  }

  const materials = [...(currentLesson.lesson_materials || [])].sort((a, b) => a.position - b.position);
  const activities = [...(currentLesson.lesson_activities || [])]
    .filter((activity) => activity.status === "published")
    .sort((a, b) => a.position - b.position);
  const activityIds = lessons.flatMap((lesson) =>
    ((lesson.lesson_activities || []) as LessonActivitySummary[])
      .filter((activity) => activity.status === "published")
      .map((activity) => activity.id)
  );
  const { data: submissions } =
    activityIds.length > 0
      ? await supabase
          .from("activity_submissions")
          .select("activity_id, status")
          .eq("user_id", user.id)
          .in("activity_id", activityIds)
      : { data: [] };
  const submissionsByActivity = new Map((submissions || []).map((submission) => [submission.activity_id, submission.status]));

  function getLessonActivityState(lesson: (typeof lessons)[number]) {
    const lessonActivities = ((lesson.lesson_activities || []) as LessonActivitySummary[]).filter(
      (activity) => activity.status === "published"
    );

    if (lessonActivities.length === 0) {
      return "none";
    }

    const statuses = lessonActivities.map((activity) => submissionsByActivity.get(activity.id));

    if (statuses.every((status) => status === "submitted" || status === "reviewed")) {
      return "submitted";
    }

    if (statuses.some((status) => status === "draft")) {
      return "draft";
    }

    return "not_started";
  }

  const totalPublishedActivities = lessons.reduce(
    (total, lesson) =>
      total +
      ((lesson.lesson_activities || []) as LessonActivitySummary[]).filter((activity) => activity.status === "published")
        .length,
    0
  );
  const submittedActivities = activityIds.filter((activityId) => {
    const status = submissionsByActivity.get(activityId);
    return status === "submitted" || status === "reviewed";
  }).length;
  const progress =
    totalPublishedActivities > 0 ? Math.round((submittedActivities / totalPublishedActivities) * 100) : 0;

  return (
    <>
      <header className="lessonTopbar">
        <Link className="lessonBrand" href="/cursos">
          <img alt="CR Mentoria" src="/assets/cr-mentoria-logo.png" />
        </Link>
        <div className="lessonTopActions">
          <span className="lessonAvatar">{user.email?.slice(0, 1).toUpperCase()}</span>
        </div>
      </header>

      <main className="lessonShell">
        <section className="lessonContent">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <span>Curso</span>
            <span className="material-symbols-outlined">chevron_right</span>
            <span>{currentLesson.moduleTitle}</span>
            <span className="material-symbols-outlined">chevron_right</span>
            <strong>{currentLesson.title}</strong>
          </nav>

          <div className="videoFrame">
            <VideoPlayer
              thumbnailUrl={currentLesson.thumbnail_url || "/assets/thumb.jpg"}
              title={currentLesson.title}
              videoUrl={currentLesson.video_url}
            />
          </div>

          <div className="lessonTitleRow">
            <div>
              <h1>{currentLesson.title}</h1>
            </div>
          </div>

          <section className="lessonTabs" aria-label="Detalhes da aula">
            <div className="activityList">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <article className="activityCard" key={activity.id}>
                    <div>
                      <span className="material-symbols-outlined">assignment</span>
                    </div>
                    <div>
                      <strong>{activity.title}</strong>
                      <p>{activity.description || "Responda à atividade proposta para esta aula."}</p>
                    </div>
                    <Link href={`/cursos/${course.slug}/aulas/${currentLesson.id}/atividades/${activity.id}`}>
                      Responder
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                  </article>
                ))
              ) : (
                <div className="activityEmpty">
                  <span className="material-symbols-outlined">assignment_late</span>
                  <p>Nenhuma atividade cadastrada para esta aula ainda.</p>
                </div>
              )}
            </div>

            <div className="downloadsList">
              {materials.length > 0 ? (
                materials.map((material) => (
                  <a
                    className="downloadItem"
                    href={material.external_url || `/api/materials/${material.id}/download`}
                    key={material.id}
                  >
                    <span className="material-symbols-outlined">
                      {material.material_type === "pdf" ? "picture_as_pdf" : "table_view"}
                    </span>
                    <div>
                      <strong>{material.title}</strong>
                      <small>{material.material_type}</small>
                    </div>
                    <span className="material-symbols-outlined">download</span>
                  </a>
                ))
              ) : (
                <div className="downloadEmpty">
                  <span className="material-symbols-outlined">folder_open</span>
                  <p>Nenhum material cadastrado para esta aula ainda.</p>
                </div>
              )}
            </div>
          </section>
        </section>

        <aside className="lessonSidebar">
          <div className="sidebarHeader">
            <div>
              <h2>Conteúdo do Curso</h2>
              <div className="miniProgress">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
            <small>{progress}% concluído</small>
          </div>

          <div className="lessonList">
            {orderedModules.map((module) => (
              <section className="moduleBlock" key={module.id}>
                <div className="moduleHeader">
                  <span>{module.title}</span>
                  <span className="material-symbols-outlined">expand_less</span>
                </div>
                <div>
                  {[...(module.lessons || [])]
                    .sort((a, b) => a.position - b.position)
                    .map((lesson) => {
                      const isCurrent = lesson.id === currentLesson.id;
                      const isCompleted = lessons.findIndex((item) => item.id === lesson.id) < currentIndex;
                      const isLocked = lesson.position >= 3;
                      const activityState = getLessonActivityState(lesson);
                      const lessonIcon =
                        activityState === "submitted"
                          ? "check_circle"
                          : activityState === "draft"
                            ? "radio_button_unchecked"
                            : activityState === "not_started"
                              ? "radio_button_unchecked"
                              : isCurrent
                                ? "play_circle"
                                : isCompleted
                                  ? "check_circle"
                                  : "radio_button_unchecked";

                      if (isLocked) {
                        return (
                          <div className="sidebarLesson locked" key={lesson.id}>
                            <span className="material-symbols-outlined">lock</span>
                            <span>{lesson.title}</span>
                          </div>
                        );
                      }

                      return (
                        <Link
                          className={isCurrent ? "sidebarLesson current" : "sidebarLesson"}
                          href={`/cursos/${course.slug}/aulas/${lesson.id}`}
                          key={lesson.id}
                        >
                          <span className={`material-symbols-outlined lessonStatusIcon ${activityState}`}>
                            {lessonIcon}
                          </span>
                          <span>{lesson.title}</span>
                        </Link>
                      );
                    })}
                </div>
              </section>
            ))}
          </div>
        </aside>
      </main>
    </>
  );
}
