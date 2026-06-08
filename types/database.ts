export type UserRole = "student" | "admin";
export type CourseStatus = "draft" | "published" | "archived";
export type MaterialType = "pdf" | "spreadsheet" | "document" | "link" | "other";

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  status: CourseStatus;
  position: number;
};

export type LessonMaterial = {
  id: string;
  lesson_id: string;
  title: string;
  material_type: MaterialType;
  storage_bucket: string | null;
  storage_path: string | null;
  external_url: string | null;
  position: number;
};
