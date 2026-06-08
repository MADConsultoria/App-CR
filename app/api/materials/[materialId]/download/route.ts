import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ materialId: string }> }
) {
  const { materialId } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", _request.url));
  }

  const { data: material, error } = await supabase
    .from("lesson_materials")
    .select("id, storage_bucket, storage_path, external_url")
    .eq("id", materialId)
    .single();

  if (error || !material) {
    return NextResponse.json({ error: "Material não encontrado." }, { status: 404 });
  }

  if (material.external_url) {
    return NextResponse.redirect(material.external_url);
  }

  if (!material.storage_bucket || !material.storage_path) {
    return NextResponse.json({ error: "Material sem arquivo vinculado." }, { status: 404 });
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(material.storage_bucket)
    .createSignedUrl(material.storage_path, 60);

  if (signedError || !signed?.signedUrl) {
    return NextResponse.json({ error: "Não foi possível gerar o download." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
