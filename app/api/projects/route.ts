import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "../../../lib/supabase/server";
import { createProjectSchema } from "../../../lib/validations/project";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const result = createProjectSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 422 }
    );
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      name: result.data.name,
      project_type: result.data.project_type,
      plot_size_sqm: result.data.plot_size_sqm ?? null,
      budget_kes: result.data.budget_kes ?? null,
      location_county: result.data.location_county ?? null,
      location_area: result.data.location_area ?? null,
      floors: result.data.floors ?? null,
      bedrooms: result.data.bedrooms ?? null,
      brief_data: (result.data.brief_data ?? {}) as import("../../../types/database.types").Json,
      phases_unlocked: ["architect"],
      status: "active",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit log
  const service = await createServiceClient();
  await service.from("audit_logs").insert({
    user_id: user.id,
    action: "create_project",
    resource_type: "project",
    resource_id: project.id,
    metadata: { name: project.name },
  });

  return NextResponse.json(project, { status: 201 });
}
