"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type UserProfileRole = "student" | "admin";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/alunos");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/cursos");
  }

  return user;
}

export async function createPlatformUser(formData: FormData) {
  const adminUser = await assertAdmin();
  const supabaseAdmin = createAdminClient();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") || "").trim();
  const requestedRole = String(formData.get("role") || "student");
  const role: UserProfileRole = requestedRole === "admin" ? "admin" : "student";

  if (!email || !fullName) {
    redirect("/admin/alunos?created=invalid");
  }

  const { data: course } = await supabaseAdmin
    .from("courses")
    .select("id")
    .eq("status", "published")
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!course) {
    redirect("/admin/alunos?created=no-course");
  }

  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers.users.find((item) => item.email?.toLowerCase() === email);
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/definir-senha`;
  const invitedUser =
    existingUser ||
    (
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName, role },
        redirectTo
      })
    ).data.user;

  if (!invitedUser?.id) {
    redirect("/admin/alunos?created=error");
  }

  await supabaseAdmin.from("profiles").upsert({
    id: invitedUser.id,
    full_name: fullName,
    role,
    updated_at: new Date().toISOString()
  });

  await supabaseAdmin.from("enrollments").upsert(
    {
      user_id: invitedUser.id,
      course_id: course.id,
      granted_by: adminUser.id
    },
    { onConflict: "user_id,course_id" }
  );

  await supabaseAdmin.from("user_journey_progress").upsert(
    {
      user_id: invitedUser.id,
      course_id: course.id,
      current_phase_number: 1,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,course_id" }
  );

  revalidatePath("/admin/alunos");
  redirect(`/admin/alunos?created=${existingUser ? "updated" : "invited"}`);
}

export async function deletePlatformUser(formData: FormData) {
  const adminUser = await assertAdmin();
  const supabaseAdmin = createAdminClient();
  const userId = String(formData.get("user_id") || "");

  if (!userId) {
    redirect("/admin/alunos?deleted=invalid");
  }

  if (userId === adminUser.id) {
    redirect("/admin/alunos?deleted=self");
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    redirect("/admin/alunos?deleted=error");
  }

  revalidatePath("/admin/alunos");
  redirect("/admin/alunos?deleted=success");
}
