import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const storagePath = searchParams.get("path");
  if (!storagePath) return NextResponse.json({ error: "Missing path" }, { status: 400 });

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

  const { data, error } = await supabase.storage
    .from("project-files")
    .createSignedUrl(storagePath, 3600); // 1 hour

  if (error || !data) return NextResponse.json({ error: "Could not generate URL" }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl });
}
