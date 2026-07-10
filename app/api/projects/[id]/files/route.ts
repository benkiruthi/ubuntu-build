import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "../../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("project_files")
    .select("id, name, file_type, mime_type, size_bytes, storage_path, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const maxBytes = 20 * 1024 * 1024; // 20 MB
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const storagePath = `${user.id}/${id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const { error: uploadError } = await supabase.storage
    .from("project-files")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const fileType = ["pdf", "doc", "docx"].includes(ext)
    ? "document"
    : ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)
    ? "image"
    : ["dwg", "dxf", "rvt"].includes(ext)
    ? "cad"
    : "other";

  const service = await createServiceClient();
  const { data: record, error: dbError } = await service
    .from("project_files")
    .insert({
      project_id: id,
      uploaded_by: user.id,
      name: file.name,
      file_type: fileType,
      mime_type: file.type,
      size_bytes: file.size,
      storage_path: storagePath,
    })
    .select("id, name, file_type, mime_type, size_bytes, storage_path, created_at")
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json(record, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");
  if (!fileId) return NextResponse.json({ error: "Missing fileId" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const service = await createServiceClient();
  const { data: fileRecord } = await service
    .from("project_files")
    .select("storage_path")
    .eq("id", fileId)
    .eq("project_id", id)
    .single();

  if (!fileRecord) return NextResponse.json({ error: "File not found" }, { status: 404 });

  await supabase.storage.from("project-files").remove([fileRecord.storage_path]);
  await service.from("project_files").delete().eq("id", fileId);

  return new NextResponse(null, { status: 204 });
}
